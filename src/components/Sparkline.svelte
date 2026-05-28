<script lang="ts">
	// ─── Sparkline.svelte — 소형 SVG 꺾은선 그래프 컴포넌트 ───────────────────
	// 외부 라이브러리 없이 순수 SVG로 구현.
	// values 배열을 받아 왼쪽(오래된 값) → 오른쪽(최신 값) 방향으로 렌더링.

	let {
		values,    // 시간 순서대로 정렬된 숫자 배열 (오래된 것 먼저)
		width = 160,
		height = 50,
		color = '#6366f1'
	}: {
		values: number[];
		width?: number;
		height?: number;
		color?: string;
	} = $props();

	// 같은 페이지에 Sparkline이 여러 개일 때 SVG 그라디언트 ID 충돌 방지.
	// Math.random으로 인스턴스마다 고유 ID 생성.
	const uid = Math.random().toString(36).slice(2, 8);

	const pad = 4; // 선이 SVG 가장자리에 닿지 않도록 안쪽 여백 (px)

	// 주어진 values 배열로 SVG 좌표를 계산하는 순수 함수.
	// $derived가 values/width/height가 바뀔 때 자동 재계산.
	function buildChart(vals: number[], w: number, h: number) {
		const W = w - pad * 2; // 실제 그래프 영역 너비
		const H = h - pad * 2; // 실제 그래프 영역 높이

		if (vals.length < 2) {
			return { polyline: '', area: '', lx: pad + W, ly: pad + H / 2 };
		}

		const min = Math.min(...vals);
		const max = Math.max(...vals);
		const rng = max - min || 1; // 값이 모두 같을 때 0 나누기 방지 → 1로 대체

		// 각 데이터 포인트 → SVG 좌표 (x, y)
		// x: 왼쪽(가장 오래된 값) → 오른쪽(최신 값)
		// y: 아래(최솟값) → 위(최댓값). SVG y축은 아래로 증가하므로 뒤집어야 함.
		const pts = vals.map((v, i) => {
			const x = pad + (i / (vals.length - 1)) * W;
			const y = pad + H - ((v - min) / rng) * H;
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		});

		const polyline = pts.join(' ');

		// 마지막(현재) 포인트 좌표 → 점(dot) 표시용
		const [lx, ly] = pts[pts.length - 1].split(',').map(Number);

		// 그라디언트 채우기를 위한 polygon: 선 아래쪽 영역을 닫아 다각형 생성
		// "좌하단 → 모든 포인트 → 우하단" 순서로 닫힘
		const area = `${pad},${pad + H} ${polyline} ${(pad + W).toFixed(1)},${pad + H}`;

		return { polyline, area, lx, ly };
	}

	const chart = $derived(buildChart(values, width, height));
</script>

<svg {width} {height} style="display:block;overflow:visible">
	<defs>
		<!-- 아래로 갈수록 투명해지는 수직 그라디언트 (채우기 영역에 사용) -->
		<linearGradient id="sg-{uid}" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0%" stop-color={color} stop-opacity="0.22" />
			<stop offset="100%" stop-color={color} stop-opacity="0" />
		</linearGradient>
	</defs>

	{#if values.length >= 2}
		<!-- 그라디언트 채우기 영역 -->
		<polygon points={chart.area} fill="url(#sg-{uid})" />
		<!-- 꺾은선 -->
		<polyline
			points={chart.polyline}
			fill="none"
			stroke={color}
			stroke-width="1.5"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>
		<!-- 최신(현재) 값 위치 표시 점 -->
		<circle cx={chart.lx} cy={chart.ly} r="2.5" fill={color} />
	{/if}
</svg>
