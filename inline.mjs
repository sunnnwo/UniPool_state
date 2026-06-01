import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = join(__dirname, 'build');
const appDir = join(buildDir, '_app/immutable');

const htmlRaw = readFileSync(join(buildDir, 'index.html'), 'utf-8');

// ── 1. Find entry filenames ──────────────────────────────────────────────
const entryRe = /<link href="\/_app\/immutable\/entry\/([^"]+\.js)" rel="modulepreload">/g;
const entryFiles = [];
let m;
while ((m = entryRe.exec(htmlRaw)) !== null) entryFiles.push(m[1]);
const startFile = entryFiles.find((f) => f.startsWith('start.'));
const appFile = entryFiles.find((f) => f.startsWith('app.'));

// ── 2. Create virtual entry that preserves SvelteKit's init pattern ──────
// Original pattern:
//   const element = document.currentScript.parentElement;
//   Promise.all([import(start), import(app)]).then(([kit, app]) => kit.start(app, element));
//
// In an ES module, document.currentScript is null, so we target the div directly.
const virtualEntry = join(buildDir, '_entry_virtual.js');
writeFileSync(
	virtualEntry,
	`
import * as kit from "./_app/immutable/entry/${startFile}";
import * as app from "./_app/immutable/entry/${appFile}";
const el = document.querySelector('body > div[style]') || document.body;
kit.start(app, el);
`
);

// ── 3. Patch vite preload helper before bundling ──────────────────────────
// In IIFE format, import.meta.url is undefined. The vite preload helper calls
// new URL(dep, import.meta.url) → throws "Invalid URL". Since everything is
// already bundled into one file, preloading is a no-op anyway — replace it.
const chunksDir = join(appDir, 'chunks');
let preloadChunkPath = null,
	preloadOriginal = null;
for (const f of readdirSync(chunksDir).filter((f) => f.endsWith('.js'))) {
	const src = readFileSync(join(chunksDir, f), 'utf-8');
	if (src.includes('modulepreload') && src.includes('new URL')) {
		preloadChunkPath = join(chunksDir, f);
		preloadOriginal = src;
		writeFileSync(preloadChunkPath, 'export const t=(r)=>r();');
		break;
	}
}

// ── 4. Bundle with esbuild ────────────────────────────────────────────────
// --define:import.meta.url=location.href  →  prevents "Invalid URL" error in
// IIFE mode where import.meta.url is otherwise undefined. The vite preload
// helper calls new URL(dep, import.meta.url); substituting location.href
// gives a valid base URL even on file:// protocol.
const bundleOut = join(buildDir, '_bundle.js');
execSync(
	`npx --yes esbuild ${virtualEntry} --bundle --format=iife --minify "--define:import.meta.url=location.href" --outfile=${bundleOut}`,
	{ stdio: 'inherit' }
);
unlinkSync(virtualEntry);
if (preloadChunkPath) writeFileSync(preloadChunkPath, preloadOriginal);
// Escape <script> and </script> inside JS so they don't break the HTML script tag
const bundleJs = readFileSync(bundleOut, 'utf-8').replace(/<(\/?)script/gi, '<$1\\x73cript');
unlinkSync(bundleOut);

// ── 4. Assemble HTML ──────────────────────────────────────────────────────
let html = htmlRaw;

// Inline stylesheet links
html = html.replace(
	/<link href="([^"]+\.css)" rel="stylesheet">/g,
	(_, href) => `<style>${readFileSync(join(buildDir, href.replace(/^\//, '')), 'utf-8')}</style>`
);

// Inline extra page-level CSS from assets dir (SvelteKit loads these dynamically at runtime)
try {
	const cssFiles = readdirSync(join(appDir, 'assets')).filter((f) => f.endsWith('.css'));
	if (cssFiles.length) {
		const extraCss = cssFiles
			.map((f) => readFileSync(join(appDir, 'assets', f), 'utf-8'))
			.join('\n');
		html = html.replace('</head>', `<style>${extraCss}</style>\n</head>`);
	}
} catch {}

// Remove modulepreload link tags
html = html.replace(/<link href="[^"]+\.js" rel="modulepreload">\n?\t*/g, '');

// Patch SvelteKit base so file:// routing works.
// SvelteKit routes by stripping base from pathname: pathname.slice(base.length) || "/".
// With base="" and pathname="/Users/foo/dashboard.html" → no route match → blank.
// With base=location.pathname → pathname.slice(base.length)="" → fallback "/" → match!
html = html.replace('base: ""', 'base: location.pathname');

// Disable preload-data on hover: on file:// protocol the browser blocks
// cross-origin fetch, and SvelteKit would try to fetch the HTML file itself,
// producing "Unsafe attempt to load URL" + "Unexpected end of input" errors.
html = html.replace('data-sveltekit-preload-data="hover"', 'data-sveltekit-preload-data="off"');

// Patch file:// incompatibilities before the bundle runs.
//
// history.replaceState/pushState — blocked on file:// ("Failed to execute
//   'replaceState' on 'History'"). Single-route bundle so no-op is safe.
//
// fetch intercept — SvelteKit's router internally calls fetch() for the current
//   page URL on init. On file:// the browser blocks it at the security layer
//   ("Unsafe attempt to load URL file://...") before JS even sees the response.
//   Intercepting fetch() and returning an empty JSON response for non-http(s)
//   requests prevents the call from ever reaching the browser's security check.
//   HTTP/HTTPS requests (RPC nodes, DeFiLlama API, etc.) are passed through.
html = html.replace(
	'</head>',
	`<script>if(location.protocol==='file:'){var _noop=function(){};history.replaceState=_noop;history.pushState=_noop;var _fetch=window.fetch;window.fetch=function(r,o){var u=typeof r==='string'?r:r instanceof Request?r.url:String(r);return(u.startsWith('http://')||u.startsWith('https://'))?_fetch.call(this,r,o):Promise.resolve(new Response('{}',{status:200,headers:{'Content-Type':'application/json'}}));};}</script>\n</head>`
);

// Keep the __sveltekit_* global setup, replace only the Promise.all import block.
// Use a function (not a string) as replacement to prevent $ sequences in bundleJs
html = html.replace(
	/<script type="module">[\s\S]+?Promise\.all\(\[import\([^)]+\), import\([^)]+\)\]\)\.then\(\(\[kit, app\]\) => kit\.start\(app, element\)\);[\s\S]+?<\/script>/,
	() => `<script>${bundleJs}<\/script>`
);

// ── 5. Save final HTML ────────────────────────────────────────────────────
writeFileSync(join(buildDir, 'dashboard.html'), html);
console.log(`✅ Bundled to ${join(buildDir, 'dashboard.html')}`);
// from being interpreted as regex replacement references ($1, $&, etc.)
html = html.replace(
	/(const element = document\.currentScript\.parentElement;\s*)Promise\.all\([\s\S]*?\}\s*<\/script>/,
	(_, p1) => `${p1}\n}\n</script>\n<script>\n${bundleJs}\n</script>`
);

const outPath = join(buildDir, 'dashboard.html');
writeFileSync(outPath, html);
console.log(`✓ ${outPath} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
