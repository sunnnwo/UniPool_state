<script lang="ts">
	// ─── FactoryCard.svelte — Factory 컨트랙트 데이터 표시 컴포넌트 ──────────
	//
	// ■ Factory(팩토리)란?
	//   UniPool 프로토콜 전체를 관리하는 "마스터 컨트랙트".
	//   역할 두 가지:
	//   1) Pair 풀 생성: 새로운 토큰 쌍(예: WETH/USDC)의 유동성 풀을 배포(deploy)한다.
	//   2) 전역 파라미터 관리: 수수료, 이자율 모델, 청산 비율 등
	//      프로토콜 전체에 적용되는 기본값(default)을 저장한다.
	//      각 Pair는 이 기본값을 상속받되, 개별 설정으로 덮어쓸 수 있다.
	//
	// ■ Beacon Proxy(비콘 프록시)란?
	//   스마트 컨트랙트 업그레이드 패턴 중 하나.
	//   모든 Pair 컨트랙트가 "Beacon"이라는 단일 주소를 가리키고,
	//   Beacon은 현재 사용할 구현체(implementation) 주소를 저장한다.
	//   프로토콜 팀이 Beacon의 구현체 주소만 바꾸면 모든 Pair가 한 번에 업그레이드된다.
	//   → 각 Pair를 개별적으로 업그레이드하는 것보다 훨씬 가스(gas) 비용 절약.
	//
	// ■ bps(베이시스 포인트, Basis Points)란?
	//   수수료나 이자율을 표현하는 단위. 1 bps = 0.01% = 0.0001.
	//   예) 30 bps = 0.30%, 8000 bps = 80.00%
	//   정수(integer)로 저장해 소수점 오차를 없애기 위해 사용.
	//   화면 표시 시 bpsToPercent(30) → "0.30%"으로 변환.
	//
	// ■ IRM(Interest Rate Model, 이자율 모델)이란?
	//   대출 사용률(utilization)에 따라 이자율을 동적으로 결정하는 공식.
	//   UniPool은 "Kinked IRM(꺾임 모델)"을 사용:
	//   - 사용률 < optimalPoint  → 낮은 기본 이자율(Base Rate)
	//   - 사용률 = optimalPoint  → 꺾임점 이자율(Optimal Rate)
	//   - 사용률 > optimalPoint  → 급격히 상승하는 이자율(+ Add Rate)
	//   이 꺾임 구조 덕분에 적정 수준의 유동성을 유지할 수 있다.

	import type { FactoryData } from '../config/fetchFactory';
	import { bpsToPercent } from '../config/fetchFactory';
	// bpsToPercent: bps 정수 → 퍼센트 문자열 변환 유틸리티.
	// 예) bpsToPercent(30) → "0.30%"

	// ─── Props (부모에서 전달받는 값들) ────────────────────────────────────────
	let {
		chainLabel,
		data,
		prevData = null,
		loading = false,
		error = null
	}: {
		chainLabel: string;
		data: FactoryData | null;
		prevData?: FactoryData | null;
		loading?: boolean;
		error?: string | null;
	} = $props();

	// ─── diff 배지 헬퍼 함수들 ───────────────────────────────────────────────

	// bps 차이를 "▲ +30 bps" 또는 "▼ -30 bps" 형태 문자열로 반환.
	// 변화 없으면 null → 템플릿에서 {#if lbl} 조건으로 배지를 숨김.
	function nd(curr: number, prev: number): string | null {
		const d = curr - prev;
		if (d === 0) return null;
		return d > 0 ? `▲ +${d} bps` : `▼ ${d} bps`;
	}

	// 방향만 반환 ('up' | 'down' | null) → CSS 클래스 .diff.up / .diff.down 결정.
	// .diff.up  → 초록색 (값 상승)
	// .diff.down → 빨간색 (값 하락)
	function nd_dir(curr: number, prev: number): 'up' | 'down' | null {
		if (curr === prev) return null;
		return curr > prev ? 'up' : 'down';
	}

	// ─── 복사 상태 ────────────────────────────────────────────────────────────
	// $state: 어떤 버튼이 최근에 눌렸는지 키를 저장해 복사 피드백 표시.
	// 버튼 클릭 → copied = 키 → 1초 후 null 복원 → 버튼 라벨 원상복구.
	let copied = $state<string | null>(null);

	let dtTipText = $state('');
	let dtTipX = $state(0);
	let dtTipY = $state(0);
	let dtTipVisible = $state(false);

	// 42자리 이더리움 주소 → "0x1234...abcd" 단축 표시.
	function shortenAddress(addr: string | undefined): string {
		if (!addr) return '—';
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	}

	// 클립보드에 복사하고 1초간 피드백 표시.
	function copy(key: string, text: string) {
		navigator.clipboard.writeText(text);
		copied = key;
		setTimeout(() => (copied = null), 1000);
	}

	// 카드 전체 데이터를 사람이 읽기 쉬운 JSON으로 복사.
	// - bigint → .toString() (JSON.stringify는 bigint 직접 처리 불가)
	// - bps 숫자 → bpsToPercent() 문자열 (예: 30 → "0.30%")
	function copyAll() {
		if (!data) return;
		const readable = {
			feeCollector:         data.feeCollector,
			beaconAddress:        data.beaconAddress,
			vault:                data.vault,
			aavePool:             data.aavePool,
			allPairsLength:       data.allPairsLength.toString(),
			fees: {
				feeLp:    bpsToPercent(data.fees.feeLp),
				feePool:  bpsToPercent(data.fees.feePool),
				burnFee:  bpsToPercent(data.fees.burnFee)
			},
			interestParams: {
				protocolFeeBps:        bpsToPercent(data.interestParams.protocolFeeBps),
				optimalPointBps:       bpsToPercent(data.interestParams.optimalPointBps),
				interestRateBaseBps:   bpsToPercent(data.interestParams.interestRateBaseBps),
				interestRateOptimalBps:bpsToPercent(data.interestParams.interestRateOptimalBps),
				interestRateAddBps:    bpsToPercent(data.interestParams.interestRateAddBps)
			},
			borrowLimitBps:        bpsToPercent(data.borrowLimitBps),
			liquidationPenaltyBps: bpsToPercent(data.liquidationPenaltyBps),
			maxBorrowPerTick:      bpsToPercent(data.maxBorrowPerTick),
			maxBorrowPerRange:     bpsToPercent(data.maxBorrowPerRange),
			priceDecay:            data.priceDecay.toString(),
			swapPriceToleranceBps: bpsToPercent(data.swapPriceToleranceBps),
			tickBuffer:            data.tickBuffer
		};
		navigator.clipboard.writeText(JSON.stringify(readable, null, 2));
		copied = '__all__';
		setTimeout(() => (copied = null), 1000);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onmousemove={(e) => {
	const dt = (e.target as Element)?.closest?.('dt') as HTMLElement | null;
	if (dt?.dataset.fn) {
		dtTipText = dt.dataset.fn;
		dtTipX = Math.min(e.clientX + 14, window.innerWidth - 340);
		dtTipY = e.clientY - 52;
		dtTipVisible = true;
	} else { dtTipVisible = false; }
}} onmouseleave={() => { dtTipVisible = false; }}>
	<!-- ─ 카드 헤더: 타이틀 + 전체 복사 버튼 ─ -->
	<div class="card-header">
		<h2>{chainLabel} — Factory</h2>
		{#if data}
			<button class="copy-btn" onclick={copyAll}>
				{copied === '__all__' ? '✓ Copied' : 'Copy all'}
			</button>
		{/if}
	</div>

	{#if loading}
		<p class="state-msg">Loading...</p>
	{:else if error}
		<p class="state-msg error">{error}</p>
	{:else if !data}
		<p class="state-msg muted">Not loaded</p>
	{:else}

		<!-- ─ Addresses (주소 목록) ─────────────────────────────────────────── -->
		<!--   프로토콜의 핵심 컨트랙트 주소들.                                     -->
		<!--   feeCollector: 수수료를 모으는 지갑 주소 (프로토콜 수익처)            -->
		<!--   beaconAddress: Beacon Proxy 구현체 주소 (Pair 업그레이드 기준점)    -->
		<!--   vault: 유휴 자금을 Aave에 예치해 이자를 버는 Vault 컨트랙트 주소    -->
		<!--   aavePool: 연결된 Aave 대출 풀 주소                                 -->
		<!--   allPairsLength: 현재까지 생성된 Pair 풀 수                          -->
		<section>
			<h3>Addresses</h3>
			<dl>
				<div class="row">
					<dt data-fn="getFeeCollector() — Address that collects protocol fees">Fee Collector</dt>
					<dd>
						<span title={data.feeCollector}>{shortenAddress(data.feeCollector)}</span>
						<button class="copy-icon" onclick={() => copy('feeCollector', data.feeCollector)}>
							{copied === 'feeCollector' ? '✓' : '⎘'}
						</button>
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getBeaconAddress() — Beacon proxy implementation address; updating it upgrades all Pair contracts at once">Beacon</dt>
					<dd>
						<span title={data.beaconAddress}>{shortenAddress(data.beaconAddress)}</span>
						<button class="copy-icon" onclick={() => copy('beacon', data.beaconAddress)}>
							{copied === 'beacon' ? '✓' : '⎘'}
						</button>
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getVault() — Vault contract that deposits idle funds into Aave to earn yield">Vault</dt>
					<dd>
						<span title={data.vault}>{shortenAddress(data.vault)}</span>
						<button class="copy-icon" onclick={() => copy('vault', data.vault)}>
							{copied === 'vault' ? '✓' : '⎘'}
						</button>
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAavePool() — Aave lending pool address connected to this factory">Aave Pool</dt>
					<dd>
						<span title={data.aavePool}>{shortenAddress(data.aavePool)}</span>
						<button class="copy-icon" onclick={() => copy('aavePool', data.aavePool)}>
							{copied === 'aavePool' ? '✓' : '⎘'}
						</button>
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAllPairsLength() — Number of Pair pools deployed by this factory">Total Pairs</dt>
					<dd>{data.allPairsLength.toString()}</dd>
				</div>
			</dl>
		</section>

		<!-- ─ Fees (수수료) ──────────────────────────────────────────────────── -->
		<!--   스왑(토큰 교환) 시 부과되는 수수료 구조:                              -->
		<!--   feeLp    : LP(유동성 공급자)에게 돌아가는 수수료. 예) 0.30%          -->
		<!--   feePool  : 프로토콜 운영 수수료. feeCollector 주소로 전송.           -->
		<!--   burnFee  : LP 토큰 소각(burn) 시 부과 수수료.                       -->
		<!--   세 수수료 합계 = 사용자가 실제로 부담하는 총 스왑 수수료.              -->
		<section>
			<h3>Fees</h3>
			<dl>
				<div class="row">
					<dt data-fn="getFeesBps()[0] — Swap fee paid to LP (liquidity providers)">LP Fee</dt>
					<dd>
						{bpsToPercent(data.fees.feeLp)}
						{#if prevData}{@const lbl = nd(data.fees.feeLp, prevData.fees.feeLp)}{#if lbl}<span class="diff {nd_dir(data.fees.feeLp, prevData.fees.feeLp)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getFeesBps()[1] — Swap fee collected by the protocol (sent to feeCollector)">Pool Fee</dt>
					<dd>
						{bpsToPercent(data.fees.feePool)}
						{#if prevData}{@const lbl = nd(data.fees.feePool, prevData.fees.feePool)}{#if lbl}<span class="diff {nd_dir(data.fees.feePool, prevData.fees.feePool)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getFeesBps()[2] — Fee charged when LP tokens are burned">Burn Fee</dt>
					<dd>
						{bpsToPercent(data.fees.burnFee)}
						{#if prevData}{@const lbl = nd(data.fees.burnFee, prevData.fees.burnFee)}{#if lbl}<span class="diff {nd_dir(data.fees.burnFee, prevData.fees.burnFee)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
			</dl>
		</section>

		<!-- ─ Interest Rate Model (이자율 모델) ─────────────────────────────── -->
		<!--   Kinked IRM(꺾임 이자율 모델) 파라미터:                             -->
		<!--   protocolFeeBps    : 이자 수익 중 프로토콜이 가져가는 비율.           -->
		<!--   optimalPointBps   : 이자율 곡선이 꺾이는 사용률 기준점(%)            -->
		<!--                       예) 80%이면 사용률 80% 이상부터 이자율 급등.    -->
		<!--   interestRateBaseBps   : 사용률 0일 때 연이자율.                    -->
		<!--   interestRateOptimalBps: optimalPoint 사용률에서의 연이자율.         -->
		<!--   interestRateAddBps    : optimalPoint 초과 시 추가 연이자율.        -->
		<section>
			<h3>Interest Rate Model</h3>
			<dl>
				<div class="row">
					<dt data-fn="getInterestParamsBps() → protocolFeeBps — Share of interest revenue taken by the protocol">Protocol Fee</dt>
					<dd>
						{bpsToPercent(data.interestParams.protocolFeeBps)}
						{#if prevData}{@const lbl = nd(data.interestParams.protocolFeeBps, prevData.interestParams.protocolFeeBps)}{#if lbl}<span class="diff {nd_dir(data.interestParams.protocolFeeBps, prevData.interestParams.protocolFeeBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getInterestParamsBps() → optimalPointBps — Utilization rate at which the interest curve kinks; above this, interest rises sharply">Optimal Point</dt>
					<dd>
						{bpsToPercent(data.interestParams.optimalPointBps)}
						{#if prevData}{@const lbl = nd(data.interestParams.optimalPointBps, prevData.interestParams.optimalPointBps)}{#if lbl}<span class="diff {nd_dir(data.interestParams.optimalPointBps, prevData.interestParams.optimalPointBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getInterestParamsBps() → interestRateBaseBps — Annual interest rate at 0% utilization">Base Rate</dt>
					<dd>
						{bpsToPercent(data.interestParams.interestRateBaseBps)}
						{#if prevData}{@const lbl = nd(data.interestParams.interestRateBaseBps, prevData.interestParams.interestRateBaseBps)}{#if lbl}<span class="diff {nd_dir(data.interestParams.interestRateBaseBps, prevData.interestParams.interestRateBaseBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getInterestParamsBps() → interestRateOptimalBps — Annual interest rate at optimal utilization">Optimal Rate</dt>
					<dd>
						{bpsToPercent(data.interestParams.interestRateOptimalBps)}
						{#if prevData}{@const lbl = nd(data.interestParams.interestRateOptimalBps, prevData.interestParams.interestRateOptimalBps)}{#if lbl}<span class="diff {nd_dir(data.interestParams.interestRateOptimalBps, prevData.interestParams.interestRateOptimalBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getInterestParamsBps() → interestRateAddBps — Additional rate applied above optimal utilization to discourage excess borrowing">Add Rate</dt>
					<dd>
						{bpsToPercent(data.interestParams.interestRateAddBps)}
						{#if prevData}{@const lbl = nd(data.interestParams.interestRateAddBps, prevData.interestParams.interestRateAddBps)}{#if lbl}<span class="diff {nd_dir(data.interestParams.interestRateAddBps, prevData.interestParams.interestRateAddBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
			</dl>
		</section>

		<!-- ─ Borrow / Liquidation (대출 / 청산) ─────────────────────────────── -->
		<!--   borrowLimitBps       : 담보 가치 대비 최대 대출 가능 비율 (LTV).    -->
		<!--                          예) 8000 bps = 80% → 100 USDC 담보 시      -->
		<!--                          최대 80 USDC까지 대출 가능.                 -->
		<!--   liquidationPenaltyBps: 청산(liquidation) 발생 시 청산자가 받는 보상. -->
		<!--                          담보 자산의 일부를 할인가로 가져가는 형태.     -->
		<!--   maxBorrowPerTick      : 하나의 가격 구간(tick)에서 허용하는           -->
		<!--                          최대 대출 비율. 집중 위험 방지용.             -->
		<!--   maxBorrowPerRange     : 연속된 틱 범위 전체 대출 한도.              -->
		<section>
			<h3>Borrow / Liquidation</h3>
			<dl>
				<div class="row">
					<dt data-fn="getBorrowLimitBps() — Max borrow ratio relative to collateral value (LTV). e.g. 8000 bps = 80%">Borrow Limit</dt>
					<dd>
						{bpsToPercent(data.borrowLimitBps)}
						{#if prevData}{@const lbl = nd(data.borrowLimitBps, prevData.borrowLimitBps)}{#if lbl}<span class="diff {nd_dir(data.borrowLimitBps, prevData.borrowLimitBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getLiquidationPenaltyBps() — Bonus paid to liquidators when a position is liquidated">Liquidation Penalty</dt>
					<dd>
						{bpsToPercent(data.liquidationPenaltyBps)}
						{#if prevData}{@const lbl = nd(data.liquidationPenaltyBps, prevData.liquidationPenaltyBps)}{#if lbl}<span class="diff {nd_dir(data.liquidationPenaltyBps, prevData.liquidationPenaltyBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getMaxBorrowPerTickAndRange()[0] — Max borrow ratio per single price tick (prevents concentration risk)">Max Borrow / Tick</dt>
					<dd>
						{bpsToPercent(data.maxBorrowPerTick)}
						{#if prevData}{@const lbl = nd(data.maxBorrowPerTick, prevData.maxBorrowPerTick)}{#if lbl}<span class="diff {nd_dir(data.maxBorrowPerTick, prevData.maxBorrowPerTick)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getMaxBorrowPerTickAndRange()[1] — Max borrow ratio across a continuous range of ticks">Max Borrow / Range</dt>
					<dd>
						{bpsToPercent(data.maxBorrowPerRange)}
						{#if prevData}{@const lbl = nd(data.maxBorrowPerRange, prevData.maxBorrowPerRange)}{#if lbl}<span class="diff {nd_dir(data.maxBorrowPerRange, prevData.maxBorrowPerRange)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
			</dl>
		</section>

		<!-- ─ Price / Tick (가격 / 틱 파라미터) ─────────────────────────────── -->
		<!--   priceDecay         : 가상 가격(virtual price)이 실제 시장가로        -->
		<!--                        수렴하는 속도. 클수록 빠르게 수렴.              -->
		<!--   swapPriceToleranceBps: 스왑 실행 시 허용하는 최대 슬리피지.          -->
		<!--                          슬리피지 = 예상 체결가와 실제 체결가의 차이.  -->
		<!--   tickBuffer         : 청산 계산 시 가격 구간에 추가하는 여유 틱 수.   -->
		<!--                        갑작스러운 가격 변동에 대한 안전마진 역할.       -->
		<section>
			<h3>Price / Tick</h3>
			<dl>
				<div class="row">
					<dt data-fn="getPriceDecay() — Speed at which the virtual price converges to the market price. Higher value = faster convergence">Price Decay</dt>
					<dd>
						{data.priceDecay.toString()}
						{#if prevData && data.priceDecay !== prevData.priceDecay}
							{@const d = data.priceDecay - prevData.priceDecay}
							<span class="diff {d > 0n ? 'up' : 'down'}">{d > 0n ? '▲ +' : '▼ '}{d}</span>
						{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getSwapPriceToleranceBps() — Max slippage allowed during a swap (expected vs actual execution price)">Swap Tolerance</dt>
					<dd>
						{bpsToPercent(data.swapPriceToleranceBps)}
						{#if prevData}{@const lbl = nd(data.swapPriceToleranceBps, prevData.swapPriceToleranceBps)}{#if lbl}<span class="diff {nd_dir(data.swapPriceToleranceBps, prevData.swapPriceToleranceBps)}">{lbl}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getTickBuffer() — Extra ticks added during liquidation calculation as a safety margin against sudden price moves">Tick Buffer</dt>
					<dd>
						{data.tickBuffer}
						{#if prevData && data.tickBuffer !== prevData.tickBuffer}
							{@const d = data.tickBuffer - prevData.tickBuffer}
							<span class="diff {d > 0 ? 'up' : 'down'}">{d > 0 ? '▲ +' : '▼ '}{d}</span>
						{/if}
					</dd>
				</div>
			</dl>
		</section>
	{/if}
</div>

{#if dtTipVisible && dtTipText}
	<div class="fn-tip" style="left:{dtTipX}px;top:{dtTipY}px">{dtTipText}</div>
{/if}

<style>
	/* ─ 카드 전체 ─────────────────────────────────────────────────────────── */
	.card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		background: #fff;
		min-width: 280px;
	}

	/* ─ 헤더: 타이틀 + Copy all 버튼 ──────────────────────────────────────── */
	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}
	.card-header h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	/* ─ 섹션 구분선 ────────────────────────────────────────────────────────── */
	section {
		margin-bottom: 1rem;
	}
	h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		margin: 0 0 0.15rem;
	}

	/* ─ dl / 행 레이아웃 ──────────────────────────────────────────────────── */
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
	/* dt: 레이블. flex-shrink:0 → 공간 부족해도 줄어들지 않음. */
	dt {
		font-size: 0.75rem;
		color: #64748b;
		flex-shrink: 0;
	}
	/* dd: 값. flex:1 → 남은 공간 전부 차지. justify-content:flex-end → 오른쪽 정렬. */
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

	/* ─ 버튼들 ─────────────────────────────────────────────────────────────── */
	.copy-btn {
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		background: #f8fafc;
		cursor: pointer;
		color: #475569;
		white-space: nowrap;
	}
	.copy-btn:hover { background: #f1f5f9; }

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

	/* ─ 상태 메시지 ────────────────────────────────────────────────────────── */
	.state-msg {
		font-size: 0.85rem;
		text-align: center;
		padding: 1rem 0;
		color: #64748b;
	}
	.state-msg.error { color: #ef4444; }
	.state-msg.muted { color: #94a3b8; }

	dt[data-fn] { cursor: help; }

	/* ─ diff 배지: 값이 올랐으면 초록, 내렸으면 빨강 ──────────────────────── */
	.diff {
		font-size: 0.65rem;
		font-weight: 600;
		margin-left: 4px;
		white-space: nowrap;
	}
	.diff.up   { color: #16a34a; }
	.diff.down { color: #dc2626; }


</style>
