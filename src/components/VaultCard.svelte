<script lang="ts">
	// ─── VaultCard.svelte — Vault contract data display component ────────────
	//
	// Receives a single VaultData and renders it as a card.
	// When date comparison is active, prevData is also received and numeric changes are shown with diff badges.

	import type { VaultData } from '../config/fetchVault';
	import type { ChainKey } from '../config/chains';
	import type { EditDraft, EditField } from '../config/editing';

	// $props(): Svelte 5 rune. Destructures values passed in from the parent component.
	// data: Vault data at the current (or end date) snapshot
	// prevData: Vault data at the comparison (start date) snapshot (diff badges hidden if null)
	// tokenSymbols: token address (lowercase) → symbol map, built from pairs data by the parent.
	let {
		data,
		prevData = null,
		tokenSymbols = {},
		chainKey = undefined,
		chainLabel = '',
		onEdit = undefined,
		expandSignal = 0
	}: {
		data: VaultData;
		prevData?: VaultData | null;
		tokenSymbols?: Record<string, string>;
		chainKey?: ChainKey;
		chainLabel?: string;
		onEdit?: (draft: EditDraft) => void;
		expandSignal?: number;
	} = $props();

	// Returns diff badge info for two bigint values.
	// bigint: a special integer type in JavaScript. Used to safely handle Solidity uint256.
	//   - regular number is only accurate up to 2^53 (~9 quadrillion)
	//   - uint256 goes up to 2^256 → bigint is required
	//   - literals: 0n, 100n, -5n (append n)
	//   - arithmetic: curr - prev must be between bigints (bigint + number is not allowed)
	//
	// Returns: { label: "▲ +1234", dir: "up" } or null (no change)
	function bigDiff(curr: bigint, prev: bigint): { label: string; dir: 'up' | 'down' } | null {
		if (curr === prev) return null;
		const d = curr - prev;
		const abs = d < 0n ? -d : d; // absolute value (bigint does not support Math.abs)
		return { label: d > 0n ? `▲ +${abs}` : `▼ -${abs}`, dir: d > 0n ? 'up' : 'down' };
	}

	// $state: copy feedback state. Stores the key of the most recently clicked button.
	let copied = $state<string | null>(null);
	let collapsed = $state(true);

	let dtTipText = $state('');
	let dtTipX = $state(0);
	let dtTipY = $state(0);
	let dtTipVisible = $state(false);

	$effect(() => {
		if (expandSignal > 0) collapsed = false;
	});

	function shortenAddress(addr: string | undefined): string {
		if (!addr) return '—';
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	}

	function copy(key: string, text: string) {
		navigator.clipboard.writeText(text);
		copied = key;
		setTimeout(() => (copied = null), 1000);
	}

	// Copies the full card data as JSON.
	// bigint must be converted to .toString() for JSON.stringify to handle it.
	function copyAll() {
		const readable = {
			address: data.address,
			factory: data.factory,
			aavePool: data.aavePool,
			tokens: data.tokens.map((t) => ({
				token: t.token,
				// isIdle: true = this token is held in the Vault (not deposited to Aave)
				isIdle: t.isIdle,
				totalBalance: t.assetData.totalBalance.toString(),
				totalShares: t.assetData.totalShares.toString(),
				forceIdle: t.assetData.forceIdle,
				yieldAccumulator: t.yieldAccumulator.toString(),
				aave: {
					supported: t.aaveSupport.supported,
					frozen: t.aaveSupport.frozen,
					paused: t.aaveSupport.paused,
					migrateAsset: t.aaveSupport.migrateAsset
				}
			}))
		};
		navigator.clipboard.writeText(JSON.stringify(readable, null, 2));
		copied = '__all__';
		setTimeout(() => (copied = null), 1000);
	}

	function editVault(title: string, fields: EditField[], buildArgs: EditDraft['buildArgs']) {
		if (!chainKey || !onEdit) return;
		onEdit({
			chainKey,
			chainName: chainLabel,
			targetLabel: 'Vault',
			targetAddress: data.address,
			contractKind: 'vault',
			functionName: 'setForceIdle',
			title,
			fields,
			buildArgs
		});
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" class:collapsed onmousemove={(e) => {
	const dt = (e.target as Element)?.closest?.('dt') as HTMLElement | null;
	if (dt?.dataset.fn) {
		dtTipText = dt.dataset.fn;
		dtTipX = Math.min(e.clientX + 14, window.innerWidth - 340);
		dtTipY = e.clientY - 52;
		dtTipVisible = true;
	} else { dtTipVisible = false; }
}} onmouseleave={() => { dtTipVisible = false; }}>
	<div class="card-header">
		<button
			class="card-toggle"
			aria-expanded={!collapsed}
			aria-label={`${collapsed ? 'Expand' : 'Collapse'} Vault`}
			title={collapsed ? 'Expand vault' : 'Collapse vault'}
			onclick={() => (collapsed = !collapsed)}
		>
			<span class="toggle-icon" aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
			<div>
				<h2>Vault</h2>
				<span class="addr" title={data.address}>{shortenAddress(data.address)}</span>
			</div>
		</button>
		<button class="copy-btn" onclick={copyAll}>
			{copied === '__all__' ? '✓ Copied' : 'Copy all'}
		</button>
	</div>

	{#if !collapsed}
		<section>
			<h3>Addresses</h3>
			<dl>
				<div class="row">
					<dt data-fn="getFactory() — Factory contract that deployed this vault">Factory</dt>
					<dd>
						<span title={data.factory}>{shortenAddress(data.factory)}</span>
						<button class="copy-icon" onclick={() => copy('factory', data.factory)}
							>{copied === 'factory' ? '✓' : '⎘'}</button
						>
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAavePool() — Aave lending pool address where idle funds are deposited">Aave Pool</dt>
					<dd>
						<span title={data.aavePool}>{shortenAddress(data.aavePool)}</span>
						<button class="copy-icon" onclick={() => copy('aave', data.aavePool)}
							>{copied === 'aave' ? '✓' : '⎘'}</button
						>
					</dd>
				</div>
			</dl>
		</section>

		<!-- per-token sections -->
		{#each data.tokens as t, i (t.token)}
			{@const pt = prevData?.tokens[i] ?? null}
			{@const sym = tokenSymbols[t.token.toLowerCase()] ?? ''}
			<section>
				<h3>
					{sym ? `${sym} —` : `Token ${i} —`}
					<span title={t.token}>{shortenAddress(t.token)}</span>
					<button class="copy-icon" onclick={() => copy('token' + i, t.token)}
						>{copied === 'token' + i ? '✓' : '⎘'}</button
					>
				</h3>
				<dl>
				<div class="row">
					<dt data-fn="getAssetStatus() — true = token held in vault (not deposited to Aave); false = deposited to Aave earning yield">Is Idle</dt>
					<dd class:badge-green={!t.isIdle} class:badge-gray={t.isIdle}>
						{t.isIdle ? 'Idle' : 'In Aave'}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAssetData() → forceIdle — Whether this token is forced to stay idle in this vault">Force Idle</dt>
					<dd>
						{t.assetData.forceIdle ? 'Yes' : 'No'}
						<button class="edit-icon" title="Edit setting" onclick={() => editVault(
							`Force Idle ${sym || shortenAddress(t.token)}`,
							[
								{ key: 'token', label: 'Token', type: 'address', value: t.token },
								{ key: 'forceIdle', label: 'Force idle', type: 'bool', value: String(t.assetData.forceIdle) }
							],
							(values) => [values.token, values.forceIdle]
						)}>✎</button>
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getYieldAccumulator() — Normalized yield accumulator in RAY (10²⁷). Starts at 1.000000×, increases as Aave interest accrues">Yield Accumulator</dt>
					<dd>
						{(Number(t.yieldAccumulator) / 1e27).toFixed(6)}<span class="unit">×</span>
						{#if pt}{@const d = bigDiff(t.yieldAccumulator, pt.yieldAccumulator)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAssetData() → totalBalance — Total token balance tracked by the vault">Total Balance</dt>
					<dd>
						{t.assetData.totalBalance.toString()}
						{#if pt}{@const d = bigDiff(t.assetData.totalBalance, pt.assetData.totalBalance)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAssetData() → totalShares — Total vault shares tracked for this token">Total Shares</dt>
					<dd>
						{t.assetData.totalShares.toString()}
						{#if pt}{@const d = bigDiff(t.assetData.totalShares, pt.assetData.totalShares)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
					</dd>
				</div>
			</dl>

			<div class="sub-section">
				<h4>Aave Support</h4>
				<dl>
					<div class="row">
						<dt data-fn="getAaveTokenSupport() → supported — Whether Aave supports this token as a deposit asset">Supported</dt>
						<dd>{t.aaveSupport.supported ? 'Yes' : 'No'}</dd>
					</div>
					<div class="row">
						<dt data-fn="getAaveTokenSupport() → frozen — Whether Aave marks this asset as frozen">Frozen</dt>
						<dd>{t.aaveSupport.frozen ? 'Yes' : 'No'}</dd>
					</div>
					<div class="row">
						<dt data-fn="getAaveTokenSupport() → paused — Whether Aave marks this asset as paused">Paused</dt>
						<dd>{t.aaveSupport.paused ? 'Yes' : 'No'}</dd>
					</div>
				</dl>
			</div>
			</section>
		{/each}
	{/if}
</div>

{#if dtTipVisible && dtTipText}
	<div class="fn-tip" style="left:{dtTipX}px;top:{dtTipY}px">{dtTipText}</div>
{/if}

<style>
	.card {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 0.85rem;
		background: #fff;
		min-width: 0;
		box-sizing: border-box;
	}
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 0.65rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid #e2e8f0;
	}
	.card-header h2 {
		font-size: 0.9rem;
		font-weight: 600;
		margin: 0 0 2px;
	}
	.card.collapsed .card-header {
		margin-bottom: 0;
		padding-bottom: 0;
		border-bottom: none;
	}
	.card-toggle {
		display: flex;
		align-items: flex-start;
		gap: 0.35rem;
		min-width: 0;
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
	.toggle-icon {
		width: 0.75rem;
		color: #64748b;
		line-height: 1rem;
	}
	.addr {
		font-size: 0.68rem;
		font-family: monospace;
		color: #94a3b8;
	}
	section {
		margin-bottom: 0.65rem;
	}
	h3 {
		font-size: 0.68rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #64748b;
		margin: 0 0 0.5rem;
		display: flex;
		align-items: center;
		gap: 4px;
	}
	h4 {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #94a3b8;
		margin: 0.5rem 0 0.3rem;
	}
	dl {
		margin: 0;
	}
	.sub-section {
		margin-top: 0.35rem;
		padding-top: 0.35rem;
		border-top: 1px dashed #e2e8f0;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.16rem 0;
		border-bottom: 1px solid #f1f5f9;
	}
	.row:last-child {
		border-bottom: none;
	}
	dt {
		font-size: 0.68rem;
		color: #64748b;
		flex-shrink: 0;
	}
	dd {
		font-size: 0.68rem;
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
		word-break: break-all;
	}
	.badge-green {
		color: #16a34a;
	}
	.badge-gray {
		color: #94a3b8;
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
	.edit-icon {
		font-size: 0.7rem;
		padding: 0 3px;
		border: none;
		background: transparent;
		cursor: pointer;
		color: #16a34a;
		line-height: 1;
	}
	.edit-icon:hover { color: #15803d; }
	dt[data-fn] { cursor: help; }

	.diff {
		font-size: 0.65rem;
		font-weight: 600;
		margin-left: 4px;
		white-space: nowrap;
	}
	.diff.up { color: #16a34a; }
	.diff.down { color: #dc2626; }
</style>
