<script lang="ts">
  // ═══════════════════════════════════════════════════════════════════════════
  // Sparkline.svelte — 소형 SVG 꺾은선 그래프 컴포넌트
  //
  // ■ 스파크라인(Sparkline)이란?
  //   범례, 축, 레이블 없이 숫자의 추세만 빠르게 보여주는 미니 그래프.
  //   "이 숫자가 지난 7일간 어떻게 변했는가?"를 한눈에 파악할 때 사용.
  //
  // ■ SVG(Scalable Vector Graphics)란?
  //   선, 원, 다각형을 수학적 좌표로 정의하는 이미지 형식.
  //   픽셀 기반(PNG/JPG)과 달리 크기를 늘려도 깨지지 않음.
  //
  //   이 컴포넌트에서 쓰는 SVG 요소:
  //   <polyline>: 여러 점을 이어 만드는 꺾은선 (그래프 선)
  //   <polygon>: 닫힌 다각형 (그래프 선 아래 채우기 영역)
  //   <circle>:  원 (최신값 위치 표시 점)
  //   <linearGradient>: 위에서 아래로 색이 투명해지는 그라디언트 정의
  //
  // ■ SVG 좌표계 주의사항
  //   SVG의 y축은 "아래로 갈수록 증가".
  //   → 값이 클수록 화면 위에 표시되려면 y 좌표를 뒤집어야 함.
  //   공식: y = H - ((v - min) / range * H) + pad
  //   (H에서 빼서 뒤집음)
  //
  // ■ 그라디언트 ID 충돌 문제
  //   같은 페이지에 Sparkline이 여러 개이면 <linearGradient id="sg-xxx">의 id가 겹침.
  //   → 모든 스파크라인이 첫 번째 그라디언트를 공유해 색상이 뒤섞임.
  //   해결: Math.random()으로 인스턴스마다 고유 uid 생성.
  // ═══════════════════════════════════════════════════════════════════════════

  // $props(): Svelte 5 룬. 부모가 전달한 값을 구조 분해.
  let {
    values,       // 시간 순 숫자 배열. values[0] = 6일 전, values[6] = 오늘.
    width = 160,  // SVG 전체 너비(px). 기본 160.
    height = 50,  // SVG 전체 높이(px). 기본 50.
    color = '#6366f1' // 선/점/그라디언트 색. 기본 보라(Tailwind indigo-500).
  }: {
    values: number[];
    width?: number;
    height?: number;
    color?: string;
  } = $props();

  // 이 컴포넌트 인스턴스만의 고유 ID.
  // Math.random().toString(36).slice(2, 8) → 예: "k7f2ax" (6자리 영숫자)
  // SVG <linearGradient id="sg-k7f2ax"> 로 사용 → 다른 인스턴스와 충돌 없음.
  const uid = Math.random().toString(36).slice(2, 8);

  // 선이 SVG 가장자리에 딱 붙지 않도록 안쪽 여백(padding).
  // 여백이 없으면 최솟값/최댓값 점이 SVG 경계에서 잘릴 수 있음.
  const pad = 4;

  // ─── 좌표 계산 함수 ────────────────────────────────────────────────────
  // vals, w, h가 바뀔 때 $derived가 자동 재계산 → SVG 다시 렌더링.
  function buildChart(vals: number[], w: number, h: number) {
    const W = w - pad * 2; // 실제 그래프 영역 너비 (양쪽 pad 제외)
    const H = h - pad * 2; // 실제 그래프 영역 높이 (위아래 pad 제외)

    // 데이터가 2개 미만이면 그래프를 그릴 수 없음.
    // lx, ly: 마지막 점 좌표 (점을 그릴 위치). 데이터 없으면 가운데 하단에 위치.
    if (vals.length < 2) {
      return { polyline: '', area: '', lx: pad + W, ly: pad + H / 2 };
    }

    const min = Math.min(...vals); // 전체 데이터 중 최솟값
    const max = Math.max(...vals); // 전체 데이터 중 최댓값
    // rng: 최댓값 - 최솟값 = 데이터 범위.
    // 모든 값이 같으면 rng = 0 → 0으로 나누기 에러 방지 → 1로 대체.
    // (값이 모두 같으면 가운데 수평선으로 표시됨)
    const rng = max - min || 1;

    // 각 데이터 포인트를 SVG 좌표 "x,y" 문자열로 변환.
    const pts = vals.map((v, i) => {
      // x: 왼쪽(인덱스 0, 가장 오래된 값) → 오른쪽(마지막 인덱스, 최신 값)
      const x = pad + (i / (vals.length - 1)) * W;

      // y: SVG y축은 아래 방향이므로 뒤집어야 함.
      // (v - min) / rng: 0~1 범위로 정규화 (0 = 최솟값, 1 = 최댓값)
      // * H: 픽셀로 변환
      // pad + H - ...: 뒤집기 (큰 값 = 화면 위쪽 = 작은 y 좌표)
      const y = pad + H - ((v - min) / rng) * H;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    // polyline에 넘길 점 목록 문자열. 예: "4.0,40.0 50.0,20.0 96.0,10.0"
    const polyline = pts.join(' ');

    // 마지막(최신) 포인트 좌표 → 현재값 위치 표시 점(<circle>)에 사용.
    const [lx, ly] = pts[pts.length - 1].split(',').map(Number);

    // 채우기 영역(polygon) 좌표: 선 아래를 닫아 다각형 생성.
    // "좌하단(시작) → 선 전체 → 우하단(끝)" 순으로 닫으면 그래프 아래 영역이 됨.
    // pad + H = y 하단 경계
    const area = `${pad},${pad + H} ${polyline} ${(pad + W).toFixed(1)},${pad + H}`;

    return { polyline, area, lx, ly };
  }

  // $derived: values, width, height 중 하나라도 바뀌면 buildChart 재실행.
  const chart = $derived(buildChart(values, width, height));
</script>

<!--
  SVG 컨테이너.
  display:block → 인라인 요소 기본값에서 발생하는 아래 여백(descender gap) 제거.
  overflow:visible → 선이나 점이 SVG 경계를 약간 벗어나도 잘리지 않음.
-->
<svg {width} {height} style="display:block;overflow:visible">
  <defs>
    <!--
      수직 선형 그라디언트: 위(색 있음) → 아래(투명).
      채우기 영역(polygon)에 적용해 그래프 아래가 투명하게 사라지는 효과.

      x1="0" x2="0" y1="0" y2="1": 수직 방향 그라디언트.
        (x1=x2 → 좌우 방향 없음 / y1=0(위) → y2=1(아래) → 위에서 아래로)

      id="sg-{uid}": 이 인스턴스 전용 ID. 다른 Sparkline의 그라디언트와 충돌 없음.
    -->
    <linearGradient id="sg-{uid}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color={color} stop-opacity="0.22" />
      <stop offset="100%" stop-color={color} stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- 데이터가 2개 이상일 때만 그래프 렌더링 -->
  {#if values.length >= 2}
    <!--
      채우기 영역: 선 아래쪽을 그라디언트로 채움.
      fill="url(#sg-{uid})": 위에서 정의한 그라디언트를 참조.
    -->
    <polygon points={chart.area} fill="url(#sg-{uid})" />

    <!--
      꺾은선 그래프.
      fill="none": 선 안쪽 채우기 없음 (채우기는 polygon이 담당).
      stroke-linejoin="round": 꺾이는 부분을 둥글게.
      stroke-linecap="round": 선 양 끝을 둥글게.
    -->
    <polyline
      points={chart.polyline}
      fill="none"
      stroke={color}
      stroke-width="1.5"
      stroke-linejoin="round"
      stroke-linecap="round"
    />

    <!-- 최신(현재) 값 위치를 작은 원으로 표시 -->
    <circle cx={chart.lx} cy={chart.ly} r="2.5" fill={color} />
  {/if}
</svg>
