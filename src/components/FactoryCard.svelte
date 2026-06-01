<script lang="ts">
	// ─── FactoryCard.svelte — Factory contract data display component ───────
	//
	// ■ What is the Factory?
	//   The "master contract" that manages the entire UniPool protocol.
	//   Two roles:
	//   1) Pair pool creation: deploys new liquidity pools for token pairs (e.g. WETH/USDC).
	//   2) Global parameter management: stores the protocol-wide defaults for
	//      fees, interest rate model, liquidation ratios, etc.
	//      Each Pair inherits these defaults but can override them individually.
	//
	// ■ What is a Beacon Proxy?
	//   A smart contract upgrade pattern.
	//   All Pair contracts point to a single address called the "Beacon".
	//   The Beacon stores the address of the current implementation contract.
	//   When the protocol team updates the Beacon's implementation address,
	//   all Pairs upgrade simultaneously.
	//   → Far cheaper in gas than upgrading each Pair individually.
	//
	// ■ What are bps (Basis Points)?
	//   A unit for expressing fees or rates. 1 bps = 0.01% = 0.0001.
	//   e.g. 30 bps = 0.30%, 8000 bps = 80.00%
	//   Stored as integers to eliminate floating-point rounding errors.
	//   Display: bpsToPercent(30) → "0.30%".
	//
	// ■ What is an IRM (Interest Rate Model)?
	//   A formula that dynamically determines the interest rate based on utilization.
	//   UniPool uses a "Kinked IRM":
	//   - utilization < optimalPoint  → low base interest rate (Base Rate)
	//   - utilization = optimalPoint  → target interest rate (Optimal Rate)
	//   - utilization > optimalPoint  → sharply rising interest rate (+ Add Rate)
	//   This kinked structure helps maintain appropriate liquidity levels.

	import type { FactoryData } from '../config/fetchFactory';
	import { bpsToPercent } from '../config/fetchFactory';
	// bpsToPercent: utility that converts a bps integer → percentage string.
	// e.g. bpsToPercent(30) → "0.30%"

	// ─── Props (values passed in from the parent component) ───────────────────
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

	// ─── Diff badge helper functions ─────────────────────────────────────────

	// Returns a bps difference as "▲ +30 bps" or "▼ -30 bps" string.
	// Returns null if unchanged → template hides the badge with {#if lbl}.
	function nd(curr: number, prev: number): string | null {
		const d = curr - prev;
		if (d === 0) return null;
		return d > 0 ? `▲ +${d} bps` : `▼ ${d} bps`;
	}

	// Returns direction only ('up' | 'down' | null) → determines CSS class .diff.up / .diff.down.
	// .diff.up   → green (value increased)
	// .diff.down → red (value decreased)
	function nd_dir(curr: number, prev: number): 'up' | 'down' | null {
		if (curr === prev) return null;
		return curr > prev ? 'up' : 'down';
	}

	// ─── Copy state ───────────────────────────────────────────────────────────
	// $state: stores the key of the most recently clicked button to show copy feedback.
	// Button click → copied = key → null restored after 1 second → button label resets.
	let copied = $state<string | null>(null);

	let dtTipText = $state('');
	let dtTipX = $state(0);
	let dtTipY = $state(0);
	let dtTipVisible = $state(false);

	// Shortens a 42-character Ethereum address to "0x1234...abcd".
	function shortenAddress(addr: string | undefined): string {
		if (!addr) return '—';
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	}

	// Copies text to clipboard and shows feedback for 1 second.
	function copy(key: string, text: string) {
		navigator.clipboard.writeText(text);
		copied = key;
		setTimeout(() => (copied = null), 1000);
	}

	// Copies the full card data as human-readable JSON.
	// - bigint → .toString() (JSON.stringify cannot handle bigint directly)
	// - bps number → bpsToPercent() string (e.g. 30 → "0.30%")
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
	<!-- ─ Card header: title + copy-all button ─ -->
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

		<!-- ─ Addresses ─────────────────────────────────────────────────────── -->
		<!--   Core protocol contract addresses.                                    -->
		<!--   feeCollector: wallet address that collects protocol fees             -->
		<!--   beaconAddress: Beacon Proxy implementation address (upgrade anchor)  -->
		<!--   vault: Vault contract that deposits idle funds into Aave for yield   -->
		<!--   aavePool: connected Aave lending pool address                        -->
		<!--   allPairsLength: total number of Pair pools deployed so far           -->
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

		<!-- ─ Fees ──────────────────────────────────────────────────────────── -->
		<!--   Fee structure applied on each swap (token exchange):                 -->
		<!--   feeLp    : fee returned to LPs (liquidity providers). e.g. 0.30%    -->
		<!--   feePool  : protocol operations fee, sent to feeCollector address.    -->
		<!--   burnFee  : fee charged when LP tokens are burned.                    -->
		<!--   sum of all three = total swap fee paid by the user.                  -->
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

		<!-- ─ Interest Rate Model ───────────────────────────────────────────── -->
		<!--   Kinked IRM parameters:                                               -->
		<!--   protocolFeeBps    : share of interest revenue taken by the protocol. -->
		<!--   optimalPointBps   : utilization threshold where the rate curve kinks -->
		<!--                       e.g. 80% → rate spikes above 80% utilization.   -->
		<!--   interestRateBaseBps   : annual rate at 0% utilization.               -->
		<!--   interestRateOptimalBps: annual rate at optimal utilization.           -->
		<!--   interestRateAddBps    : additional annual rate above optimal.         -->
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

		<!-- ─ Borrow / Liquidation ──────────────────────────────────────────── -->
		<!--   borrowLimitBps       : max loan-to-value ratio (LTV).               -->
		<!--                          e.g. 8000 bps = 80% → $100 collateral        -->
		<!--                          allows up to $80 borrow.                      -->
		<!--   liquidationPenaltyBps: bonus paid to the liquidator when a position  -->
		<!--                          is liquidated (as a discount on collateral).  -->
		<!--   maxBorrowPerTick      : max borrow ratio per single price tick;       -->
		<!--                          prevents concentration risk.                  -->
		<!--   maxBorrowPerRange     : max borrow ratio across a full tick range.   -->
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

		<!-- ─ Price / Tick ──────────────────────────────────────────────────── -->
		<!--   priceDecay         : speed at which virtual price converges to       -->
		<!--                        market price. Higher = faster convergence.      -->
		<!--   swapPriceToleranceBps: max allowed slippage during a swap.           -->
		<!--                          slippage = expected vs. actual execution price.-->
		<!--   tickBuffer         : extra ticks added to price range in liquidation  -->
		<!--                        calculations; acts as a safety margin.          -->
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
	/* ─ card container ──────────────────────────────────────────────────── */
	.card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		background: #fff;
		min-width: 280px;
	}

	/* ─ header: title + Copy all button ───────────────────────────────────── */
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

	/* ─ section dividers ────────────────────────────────────────────────────── */
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

	/* ─ dl / row layout ───────────────────────────────────────────────────── */
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
	/* dt: label. flex-shrink:0 → does not shrink even when space is tight. */
	dt {
		font-size: 0.75rem;
		color: #64748b;
		flex-shrink: 0;
	}
	/* dd: value. flex:1 → takes all remaining space. justify-content:flex-end → right-align. */
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

	/* ─ buttons ─────────────────────────────────────────────────────────────── */
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

	/* ─ state messages ──────────────────────────────────────────────────────── */
	.state-msg {
		font-size: 0.85rem;
		text-align: center;
		padding: 1rem 0;
		color: #64748b;
	}
	.state-msg.error { color: #ef4444; }
	.state-msg.muted { color: #94a3b8; }

	dt[data-fn] { cursor: help; }

	/* ─ diff badge: green if value increased, red if decreased ─────────────── */
	.diff {
		font-size: 0.65rem;
		font-weight: 600;
		margin-left: 4px;
		white-space: nowrap;
	}
	.diff.up   { color: #16a34a; }
	.diff.down { color: #dc2626; }


</style>
