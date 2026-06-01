<script lang="ts">
	// ─── PairCard.svelte — Pair(유동성 풀) 컨트랙트 데이터 표시 컴포넌트 ────
	//
	// 이 컴포넌트는 PairData 하나를 받아 카드 형태로 보여준다.
	// 날짜 비교 기능 사용 시 prevData도 받아 모든 수치 변화를 diff 배지로 표시.
	//
	// diff 배지: 값이 올랐으면 ▲ 초록, 내렸으면 ▼ 빨강으로 표시.
	// nd() = number diff (bps 단위 숫자), bd() = bigint diff (큰 정수)

	import type { PairData } from '../config/fetchpairs';
	import { bpsToPercent, formatTimestamp, formatAmount } from '../config/fetchpairs';
	import Sparkline from './Sparkline.svelte';
	import { CHAINS } from '../config/chains';

	// factory 주소(소문자) → 체인 이름 역매핑.
	// 예) "0xa882...b6a7" → "Arbitrum One"
	// 체인 config에 등록된 factory 주소만 인식하고, 나머지는 단축 주소로 표시.
	const FACTORY_NAME: Record<string, string> = Object.fromEntries(
		Object.values(CHAINS).map((c) => [c.factory.toLowerCase(), c.name])
	);

	// $props(): 부모 컴포넌트에서 전달받는 값.
	// data: 현재(또는 종료일) 시점의 Pair 데이터
	// prevData: 비교 기준(시작일) 시점의 Pair 데이터 (없으면 diff 배지 미표시)
	// history: 과거 7일 스냅샷 배열 (오래된 것 먼저). 스파크라인 표시에 사용.
	let {
		data,
		prevData = null,
		history = [],
		chainLabel = ''
	}: { data: PairData; prevData?: PairData | null; history?: PairData[]; chainLabel?: string } = $props();

	// bps(베이시스 포인트) 숫자 두 값의 차이를 diff 배지 정보로 반환.
	// 예) nd(330, 300) → { label: "▲ +30 bps", dir: "up" }
	//     nd(270, 300) → { label: "▼ -30 bps", dir: "down" }
	//     nd(300, 300) → null (변화 없음, 배지 미표시)
	function nd(curr: number, prev: number): { label: string; dir: 'up' | 'down' } | null {
		if (curr === prev) return null;
		const d = curr - prev;
		return { label: d > 0 ? `▲ +${d} bps` : `▼ ${d} bps`, dir: d > 0 ? 'up' : 'down' };
	}

	// bigint diff — decimals를 넘기면 formatAmount로 읽기 쉬운 소수로 표시.
	// reserve, totalSupply, totalBorrowed 등 큰 정수값(uint256)에 사용.
	// bigint 절댓값: d < 0n ? -d : d  (Math.abs는 bigint 미지원)
	function bd(curr: bigint, prev: bigint, decimals?: number): { label: string; dir: 'up' | 'down' } | null {
		if (curr === prev) return null;
		const d = curr - prev;
		const abs = d < 0n ? -d : d;
		const fmt = decimals !== undefined ? formatAmount(abs, decimals) : abs.toString();
		return { label: d > 0n ? `▲ +${fmt}` : `▼ -${fmt}`, dir: d > 0n ? 'up' : 'down' };
	}

	// RAY 단위(10^27) bigint diff.
	// isRate=true  → 이자율(%) 표시  예) "▲ +0.0300%"
	// isRate=false → 배율(×) 표시   예) "▲ +0.000035×"
	function rd(curr: bigint, prev: bigint, isRate = false): { label: string; dir: 'up' | 'down' } | null {
		if (curr === prev) return null;
		const d = curr - prev;
		const absNum = Math.abs(Number(d)) / 1e27;
		const fmt = isRate ? (absNum * 100).toFixed(4) + '%' : absNum.toFixed(6) + '×';
		return { label: d > 0n ? `▲ +${fmt}` : `▼ -${fmt}`, dir: d > 0n ? 'up' : 'down' };
	}

	// ─── 스파크라인 호버 상태 ─────────────────────────────────────────────────
	// hoveredField: 현재 마우스가 올라간 행의 키 (예: 'reserve0'). null이면 숨김.
	// sparkVals: history 배열에서 추출한 해당 필드의 시계열 숫자 배열.
	// sparkTitle: 툴팁에 표시할 레이블.
	// tipX/tipY: 툴팁의 화면 위치 (position: fixed 기준).
	let hoveredField = $state<string | null>(null);
	let sparkVals = $state<number[]>([]);
	let sparkTitle = $state('');
	let tipX = $state(0);
	let tipY = $state(0);

	// history 배열의 날짜 레이블. "6일 전" → "오늘".
	// 첫 번째와 마지막만 툴팁에 표시.
	const SPARK_LABELS = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', '1d ago', 'today'];

	// 마우스가 스파크라인 지원 행에 진입할 때 호출.
	// getter: PairData → number 함수. history 각 스냅샷에서 해당 필드 값을 추출.
	function enterSpark(
		field: string,
		title: string,
		getter: (p: PairData) => number,
		e: MouseEvent
	) {
		if (history.length < 2) return; // 데이터 부족 시 무시
		hoveredField = field;
		sparkTitle = title;
		sparkVals = history.map(getter);
		moveTip(e);
	}

	// 툴팁 위치 갱신. 커서 오른쪽 아래에 표시하되 화면 바깥으로 나가지 않도록.
	function moveTip(e: MouseEvent) {
		tipX = Math.min(e.clientX + 14, window.innerWidth - 210);
		tipY = Math.min(e.clientY + 14, window.innerHeight - 140);
	}

	function leaveSpark() {
		hoveredField = null;
	}

	// 스파크라인 툴팁 레이블 접미어 계산.
	// $derived: data.token0Symbol이 바뀔 때 자동 재계산.
	const t0 = $derived(data.token0Symbol ? ` (${data.token0Symbol})` : '');
	const t1 = $derived(data.token1Symbol ? ` (${data.token1Symbol})` : '');
	const factoryLabel = $derived(FACTORY_NAME[data.factory.toLowerCase()] ?? shortenAddress(data.factory));

	// 함수명 툴팁 상태 (dt[data-fn] 위에 마우스 올릴 때 표시)
	let dtTipText = $state('');
	let dtTipX = $state(0);
	let dtTipY = $state(0);
	let dtTipVisible = $state(false);

	// $state: 복사 피드백 상태. 어떤 버튼이 최근에 눌렸는지 키를 저장.
	let copied = $state<string | null>(null);

	function shortenAddress(addr: string | undefined): string {
		if (!addr) return '—';
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	}

	function copy(key: string, text: string) {
		navigator.clipboard.writeText(text);
		copied = key;
		setTimeout(() => (copied = null), 1000);
	}

	// 카드 전체 데이터를 화면 표시 형태와 동일하게 변환해 JSON으로 복사.
	// bigint → .toString() 변환 (JSON.stringify는 bigint 직접 처리 불가)
	// bps → bpsToPercent() 변환 (예: 30 → "0.30%")
	// RAY 단위(10^27) → / 1e27 로 변환해 사람이 읽기 쉬운 소수로 표시
	function copyAll() {
		const readable = {
			address: data.address,
			name: data.name,
			symbol: data.symbol,
			decimals: data.decimals,
			// totalSupply: LP 토큰 총 발행량. formatAmount로 decimals 적용해 표시.
			totalSupply: formatAmount(data.totalSupply, data.decimals),
			token0: data.token0,
			token1: data.token1,
			factory: data.factory,
			// reserve: 풀이 실제 보유한 토큰 수량. 각 토큰 고유 decimals 적용.
			reserve0: formatAmount(data.reserve0, data.token0Decimals),
			reserve1: formatAmount(data.reserve1, data.token1Decimals),
			// virtualReserves: 가격 계산에만 쓰는 가상 보유량 (In = 살 때, Out = 팔 때)
			virtualReserves: {
				virtualReserve0In: formatAmount(data.virtualReserves.virtualReserve0In, data.token0Decimals),
				virtualReserve0Out: formatAmount(data.virtualReserves.virtualReserve0Out, data.token0Decimals),
				virtualReserve1In: formatAmount(data.virtualReserves.virtualReserve1In, data.token1Decimals),
				virtualReserve1Out: formatAmount(data.virtualReserves.virtualReserve1Out, data.token1Decimals)
			},
			fees: {
				feeLp: bpsToPercent(data.fees.feeLp),
				feePool: bpsToPercent(data.fees.feePool),
				burnFee: bpsToPercent(data.fees.burnFee)
			},
			loanFees: {
				loanFee0: bpsToPercent(data.loanFees.loanFee0),
				loanFee1: bpsToPercent(data.loanFees.loanFee1)
			},
			feeCollector: data.feeCollector,
			interestParams: {
				token0: {
					protocolFeeBps: bpsToPercent(data.interestParams.token0.protocolFeeBps),
					optimalPointBps: bpsToPercent(data.interestParams.token0.optimalPointBps),
					interestRateBaseBps: bpsToPercent(data.interestParams.token0.interestRateBaseBps),
					interestRateOptimalBps: bpsToPercent(data.interestParams.token0.interestRateOptimalBps),
					interestRateAddBps: bpsToPercent(data.interestParams.token0.interestRateAddBps)
				},
				token1: {
					protocolFeeBps: bpsToPercent(data.interestParams.token1.protocolFeeBps),
					optimalPointBps: bpsToPercent(data.interestParams.token1.optimalPointBps),
					interestRateBaseBps: bpsToPercent(data.interestParams.token1.interestRateBaseBps),
					interestRateOptimalBps: bpsToPercent(data.interestParams.token1.interestRateOptimalBps),
					interestRateAddBps: bpsToPercent(data.interestParams.token1.interestRateAddBps)
				}
			},
			// RAY 단위(10^27) → 1e27로 나눠서 사람이 읽을 수 있는 소수로 변환.
			// interestMultiplier: 이자 누적 배율. 예) 1.000050 → 0.005% 이자 누적.
			interestMultiplier0: (Number(data.interestMultiplier0) / 1e27).toFixed(6),
			interestMultiplier1: (Number(data.interestMultiplier1) / 1e27).toFixed(6),
			// variableInterestRate: 현재 변동 이자율. / 1e27 * 100 → 퍼센트 변환.
			variableInterestRate0: ((Number(data.variableInterestRate0) / 1e27) * 100).toFixed(4) + '%',
			variableInterestRate1: ((Number(data.variableInterestRate1) / 1e27) * 100).toFixed(4) + '%',
			// lastYieldAccumulator: 마지막 업데이트 시점의 수익 누산기 값 (RAY 단위).
			lastYieldAccumulator: {
				yieldAcc0: (Number(data.lastYieldAccumulator.yieldAcc0) / 1e27).toFixed(6),
				yieldAcc1: (Number(data.lastYieldAccumulator.yieldAcc1) / 1e27).toFixed(6)
			},
			totalBorrowed0: formatAmount(data.totalBorrowed0, data.token0Decimals),
			totalBorrowed1: formatAmount(data.totalBorrowed1, data.token1Decimals),
			accumulatedPoolFees: {
				fee0: formatAmount(data.accumulatedPoolFees.fee0, data.token0Decimals),
				fee1: formatAmount(data.accumulatedPoolFees.fee1, data.token1Decimals)
			},
			lastUpdateTimestamp: formatTimestamp(data.lastUpdateTimestamp),
			nextLoanId: data.nextLoanId.toString(),
			borrowLimitBps: bpsToPercent(data.borrowLimitBps),
			liquidationPenaltyBps: bpsToPercent(data.liquidationPenaltyBps),
			maxBorrowPerTick: bpsToPercent(data.maxBorrowPerTick),
			maxBorrowPerRange: bpsToPercent(data.maxBorrowPerRange),
			priceDecay: data.priceDecay.toString(),
			swapPriceToleranceBps: bpsToPercent(data.swapPriceToleranceBps),
			tickBuffer: data.tickBuffer,
			minimumLiquidity: data.minimumLiquidity.toString(),
			interestMultiplierDecimals: data.interestMultiplierDecimals,
			rayDecimals: data.rayDecimals
		};
		navigator.clipboard.writeText(JSON.stringify(readable, null, 2));
		copied = '__all__';
		setTimeout(() => (copied = null), 1000);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="pair-card" onmousemove={(e) => {
	if (hoveredField) moveTip(e);
	const dt = (e.target as Element)?.closest?.('dt') as HTMLElement | null;
	if (dt?.dataset.fn) {
		dtTipText = dt.dataset.fn;
		dtTipX = Math.min(e.clientX + 14, window.innerWidth - 340);
		dtTipY = e.clientY - 52;
		dtTipVisible = true;
	} else {
		dtTipVisible = false;
	}
}} onmouseleave={() => { dtTipVisible = false; }}>
	<div class="pair-header">
		<div>
			<h3>
			{#if data.token0Symbol && data.token1Symbol}
				UniPool — {data.token0Symbol}/{data.token1Symbol}{chainLabel ? ` (${chainLabel})` : ''}
			{:else}
				{data.symbol || shortenAddress(data.address)}
			{/if}
		</h3>
			<span class="pair-address" title={data.address}>{shortenAddress(data.address)}</span>
		</div>
		<button class="copy-btn" onclick={copyAll}>
			{copied === '__all__' ? '✓ Copied' : 'Copy all'}
		</button>
	</div>

	<section>
		<h4>Tokens</h4>
		<dl>
			<div class="row">
				<dt data-fn="getTokens()[0]">Token 0{data.token0Symbol ? ` (${data.token0Symbol})` : ''}</dt>
				<dd>
					<span title={data.token0}>{shortenAddress(data.token0)}</span>
					<button class="copy-icon" onclick={() => copy('t0', data.token0)}
						>{copied === 't0' ? '✓' : '⎘'}</button
					>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getTokens()[1]">Token 1{data.token1Symbol ? ` (${data.token1Symbol})` : ''}</dt>
				<dd>
					<span title={data.token1}>{shortenAddress(data.token1)}</span>
					<button class="copy-icon" onclick={() => copy('t1', data.token1)}
						>{copied === 't1' ? '✓' : '⎘'}</button
					>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getFactory()">Factory</dt>
				<dd>
					<span class="factory-badge" title={data.factory}>{factoryLabel}</span>
					<button class="copy-icon" onclick={() => copy('fac', data.factory)}
						>{copied === 'fac' ? '✓' : '⎘'}</button
					>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="totalSupply() — Total supply of LP tokens issued to liquidity providers as proof of deposit">LP Token Supply</dt>
				<dd onmouseenter={(e) => enterSpark('supply', 'LP Token Supply', (p) => Number(p.totalSupply) / 10 ** p.decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.totalSupply, data.decimals)}
					{#if prevData}{@const d = bd(data.totalSupply, prevData.totalSupply, data.decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<h4>Reserves</h4>
		<dl>
			<div class="row">
				<dt data-fn="getReserves()[0] — Actual token0 balance held by this Pair">Reserve 0{data.token0Symbol ? ` (${data.token0Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('r0', `Reserve 0${t0}`, (p) => Number(p.reserve0) / 10 ** p.token0Decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.reserve0, data.token0Decimals)}{#if data.token0Symbol}<span class="unit">{data.token0Symbol}</span>{/if}
					{#if prevData}{@const d = bd(data.reserve0, prevData.reserve0, data.token0Decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getReserves()[1] — Actual token1 balance held by this Pair">Reserve 1{data.token1Symbol ? ` (${data.token1Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('r1', `Reserve 1${t1}`, (p) => Number(p.reserve1) / 10 ** p.token1Decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.reserve1, data.token1Decimals)}{#if data.token1Symbol}<span class="unit">{data.token1Symbol}</span>{/if}
					{#if prevData}{@const d = bd(data.reserve1, prevData.reserve1, data.token1Decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<h4>Fees</h4>
		<dl>
			<div class="row">
				<dt data-fn="getFeesBps()[0] — Swap fee paid to LP (liquidity providers)">LP Fee</dt>
				<dd>
					{bpsToPercent(data.fees.feeLp)}
					{#if prevData}{@const d = nd(data.fees.feeLp, prevData.fees.feeLp)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getFeesBps()[1] — Swap fee collected by the protocol (sent to feeCollector)">Pool Fee</dt>
				<dd>
					{bpsToPercent(data.fees.feePool)}
					{#if prevData}{@const d = nd(data.fees.feePool, prevData.fees.feePool)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getFeesBps()[2] — Fee charged when LP tokens are burned">Burn Fee</dt>
				<dd>
					{bpsToPercent(data.fees.burnFee)}
					{#if prevData}{@const d = nd(data.fees.burnFee, prevData.fees.burnFee)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getLoanFeesBps()[0] — Fee charged for token0 flash loans">Loan Fee 0</dt>
				<dd>
					{bpsToPercent(data.loanFees.loanFee0)}
					{#if prevData}{@const d = nd(data.loanFees.loanFee0, prevData.loanFees.loanFee0)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getLoanFeesBps()[1] — Fee charged for token1 flash loans">Loan Fee 1</dt>
				<dd>
					{bpsToPercent(data.loanFees.loanFee1)}
					{#if prevData}{@const d = nd(data.loanFees.loanFee1, prevData.loanFees.loanFee1)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getFeeCollector() — Address that collects protocol fees">Fee Collector</dt>
				<dd>
					<span title={data.feeCollector}>{shortenAddress(data.feeCollector)}</span>
					<button class="copy-icon" onclick={() => copy('fc', data.feeCollector)}
						>{copied === 'fc' ? '✓' : '⎘'}</button
					>
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<!-- 토큰별 IRM은 독립적으로 설정 가능 (예: 스테이블코인 vs 변동성 자산에 다른 이자 곡선).
		     값이 같더라도 별도 파라미터이므로 컬럼으로 나란히 표시해 비교가 쉽게 함. -->
		<div class="irm-header">
			<h4>Interest Rate Model</h4>
			<div class="irm-col-labels">
				<span class="irm-th">{data.token0Symbol || 'Token 0'}</span>
				<span class="irm-th">{data.token1Symbol || 'Token 1'}</span>
			</div>
		</div>
		<dl>
			<div class="row">
				<dt data-fn="getInterestParamsBps() → protocolFeeBps — Share of interest revenue taken by the protocol">Protocol Fee</dt>
				<dd>
					<span class="irm-v">{bpsToPercent(data.interestParams.token0.protocolFeeBps)}{#if prevData}{@const d = nd(data.interestParams.token0.protocolFeeBps, prevData.interestParams.token0.protocolFeeBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
					<span class="irm-v">{bpsToPercent(data.interestParams.token1.protocolFeeBps)}{#if prevData}{@const d = nd(data.interestParams.token1.protocolFeeBps, prevData.interestParams.token1.protocolFeeBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getInterestParamsBps() → optimalPointBps — Utilization rate at which the interest curve kinks; above this, interest rises sharply">Optimal Point</dt>
				<dd>
					<span class="irm-v">{bpsToPercent(data.interestParams.token0.optimalPointBps)}{#if prevData}{@const d = nd(data.interestParams.token0.optimalPointBps, prevData.interestParams.token0.optimalPointBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
					<span class="irm-v">{bpsToPercent(data.interestParams.token1.optimalPointBps)}{#if prevData}{@const d = nd(data.interestParams.token1.optimalPointBps, prevData.interestParams.token1.optimalPointBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getInterestParamsBps() → interestRateBaseBps — Annual interest rate at 0% utilization">Base Rate</dt>
				<dd>
					<span class="irm-v">{bpsToPercent(data.interestParams.token0.interestRateBaseBps)}{#if prevData}{@const d = nd(data.interestParams.token0.interestRateBaseBps, prevData.interestParams.token0.interestRateBaseBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
					<span class="irm-v">{bpsToPercent(data.interestParams.token1.interestRateBaseBps)}{#if prevData}{@const d = nd(data.interestParams.token1.interestRateBaseBps, prevData.interestParams.token1.interestRateBaseBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getInterestParamsBps() → interestRateOptimalBps — Annual interest rate at optimal utilization">Optimal Rate</dt>
				<dd>
					<span class="irm-v">{bpsToPercent(data.interestParams.token0.interestRateOptimalBps)}{#if prevData}{@const d = nd(data.interestParams.token0.interestRateOptimalBps, prevData.interestParams.token0.interestRateOptimalBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
					<span class="irm-v">{bpsToPercent(data.interestParams.token1.interestRateOptimalBps)}{#if prevData}{@const d = nd(data.interestParams.token1.interestRateOptimalBps, prevData.interestParams.token1.interestRateOptimalBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getInterestParamsBps() → interestRateAddBps — Additional rate applied above optimal utilization to discourage excess borrowing">Add Rate</dt>
				<dd>
					<span class="irm-v">{bpsToPercent(data.interestParams.token0.interestRateAddBps)}{#if prevData}{@const d = nd(data.interestParams.token0.interestRateAddBps, prevData.interestParams.token0.interestRateAddBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
					<span class="irm-v">{bpsToPercent(data.interestParams.token1.interestRateAddBps)}{#if prevData}{@const d = nd(data.interestParams.token1.interestRateAddBps, prevData.interestParams.token1.interestRateAddBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}</span>
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<h4>Borrow State</h4>
		<dl>
			<div class="row">
				<dt data-fn="getTotalBorrowed0() — Outstanding token0 borrow amount">Total Borrowed 0{data.token0Symbol ? ` (${data.token0Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('b0', `Total Borrowed 0${t0}`, (p) => Number(p.totalBorrowed0) / 10 ** p.token0Decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.totalBorrowed0, data.token0Decimals)}{#if data.token0Symbol}<span class="unit">{data.token0Symbol}</span>{/if}
					{#if prevData}{@const d = bd(data.totalBorrowed0, prevData.totalBorrowed0, data.token0Decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getTotalBorrowed1() — Outstanding token1 borrow amount">Total Borrowed 1{data.token1Symbol ? ` (${data.token1Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('b1', `Total Borrowed 1${t1}`, (p) => Number(p.totalBorrowed1) / 10 ** p.token1Decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.totalBorrowed1, data.token1Decimals)}{#if data.token1Symbol}<span class="unit">{data.token1Symbol}</span>{/if}
					{#if prevData}{@const d = bd(data.totalBorrowed1, prevData.totalBorrowed1, data.token1Decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getAccumulatedPoolFees()[0] — Accumulated token0 pool fees not yet distributed">Pool Fees 0{data.token0Symbol ? ` (${data.token0Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('f0', `Pool Fees 0${t0}`, (p) => Number(p.accumulatedPoolFees.fee0) / 10 ** p.token0Decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.accumulatedPoolFees.fee0, data.token0Decimals)}{#if data.token0Symbol}<span class="unit">{data.token0Symbol}</span>{/if}
					{#if prevData}{@const d = bd(data.accumulatedPoolFees.fee0, prevData.accumulatedPoolFees.fee0, data.token0Decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getAccumulatedPoolFees()[1] — Accumulated token1 pool fees not yet distributed">Pool Fees 1{data.token1Symbol ? ` (${data.token1Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('f1', `Pool Fees 1${t1}`, (p) => Number(p.accumulatedPoolFees.fee1) / 10 ** p.token1Decimals, e)} onmouseleave={leaveSpark}>
					{formatAmount(data.accumulatedPoolFees.fee1, data.token1Decimals)}{#if data.token1Symbol}<span class="unit">{data.token1Symbol}</span>{/if}
					{#if prevData}{@const d = bd(data.accumulatedPoolFees.fee1, prevData.accumulatedPoolFees.fee1, data.token1Decimals)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getInterestMultiplier0() — token0 interest accumulation multiplier in RAY (10²⁷). Starts at 1×, increases as interest accrues">Interest Multiplier 0</dt>
				<dd onmouseenter={(e) => enterSpark('m0', 'Interest Multiplier 0', (p) => Number(p.interestMultiplier0) / 1e27, e)} onmouseleave={leaveSpark}>
					{(Number(data.interestMultiplier0) / 1e27).toFixed(6)}<span class="unit">×</span>
					{#if prevData}{@const d = rd(data.interestMultiplier0, prevData.interestMultiplier0, false)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getInterestMultiplier1() — token1 interest accumulation multiplier in RAY (10²⁷). Starts at 1×, increases as interest accrues">Interest Multiplier 1</dt>
				<dd onmouseenter={(e) => enterSpark('m1', 'Interest Multiplier 1', (p) => Number(p.interestMultiplier1) / 1e27, e)} onmouseleave={leaveSpark}>
					{(Number(data.interestMultiplier1) / 1e27).toFixed(6)}<span class="unit">×</span>
					{#if prevData}{@const d = rd(data.interestMultiplier1, prevData.interestMultiplier1, false)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="calcVariableInterestRate0() — Current variable annual interest rate for token0 based on utilization">Variable Rate 0</dt>
				<dd onmouseenter={(e) => enterSpark('rate0', 'Variable Rate 0', (p) => Number(p.variableInterestRate0) / 1e27 * 100, e)} onmouseleave={leaveSpark}>
					{((Number(data.variableInterestRate0) / 1e27) * 100).toFixed(4)}<span class="unit">%</span>
					{#if prevData}{@const d = rd(data.variableInterestRate0, prevData.variableInterestRate0, true)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="calcVariableInterestRate1() — Current variable annual interest rate for token1 based on utilization">Variable Rate 1</dt>
				<dd onmouseenter={(e) => enterSpark('rate1', 'Variable Rate 1', (p) => Number(p.variableInterestRate1) / 1e27 * 100, e)} onmouseleave={leaveSpark}>
					{((Number(data.variableInterestRate1) / 1e27) * 100).toFixed(4)}<span class="unit">%</span>
					{#if prevData}{@const d = rd(data.variableInterestRate1, prevData.variableInterestRate1, true)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getLastUpdateTimestamp() — Timestamp of the last on-chain state update">Last Update</dt>
				<dd>{formatTimestamp(data.lastUpdateTimestamp)}</dd>
			</div>
			<div class="row">
				<dt data-fn="getNextLoanId() — ID assigned to the next loan. Acts as a total loan count counter">Next Loan ID</dt>
				<dd>{data.nextLoanId.toString()}</dd>
			</div>
			<div class="row">
				<dt data-fn="getLastYieldAccumulator()[0] — token0 yield accumulator at last on-chain update. Difference from interestMultiplier reveals pending unrecorded interest">Last Yield Acc 0{data.token0Symbol ? ` (${data.token0Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('yacc0', `Yield Acc 0${t0}`, (p) => Number(p.lastYieldAccumulator.yieldAcc0) / 1e27, e)} onmouseleave={leaveSpark}>
					{(Number(data.lastYieldAccumulator.yieldAcc0) / 1e27).toFixed(6)}<span class="unit">×</span>
					{#if prevData}{@const d = rd(data.lastYieldAccumulator.yieldAcc0, prevData.lastYieldAccumulator.yieldAcc0, false)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getLastYieldAccumulator()[1] — token1 yield accumulator at last on-chain update">Last Yield Acc 1{data.token1Symbol ? ` (${data.token1Symbol})` : ''}</dt>
				<dd onmouseenter={(e) => enterSpark('yacc1', `Yield Acc 1${t1}`, (p) => Number(p.lastYieldAccumulator.yieldAcc1) / 1e27, e)} onmouseleave={leaveSpark}>
					{(Number(data.lastYieldAccumulator.yieldAcc1) / 1e27).toFixed(6)}<span class="unit">×</span>
					{#if prevData}{@const d = rd(data.lastYieldAccumulator.yieldAcc1, prevData.lastYieldAccumulator.yieldAcc1, false)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<h4>Pair Parameters</h4>
		<dl>
			<div class="row">
				<dt data-fn="getBorrowLimitBps() — Max borrow ratio relative to collateral (LTV). e.g. 8000 bps = 80% → $100 collateral allows $80 max borrow">Borrow Limit</dt>
				<dd onmouseenter={(e) => enterSpark('borrowLimit', 'Borrow Limit', (p) => p.borrowLimitBps / 100, e)} onmouseleave={leaveSpark}>
					{bpsToPercent(data.borrowLimitBps)}
					{#if prevData}{@const d = nd(data.borrowLimitBps, prevData.borrowLimitBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getLiquidationPenaltyBps() — Bonus paid to liquidators when a position is liquidated">Liquidation Penalty</dt>
				<dd onmouseenter={(e) => enterSpark('liqPenalty', 'Liquidation Penalty', (p) => p.liquidationPenaltyBps / 100, e)} onmouseleave={leaveSpark}>
					{bpsToPercent(data.liquidationPenaltyBps)}
					{#if prevData}{@const d = nd(data.liquidationPenaltyBps, prevData.liquidationPenaltyBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getMaxBorrowPerTickAndRange()[0] — Max borrow ratio per single price tick (prevents concentration risk)">Max Borrow / Tick</dt>
				<dd onmouseenter={(e) => enterSpark('maxTick', 'Max Borrow / Tick', (p) => p.maxBorrowPerTick / 100, e)} onmouseleave={leaveSpark}>
					{bpsToPercent(data.maxBorrowPerTick)}
					{#if prevData}{@const d = nd(data.maxBorrowPerTick, prevData.maxBorrowPerTick)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getMaxBorrowPerTickAndRange()[1] — Max borrow ratio across a continuous range of ticks">Max Borrow / Range</dt>
				<dd onmouseenter={(e) => enterSpark('maxRange', 'Max Borrow / Range', (p) => p.maxBorrowPerRange / 100, e)} onmouseleave={leaveSpark}>
					{bpsToPercent(data.maxBorrowPerRange)}
					{#if prevData}{@const d = nd(data.maxBorrowPerRange, prevData.maxBorrowPerRange)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getPriceDecay() — Speed at which virtual price converges to market price. Higher value = faster convergence">Price Decay</dt>
				<dd onmouseenter={(e) => enterSpark('priceDecay', 'Price Decay', (p) => Number(p.priceDecay), e)} onmouseleave={leaveSpark}>
					{data.priceDecay.toString()}
					{#if prevData}{@const d = bd(data.priceDecay, prevData.priceDecay)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getSwapPriceToleranceBps() — Max slippage allowed during a swap (expected vs actual execution price)">Swap Tolerance</dt>
				<dd onmouseenter={(e) => enterSpark('swapTol', 'Swap Tolerance', (p) => p.swapPriceToleranceBps / 100, e)} onmouseleave={leaveSpark}>
					{bpsToPercent(data.swapPriceToleranceBps)}
					{#if prevData}{@const d = nd(data.swapPriceToleranceBps, prevData.swapPriceToleranceBps)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
				</dd>
			</div>
			<div class="row">
				<dt data-fn="getTickBuffer() — Extra ticks added during liquidation calculation as a safety margin against sudden price moves">Tick Buffer</dt>
				<dd onmouseenter={(e) => enterSpark('tickBuf', 'Tick Buffer', (p) => p.tickBuffer, e)} onmouseleave={leaveSpark}>
					{data.tickBuffer}
					{#if prevData && data.tickBuffer !== prevData.tickBuffer}
						{@const delta = data.tickBuffer - prevData.tickBuffer}
						<span class="diff {delta > 0 ? 'up' : 'down'}">{delta > 0 ? '▲ +' : '▼ '}{delta}</span>
					{/if}
				</dd>
			</div>
		</dl>
	</section>

	<section>
		<h4>Constants</h4>
		<dl>
			<div class="row">
				<dt data-fn="MINIMUM_LIQUIDITY() — Minimum LP tokens permanently locked at pool creation to prevent division by zero">Min Liquidity</dt>
				<dd>{data.minimumLiquidity.toString()}</dd>
			</div>
			<div class="row">
				<dt data-fn="INTEREST_MULTIPLIER_DECIMALS() — Decimal precision of the interestMultiplier value">Interest Multiplier Decimals</dt>
				<dd>{data.interestMultiplierDecimals}</dd>
			</div>
			<div class="row">
				<dt data-fn="RAY_DECIMALS() — Decimal precision of RAY units. Always 27 (10²⁷)">RAY Decimals</dt>
				<dd>{data.rayDecimals}</dd>
			</div>
		</dl>
	</section>
</div>

{#if dtTipVisible && dtTipText}
	<div class="fn-tip" style="left:{dtTipX}px;top:{dtTipY}px">{dtTipText}</div>
{/if}

<!-- 스파크라인 툴팁: position:fixed로 마우스 커서 근처에 표시 -->
{#if hoveredField && sparkVals.length >= 2}
	<div class="spark-tip" style="left:{tipX}px;top:{tipY}px">
		<div class="spark-tip-title">{sparkTitle}</div>
		<Sparkline values={sparkVals} width={170} height={52} />
		<div class="spark-tip-dates">
			<span>{SPARK_LABELS[0]}</span>
			<span>{SPARK_LABELS[SPARK_LABELS.length - 1]}</span>
		</div>
	</div>
{/if}

<style>
	.pair-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		background: #f8fafc;
	}
	.pair-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}
	.pair-header h3 {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 2px;
	}
	.pair-address {
		font-size: 0.75rem;
		font-family: monospace;
		color: #94a3b8;
	}
	section {
		margin-bottom: 0.75rem;
	}
	h4 {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		margin: 0 0 0.05rem;
	}
	dl {
		margin: 0;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
		border-bottom: 1px solid #f1f5f9;
	}
	.row:last-child {
		border-bottom: none;
	}
	dt {
		font-size: 0.75rem;
		color: #64748b;
		flex-shrink: 0;
	}
	dd {
		font-size: 0.75rem;
		font-family: monospace;
		font-weight: 500;
		margin: 0;
		color: #0f172a;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 4px;
		flex: 1;
		min-width: 0;
		text-align: right;
	}

	.copy-btn {
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		background: #f8fafc;
		cursor: pointer;
		color: #475569;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.copy-btn:hover {
		background: #f1f5f9;
	}

	.copy-icon {
		font-size: 0.75rem;
		padding: 0 3px;
		border: none;
		background: transparent;
		cursor: pointer;
		color: #94a3b8;
		line-height: 1;
	}
	.copy-icon:hover { color: #475569; }
	.diff {
		font-size: 0.65rem;
		font-weight: 600;
		margin-left: 4px;
		white-space: nowrap;
	}
	.diff.up { color: #16a34a; }
	.diff.down { color: #dc2626; }
	.unit {
		font-size: 0.65rem;
		color: #94a3b8;
		margin-left: 1px;
	}
	.factory-badge {
		font-size: 0.7rem;
		font-family: monospace;
		color: #6366f1;
		background: #eef2ff;
		border: 1px solid #c7d2fe;
		border-radius: 4px;
		padding: 0 4px;
	}

	/* ─── Interest Rate Model 2-컬럼 레이아웃 ───────────────────────────── */
	.irm-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.2rem;
	}
	.irm-header h4 { margin: 0; }
	.irm-col-labels {
		display: flex;
	}
	.irm-th {
		font-size: 0.65rem;
		font-weight: 600;
		color: #94a3b8;
		min-width: 80px;
		text-align: right;
	}
	.irm-v {
		min-width: 80px;
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 2px;
	}

	/* ─── 함수명 툴팁 ─────────────────────────────────────────────────────── */
	:global(.fn-tip) {
		position: fixed;
		z-index: 9998;
		background: #0f172a;
		color: #94a3b8;
		font-family: monospace;
		font-size: 0.65rem;
		padding: 5px 9px;
		border-radius: 5px;
		pointer-events: none;
		max-width: 340px;
		white-space: pre-wrap;
		line-height: 1.5;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}
	dt[data-fn] { cursor: help; }

	/* ─── 스파크라인 툴팁 ──────────────────────────────────────────────────── */
	/* position: fixed → 뷰포트(화면 전체) 기준 고정 위치. 부모 overflow 영향 없음. */
	/* pointer-events: none → 툴팁 자체가 마우스 이벤트를 가로채지 않음.         */
	:global(.spark-tip) {
		position: fixed;
		z-index: 9999;
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 10px 12px 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		pointer-events: none;
		min-width: 190px;
	}
	:global(.spark-tip-title) {
		font-size: 0.7rem;
		font-weight: 600;
		color: #475569;
		margin-bottom: 6px;
		white-space: nowrap;
	}
	:global(.spark-tip-dates) {
		display: flex;
		justify-content: space-between;
		font-size: 0.6rem;
		color: #94a3b8;
		margin-top: 4px;
	}
</style>
