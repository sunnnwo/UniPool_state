import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const buildDir = join(__dirname, 'build');
const appDir = join(buildDir, '_app/immutable');

const htmlRaw = readFileSync(join(buildDir, 'index.html'), 'utf-8');

// ── 1. Find entry filenames ──────────────────────────────────────────────────
const entryRe = /<link href="\/_app\/immutable\/entry\/([^"]+\.js)" rel="modulepreload">/g;
const entryFiles = [];
let m;
while ((m = entryRe.exec(htmlRaw)) !== null) entryFiles.push(m[1]);
const startFile = entryFiles.find((f) => f.startsWith('start.'));
const appFile = entryFiles.find((f) => f.startsWith('app.'));

// ── 2. Create virtual entry ──────────────────────────────────────────────────
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

// ── 3. Patch vite preload helper ─────────────────────────────────────────────
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

// ── 4. Bundle with esbuild ───────────────────────────────────────────────────
const bundleOut = join(buildDir, '_bundle.js');
execSync(
	`npx --yes esbuild ${virtualEntry} --bundle --format=iife --minify "--define:import.meta.url=location.href" --outfile=${bundleOut}`,
	{ stdio: 'inherit' }
);
unlinkSync(virtualEntry);
if (preloadChunkPath) writeFileSync(preloadChunkPath, preloadOriginal);

const bundleJs = readFileSync(bundleOut, 'utf-8').replace(/<(\/?)script/gi, '<$1\\x73cript');
unlinkSync(bundleOut);

// ── 5. Assemble HTML ─────────────────────────────────────────────────────────
let html = htmlRaw;

// Inline stylesheet links
html = html.replace(
	/<link href="([^"]+\.css)" rel="stylesheet">/g,
	(_, href) => `<style>${readFileSync(join(buildDir, href.replace(/^\//, '')), 'utf-8')}</style>`
);

// Inline extra page-level CSS from assets dir
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

// Patch SvelteKit base so file:// routing works
html = html.replace('base: ""', 'base: location.pathname');

// Disable preload-data on hover: blocked on file:// protocol
html = html.replace('data-sveltekit-preload-data="hover"', 'data-sveltekit-preload-data="off"');

// Patch file:// incompatibilities (history API + fetch intercept)
html = html.replace(
	'</head>',
	`<script>if(location.protocol==='file:'){var _noop=function(){};history.replaceState=_noop;history.pushState=_noop;var _fetch=window.fetch;window.fetch=function(r,o){var u=typeof r==='string'?r:r instanceof Request?r.url:String(r);if(u.startsWith('http://')||u.startsWith('https://'))return _fetch.call(this,r,o);return Promise.resolve(new Response('',{status:404}));};}</script>\n</head>`
);

// Replace SvelteKit init block with inlined bundle
html = html.replace(
	/(const element = document\.currentScript\.parentElement;\s*)Promise\.all\([\s\S]*?\}\s*<\/script>/,
	(_, p1) => `${p1}}\n<\/script>\n<script>${bundleJs}<\/script>`
);

// ── 6. Save ──────────────────────────────────────────────────────────────────
const outPath = join(buildDir, 'dashboard.html');
writeFileSync(outPath, html);
console.log(`✓ ${outPath} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
