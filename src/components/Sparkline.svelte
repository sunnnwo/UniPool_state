<script lang="ts">
	// ─── Sparkline.svelte — compact SVG line chart component ────────────────
	// Pure SVG implementation with no external libraries.
	// Renders a values array left (oldest) → right (latest).

	let {
		values,    // array of numbers sorted chronologically (oldest first)
		width = 160,
		height = 50,
		color = '#6366f1'
	}: {
		values: number[];
		width?: number;
		height?: number;
		color?: string;
	} = $props();

	// Prevents SVG gradient ID collisions when multiple Sparklines appear on the same page.
	// Math.random generates a unique ID per instance.
	const uid = Math.random().toString(36).slice(2, 8);

	const pad = 4; // inner padding so the line doesn't touch the SVG edge (px)

	// Pure function that computes SVG coordinates from the given values array.
	// $derived auto-recalculates whenever values/width/height change.
	function buildChart(vals: number[], w: number, h: number) {
		const W = w - pad * 2; // actual chart area width
		const H = h - pad * 2; // actual chart area height

		if (vals.length < 2) {
			return { polyline: '', area: '', lx: pad + W, ly: pad + H / 2 };
		}

		const min = Math.min(...vals);
		const max = Math.max(...vals);
		const rng = max - min || 1; // guard against division by zero when all values are equal → use 1

		// Map each data point → SVG coordinates (x, y)
		// x: left (oldest value) → right (latest value)
		// y: bottom (min) → top (max). SVG y-axis increases downward, so we invert it.
		const pts = vals.map((v, i) => {
			const x = pad + (i / (vals.length - 1)) * W;
			const y = pad + H - ((v - min) / rng) * H;
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		});

		const polyline = pts.join(' ');

		// coordinates of the last (current) point → used to render the dot
		const [lx, ly] = pts[pts.length - 1].split(',').map(Number);

		// polygon for gradient fill: closes the area below the line into a polygon
		// order: "bottom-left → all points → bottom-right"
		const area = `${pad},${pad + H} ${polyline} ${(pad + W).toFixed(1)},${pad + H}`;

		return { polyline, area, lx, ly };
	}

	const chart = $derived(buildChart(values, width, height));
</script>

<svg {width} {height} style="display:block;overflow:visible">
	<defs>
		<!-- vertical gradient that fades to transparent toward the bottom (used for the fill area) -->
		<linearGradient id="sg-{uid}" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color={color} stop-opacity="0.22" />
			<stop offset="100%" stop-color={color} stop-opacity="0" />
		</linearGradient>
	</defs>

	{#if values.length >= 2}
		<!-- gradient fill area -->
		<polygon points={chart.area} fill="url(#sg-{uid})" />
		<!-- line -->
		<polyline
			points={chart.polyline}
			fill="none"
			stroke={color}
			stroke-width="1.5"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
		<!-- dot marking the latest (current) value -->
		<circle cx={chart.lx} cy={chart.ly} r="2.5" fill={color} />
	{/if}
</svg>
