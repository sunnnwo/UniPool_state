<script lang="ts">
	// ─── VaultCard.svelte — Vault 컨트랙트 데이터 표시 컴포넌트 ─────────────
	//
	// 이 컴포넌트는 VaultData 하나를 받아 카드 형태로 보여준다.
	// 날짜 비교 기능 사용 시 prevData도 받아 수치 변화를 diff 배지로 표시.

	import type { VaultData } from '../config/fetchVault';

	// $props(): Svelte 5 룬. 부모 컴포넌트에서 전달받은 값을 구조 분해.
	// data: 현재(또는 종료일) 시점의 Vault 데이터
	// prevData: 비교 기준(시작일) 시점의 Vault 데이터 (없으면 diff 배지 미표시)
	// tokenSymbols: 토큰 주소(소문자) → 심볼 맵. 부모가 pairs 데이터에서 빌드해 전달.
	let {
		data,
		prevData = null,
		tokenSymbols = {}
	}: { data: VaultData; prevData?: VaultData | null; tokenSymbols?: Record<string, string> } = $props();

	// bigint 두 값의 차이를 diff 배지 정보로 반환.
	// bigint: JavaScript의 특별한 정수 타입. 솔리디티 uint256을 안전하게 처리하기 위해 사용.
	//   - 일반 number는 2^53까지만 정확 (약 9경)
	//   - uint256은 2^256까지 → bigint 필요
	//   - 리터럴 표기: 0n, 100n, -5n (끝에 n을 붙임)
	//   - 연산: curr - prev는 bigint끼리 해야 함 (bigint + number 불가)
	//
	// 반환값: { label: "▲ +1234", dir: "up" } 또는 null(변화 없음)
	function bigDiff(curr: bigint, prev: bigint): { label: string; dir: 'up' | 'down' } | null {
		if (curr === prev) return null;
		const d = curr - prev;
		const abs = d < 0n ? -d : d; // 절댓값 계산 (bigint는 Math.abs 사용 불가)
		return { label: d > 0n ? `▲ +${abs}` : `▼ -${abs}`, dir: d > 0n ? 'up' : 'down' };
	}

	// $state: 복사 피드백 상태. 어떤 버튼이 최근에 눌렸는지 키를 저장.
	let copied = $state<string | null>(null);

	let dtTipText = $state('');
	let dtTipX = $state(0);
	let dtTipY = $state(0);
	let dtTipVisible = $state(false);

	function shortenAddress(addr: string | undefined): string {
		if (!addr) return '—';
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	}

	function copy(key: string, text: string) {
		navigator.clipboard.writeText(text);
		copied = key;
		setTimeout(() => (copied = null), 1000);
	}

	// 카드 전체 데이터를 JSON으로 복사.
	// bigint를 .toString()으로 변환해야 JSON.stringify가 처리 가능.
	function copyAll() {
		const readable = {
			address: data.address,
			factory: data.factory,
			aavePool: data.aavePool,
			tokens: data.tokens.map((t) => ({
				token: t.token,
				// isIdle: true = 이 토큰은 Vault에서 그냥 보관 중 (Aave 미예치)
				isIdle: t.isIdle,
				isActive: t.assetData.isActive,
				isSupported: t.assetData.isSupported,
				// yieldAccumulator: Aave 이자 누적 배율 (RAY = 10^27 단위의 bigint)
				yieldAccumulator: t.assetData.yieldAccumulator.toString(),
				lastYieldAccumulator: t.assetData.lastYieldAccumulator.toString(),
				aave: {
					isSupported: t.aaveSupport.isSupported,
					// aToken: Aave에서 예치 시 받는 이자 토큰 주소 (예: aUSDC)
					aToken: t.aaveSupport.aToken,
					currentBalance: t.aaveSupport.currentBalance.toString(),
					targetBalance: t.aaveSupport.targetBalance.toString()
				}
			}))
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
	<div class="card-header">
		<div>
			<h2>Vault</h2>
			<span class="addr" title={data.address}>{shortenAddress(data.address)}</span>
		</div>
		<button class="copy-btn" onclick={copyAll}>
			{copied === '__all__' ? '✓ Copied' : 'Copy all'}
		</button>
	</div>

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

	<!-- 토큰별 섹션 -->
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
					<dt data-fn="getAssetData() → isSupported — Whether this token is enabled for yield management in this vault">Supported</dt>
					<dd>{t.assetData.isSupported ? 'Yes' : 'No'}</dd>
				</div>
				<div class="row">
					<dt data-fn="getYieldAccumulator() — Normalized yield accumulator in RAY (10²⁷). Starts at 1.000000×, increases as Aave interest accrues">Yield Accumulator</dt>
					<dd>
						{(Number(t.yieldAccumulator) / 1e27).toFixed(6)}<span class="unit">×</span>
						{#if pt}{@const d = bigDiff(t.yieldAccumulator, pt.yieldAccumulator)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
					</dd>
				</div>
				<div class="row">
					<dt data-fn="getAssetData() → lastYieldAccumulator — Raw accumulator at last on-chain update. Difference from current = pending unrecorded interest">Last Yield Acc. (raw)</dt>
					<dd>
						{t.assetData.lastYieldAccumulator.toString()}
						{#if pt}{@const d = bigDiff(t.assetData.lastYieldAccumulator, pt.assetData.lastYieldAccumulator)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
					</dd>
				</div>
			</dl>

			<div class="sub-section">
				<h4>Aave Support</h4>
				<dl>
					<div class="row">
						<dt data-fn="getAaveTokenSupport() → isSupported — Whether Aave supports this token as a deposit asset">Supported</dt>
						<dd>{t.aaveSupport.isSupported ? 'Yes' : 'No'}</dd>
					</div>
					<div class="row">
						<dt data-fn="getAaveTokenSupport() → currentBalance — aToken balance held by the vault (Aave deposit receipt token). 0 when isIdle = true">Current Balance</dt>
						<dd>
							{t.aaveSupport.currentBalance.toString()}
							{#if pt}{@const d = bigDiff(t.aaveSupport.currentBalance, pt.aaveSupport.currentBalance)}{#if d}<span class="diff {d.dir}">{d.label}</span>{/if}{/if}
						</dd>
					</div>
				</dl>
			</div>
		</section>
	{/each}
</div>

{#if dtTipVisible && dtTipText}
	<div class="fn-tip" style="left:{dtTipX}px;top:{dtTipY}px">{dtTipText}</div>
{/if}

<style>
	.card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.25rem;
		background: #fff;
		min-width: 280px;
	}
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e2e8f0;
	}
	.card-header h2 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 2px;
	}
	.addr {
		font-size: 0.75rem;
		font-family: monospace;
		color: #94a3b8;
	}
	section {
		margin-bottom: 1rem;
	}
	h3 {
		font-size: 0.75rem;
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
		font-size: 0.7rem;
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
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px dashed #e2e8f0;
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
