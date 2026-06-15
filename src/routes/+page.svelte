<script lang="ts">
	// 루트 페이지입니다. 체인별 Factory/Pair/Vault 조회, 검색/필터링,
	// 날짜 기준 조회, Safe JSON 배치 생성을 한 화면에서 조율합니다.

	import { CHAINS } from '../config/chains';
	import type { ChainKey } from '../config/chains';
	import { fetchFactoryData } from '../config/fetchFactory';
	import type { FactoryData } from '../config/fetchFactory';
	import { fetchAllPairs } from '../config/fetchpairs';
	import type { PairData } from '../config/fetchpairs';
	import { fetchVaultData } from '../config/fetchVault';
	import type { VaultData } from '../config/fetchVault';
	import FactoryCard from '../components/FactoryCard.svelte';
	import PairCard from '../components/PairCard.svelte';
	import VaultCard from '../components/VaultCard.svelte';
	import { sidebarStore } from '$lib/sidebar.svelte';
	import {
		SAFE_BY_CHAIN,
		buildSafeJson,
		buildSafeTransaction,
		parseEditValues,
		type EditDraft,
		type SafeTransaction
	} from '../config/editing';

	// 체인 컬럼 하나가 들고 있는 화면 상태입니다.
	type ChainState = {
		factory: FactoryData | null;
		pairs: PairData[];
		vault: VaultData | null;
		loading: boolean;
		error: string | null;
		loadedAt: Date | null;
		// PairCard sparkline용 7일 히스토리
		factoryHistory: FactoryData[];
		pairHistory: Record<string, PairData[]> | null;
		historyLoading: boolean;
		historyError: string | null;
	};

	// 체인별 상태 저장소입니다. CHAINS의 키로 초기 상태 객체를 만들고,
	// $state로 감싸서 변경 시 화면이 자동 갱신되게 합니다.
	let states = $state<Record<ChainKey, ChainState>>(
		Object.fromEntries(
			Object.keys(CHAINS).map((k) => [
				k,
				{
					factory: null,
					pairs: [],
					vault: null,
					loading: false,
					error: null,
					loadedAt: null,
					factoryHistory: [],
					pairHistory: null,
					historyLoading: false,
					historyError: null
				}
			])
		) as unknown as Record<ChainKey, ChainState>
	);

	// 검색어, Safe 트랜잭션 배치, 편집 모달 상태입니다.
	let searchQuery = $state('');
	let safeBatches = $state<Record<ChainKey, SafeTransaction[]>>(
		Object.fromEntries(Object.keys(CHAINS).map((key) => [key, []])) as unknown as Record<
			ChainKey,
			SafeTransaction[]
		>
	);
	let chainCollapsed = $state<Record<ChainKey, boolean>>(
		Object.fromEntries(Object.keys(CHAINS).map((key) => [key, true])) as unknown as Record<
			ChainKey,
			boolean
		>
	);
	let pairsCollapsed = $state<Record<ChainKey, boolean>>(
		Object.fromEntries(Object.keys(CHAINS).map((key) => [key, true])) as unknown as Record<
			ChainKey,
			boolean
		>
	);
	let activeEdit = $state<EditDraft | null>(null);
	let editValues = $state<Record<string, string>>({});
	let editError = $state<string | null>(null);

	// 검색 비교용 정규화 값입니다. 공백 제거 + 소문자 변환.
	const normalizedQuery = $derived(searchQuery.trim().toLowerCase());

	// 사용자가 카드의 Edit 버튼을 눌렀을 때 호출됩니다.
	// 어떤 값을 수정할지 담긴 draft를 activeEdit에 넣어 모달을 열고,
	// 각 입력 필드의 초기값을 editValues에 key/value 형태로 준비합니다.
	function openEdit(draft: EditDraft) {
		activeEdit = draft;
		editValues = Object.fromEntries(draft.fields.map((field) => [field.key, field.value]));
		editError = null;
	}

	// 편집 모달에 입력된 값을 검증한 뒤 Safe 트랜잭션 배치에 추가합니다.
	// parseEditValues가 문자열 입력값을 실제 ABI 타입에 맞는 값으로 바꾸고,
	// buildSafeTransaction이 Safe JSON에 들어갈 트랜잭션 객체를 만듭니다.
	// 성공하면 현재 체인의 safeBatches 배열에 tx를 추가하고 모달 상태를 초기화합니다.
	function addEditToBatch() {
		if (!activeEdit) return;
		const parsed = parseEditValues(activeEdit.fields, editValues);
		if (parsed.error) {
			editError = parsed.error;
			return;
		}
		const tx = buildSafeTransaction(activeEdit, parsed.values);
		safeBatches[activeEdit.chainKey] = [...safeBatches[activeEdit.chainKey], tx];
		activeEdit = null;
		editValues = {};
		editError = null;
	}

	// Safe JSON 배치에 담아둔 트랜잭션 하나를 제거합니다.
	// index와 다른 항목만 남기는 새 배열을 만들어 넣기 때문에
	// Svelte가 배열 변경을 감지하고 화면의 JSON 개수도 바로 갱신합니다.
	function removeSafeTx(chainKey: ChainKey, index: number) {
		safeBatches[chainKey] = safeBatches[chainKey].filter((_, i) => i !== index);
	}

	// 현재 체인에 쌓인 Safe 트랜잭션들을 JSON 파일로 다운로드합니다.
	// buildSafeJson으로 Safe 앱이 읽을 수 있는 구조를 만들고,
	// Blob + 임시 a 태그를 이용해 브라우저에서 파일 다운로드를 발생시킵니다.
	function downloadSafeJson(chainKey: ChainKey) {
		const txs = safeBatches[chainKey];
		if (!SAFE_BY_CHAIN[chainKey]) return;
		if (txs.length === 0) return;
		const blob = new Blob([JSON.stringify(buildSafeJson(chainKey, txs), null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `unipool-${chainKey}-safe-transactions.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function toggleChainCollapsed(chainKey: ChainKey) {
		chainCollapsed[chainKey] = !chainCollapsed[chainKey];
	}

	function togglePairsCollapsed(chainKey: ChainKey) {
		pairsCollapsed[chainKey] = !pairsCollapsed[chainKey];
	}

	// 검색어가 체인 공통 주소에 걸리는지 확인합니다.
	// Factory 주소, feeCollector, beacon, vault, aavePool, Vault 토큰 주소처럼
	// Pair 하나가 아니라 체인 전체와 관련된 주소가 검색되면 true를 반환합니다.
	function matchesChainAddrs(
		query: string,
		chainFactoryAddr: string,
		factory: FactoryData | null,
		vault: VaultData | null
	): boolean {
		const addrs: (string | undefined)[] = [
			chainFactoryAddr,
			factory?.feeCollector,
			factory?.beaconAddress,
			factory?.vault,
			factory?.aavePool,
			vault?.address,
			vault?.aavePool,
			...(vault?.tokens.map((t) => t.token) ?? [])
		];
		return addrs.some((a) => a?.toLowerCase().includes(query));
	}

	// 화면에 보여줄 Pair 목록을 검색어 기준으로 줄입니다.
	// 검색어가 없으면 전체 pairs를 그대로 반환합니다.
	// 체인 공통 주소가 검색된 경우에는 Factory/Vault까지 함께 봐야 하므로
	// Pair 목록도 줄이지 않고 전체를 보여줍니다.
	// 그 외에는 Pair의 심볼, 이름, 토큰 주소, Pair 주소, Factory 주소를 비교합니다.
	function filterPairs(
		pairs: PairData[],
		chainFactoryAddr: string,
		factory: FactoryData | null,
		vault: VaultData | null
	): PairData[] {
		if (!normalizedQuery) return pairs;
		if (matchesChainAddrs(normalizedQuery, chainFactoryAddr, factory, vault)) return pairs;
		return pairs.filter(
			(p) =>
				p.symbol.toLowerCase().includes(normalizedQuery) ||
				p.name.toLowerCase().includes(normalizedQuery) ||
				p.token0.toLowerCase().includes(normalizedQuery) ||
				p.token1.toLowerCase().includes(normalizedQuery) ||
				p.address.toLowerCase().includes(normalizedQuery) ||
				(p.token0Symbol?.toLowerCase() ?? '').includes(normalizedQuery) ||
				(p.token1Symbol?.toLowerCase() ?? '').includes(normalizedQuery) ||
				p.factory.toLowerCase().includes(normalizedQuery)
		);
	}

	// 현재 체인 컬럼 자체를 화면에 보여줄지 판단합니다.
	// 검색어가 없으면 무조건 true이고, 체인 공통 주소 또는 Pair 중 하나라도
	// 검색어와 일치하면 true입니다. false면 해당 체인 컬럼의 카드 영역이 숨겨집니다.
	function chainHasMatch(
		chainFactoryAddr: string,
		factory: FactoryData | null,
		vault: VaultData | null,
		pairs: PairData[]
	): boolean {
		if (!normalizedQuery) return true;
		if (matchesChainAddrs(normalizedQuery, chainFactoryAddr, factory, vault)) return true;
		return pairs.some(
			(p) =>
				p.symbol.toLowerCase().includes(normalizedQuery) ||
				p.name.toLowerCase().includes(normalizedQuery) ||
				p.token0.toLowerCase().includes(normalizedQuery) ||
				p.token1.toLowerCase().includes(normalizedQuery) ||
				p.address.toLowerCase().includes(normalizedQuery) ||
				(p.token0Symbol?.toLowerCase() ?? '').includes(normalizedQuery) ||
				(p.token1Symbol?.toLowerCase() ?? '').includes(normalizedQuery) ||
				p.factory.toLowerCase().includes(normalizedQuery)
		);
	}

	// 특정 날짜가 각 체인에서 몇 번 블록에 가까운지 DeFiLlama API로 조회합니다.
	// 스마트컨트랙트 과거 상태를 읽으려면 날짜가 아니라 block number가 필요해서,
	// 날짜 비교 기능과 7일 히스토리 기능이 이 함수를 공통으로 사용합니다.
	// 체인이름 날짜 받아서 가까운 블록번호 가져오기. Math.floor는 숫자 내림해서 정수로 만드는 함수.
	async function dateToBlock(chainKey: ChainKey, date: Date): Promise<bigint> {
		const config = CHAINS[chainKey];
		const ts = Math.floor(date.getTime() / 1000);
		const res = await fetch(`https://coins.llama.fi/block/${config.defillamaSlug}/${ts}`);

		if (!res.ok) throw new Error(`Block lookup failed (${config.defillamaSlug} @ ${ts})`);
		const json = (await res.json()) as { height: number };
		return BigInt(json.height);
	}

	let fromDate = $state('');
	let toDate = $state('');
	let rangeError = $state<string | null>(null);

	// 선택한 종료 날짜(to)에 해당하는 블록 기준으로 체인 하나의 데이터를 다시 읽습니다.
	// Factory를 먼저 읽어 Pair 개수를 알고, Pair들을 읽은 뒤,
	// Pair들이 사용하는 토큰 목록으로 Vault 정보를 조회합니다.
	// 조회한 결과는 states와 sidebarStore에 같이 반영합니다.
	// 이 함수는 체인 하나를 특정 날짜/블록 기준으로 다시 조회해서 화면 상태를 교체하는 함수입니다.
	async function compareChainRange(key: ChainKey, toBlock: bigint, to: Date) {
		const config = CHAINS[key];
		states[key].loading = true;
		states[key].error = null;

		try {
			const toFactory = await fetchFactoryData(config, toBlock);
			const toPairs = await fetchAllPairs(
				config,
				config.factory,
				toFactory.allPairsLength,
				toBlock
			);
			const toTokens = [
				...new Set(toPairs.flatMap((p) => [p.token0, p.token1]))
			] as `0x${string}`[];
			const toVault = await fetchVaultData(config, toFactory.vault, toTokens, toBlock);
			states[key].factory = toFactory;
			states[key].pairs = toPairs;
			states[key].vault = toVault;
			states[key].loadedAt = to;
			sidebarStore.setFactory(key, config.name, config.factory);
			sidebarStore.setPairsForChain(key, config.name, toPairs);
			sidebarStore.setVault(key, config.name, toVault.address);
		} catch (e) {
			states[key].error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			states[key].loading = false;
		}
	}

	// 날짜 비교 버튼을 눌렀을 때 전체 체인에 대해 비교 조회를 실행합니다.
	// from/to 입력값을 먼저 검증하고, 현재 구현에서는 to 날짜의 블록을 기준으로
	// 각 체인의 화면 데이터를 해당 시점의 값으로 교체합니다.
	// 여러 체인의 block lookup과 조회는 Promise.all로 병렬 실행합니다.
	async function compareAllRange() {
		rangeError = null;
		if (!fromDate || !toDate) {
			rangeError = 'Please enter both a start date and an end date.';
			return;
		}
		const from = new Date(fromDate);
		const to = new Date(toDate);
		if (from >= to) {
			rangeError = 'Start date must be earlier than end date.';
			return;
		}

		try {
			const keys = Object.keys(CHAINS) as ChainKey[];
			const blockPairs = await Promise.all(
				keys.map(async (key) => {
					const toBlock = await dateToBlock(key, to);
					return { key, toBlock };
				})
			);
			await Promise.all(blockPairs.map(({ key, toBlock }) => compareChainRange(key, toBlock, to)));
		} catch (e) {
			rangeError = e instanceof Error ? e.message : 'Block lookup failed';
		}
	}

	// 체인 하나의 최신 데이터를 로딩합니다.
	// Factory → Pair → Vault 순서로 뒤 단계가 앞 단계의 결과에 의존합니다.
	// 예를 들어 Pair 조회에는 factory.allPairsLength가 필요하고,
	// Vault 조회에는 Pair들이 가진 token0/token1 주소 목록이 필요합니다.
	// 실패하면 states[key].error에 메시지를 넣고, 성공/실패와 상관없이 loading을 끕니다.
	async function loadChain(key: ChainKey) {
		const config = CHAINS[key];

		states[key].loading = true;
		states[key].error = null;

		try {
			const factory = await fetchFactoryData(config);
			states[key].factory = factory;
			sidebarStore.setFactory(key, config.name, config.factory);

			const pairs = await fetchAllPairs(config, config.factory, factory.allPairsLength);
			states[key].pairs = pairs;
			sidebarStore.setPairsForChain(key, config.name, pairs);

			// Pair들이 쓰는 token0/token1 주소를 모아 중복 제거 후 Vault를 조회합니다.
			const allTokens = pairs.flatMap((p) => [p.token0, p.token1]);
			const uniqueTokens = [...new Set(allTokens)] as `0x${string}`[];
			const vault = await fetchVaultData(config, factory.vault, uniqueTokens);
			states[key].vault = vault;
			sidebarStore.setVault(key, config.name, vault.address);
		} catch (e) {
			states[key].error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			states[key].loading = false;
			states[key].loadedAt = new Date();
		}
	}

	// 모든 체인의 최신 데이터를 한 번에 로딩합니다.
	// 각 체인끼리는 서로 의존하지 않기 때문에 Promise.all로 동시에 시작합니다.
	// 반환값은 Promise라서 버튼 클릭이나 다른 async 흐름에서 await할 수 있습니다.
	function loadAll() {
		return Promise.all((Object.keys(CHAINS) as ChainKey[]).map(loadChain));
	}

	// 선택한 체인의 최근 7일 히스토리를 로딩합니다.
	// 오늘 포함 7개의 UTC 자정 날짜를 만들고, 각 날짜를 block number로 변환한 뒤,
	// 그 블록에서 Factory/Pair 스냅샷을 읽습니다.
	// Factory 히스토리는 배열로 저장하고, Pair 히스토리는 pair.address 기준으로 묶어
	// PairCard가 sparkline 차트를 그릴 수 있게 넘깁니다.
	// 과거 블록 상태 조회에는 archive node가 필요합니다.
	async function loadHistory(key: ChainKey) {
		if (!states[key].factory) {
			states[key].historyError = 'Please load current data first.';
			return;
		}
		states[key].historyLoading = true;
		states[key].historyError = null;

		try {
			const config = CHAINS[key];

			const nowMs = Date.now();
			const todayMidnightMs = nowMs - (nowMs % 86_400_000);
			const dates = Array.from(
				{ length: 7 },
				(_, i) => new Date(todayMidnightMs - (6 - i) * 86_400_000)
			);

			const blocks = await Promise.all(dates.map((d) => dateToBlock(key, d)));

			// RPC 부담을 줄이려고 스냅샷 조회는 순차 처리합니다.
			const snapshots: { factory: FactoryData; pairs: PairData[] }[] = [];
			for (const block of blocks) {
				const factory = await fetchFactoryData(config, block);
				const pairs = await fetchAllPairs(config, config.factory, factory.allPairsLength, block);
				snapshots.push({ factory, pairs });
			}

			states[key].factoryHistory = snapshots.map((s) => s.factory);

			const byAddr: Record<string, PairData[]> = {};
			for (const { pairs } of snapshots) {
				for (const pair of pairs) {
					if (!byAddr[pair.address]) byAddr[pair.address] = [];
					byAddr[pair.address].push(pair);
				}
			}
			states[key].pairHistory = byAddr;
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Unknown error';
			if (
				msg.toLowerCase().includes('block') ||
				msg.toLowerCase().includes('missing') ||
				msg.toLowerCase().includes('archive')
			) {
				states[key].historyError = `History fetch failed: an archive node is required. (${msg})`;
			} else {
				states[key].historyError = `History fetch failed: ${msg}`;
			}
		} finally {
			states[key].historyLoading = false;
		}
	}
</script>

<!-- 화면: 상단 컨트롤 → 체인별 컬럼 → 편집 모달 -->
<main>
	<header>
		<h1>UniPool — Parameter Dashboard</h1>
		<button onclick={loadAll}>Load all chains</button>
	</header>

	<div class="range-bar">
		<span class="range-label">Date Comparison</span>
		<label class="range-input">
			<span>From</span>
			<input type="datetime-local" bind:value={fromDate} />
		</label>
		<span class="range-arrow">→</span>
		<label class="range-input">
			<span>To</span>
			<input type="datetime-local" bind:value={toDate} />
		</label>
		<button class="compare-btn" onclick={compareAllRange}>Compare</button>
		{#if rangeError}
			<span class="range-error">{rangeError}</span>
		{/if}
	</div>

	<div class="search-bar">
		<input
			type="text"
			placeholder="Search pairs by symbol, name, or address..."
			bind:value={searchQuery}
		/>
		{#if searchQuery}
			<button class="clear-btn" onclick={() => (searchQuery = '')}>✕</button>
		{/if}
	</div>

	<div class="chains">
		{#each Object.entries(CHAINS) as [key, config] (key)}
			{@const safeConfig = SAFE_BY_CHAIN[key as ChainKey]}
			<div class="chain-col">
				<div class="chain-header">
					<button
						class="chain-toggle"
						aria-expanded={!chainCollapsed[key as ChainKey]}
						aria-label={`${chainCollapsed[key as ChainKey] ? 'Expand' : 'Collapse'} ${config.name}`}
						title={chainCollapsed[key as ChainKey] ? 'Expand chain' : 'Collapse chain'}
						onclick={() => toggleChainCollapsed(key as ChainKey)}
					>
						<span class="toggle-icon" aria-hidden="true">
							{chainCollapsed[key as ChainKey] ? '▸' : '▾'}
						</span>
						<span class="chain-name">{config.name}</span>
					</button>
					<div class="chain-actions">
						{#if safeConfig}
							<a class="safe-link" href={safeConfig.url} target="_blank" rel="noreferrer">Safe</a>
						{:else}
							<span class="safe-missing">No Safe</span>
						{/if}
						<button
							class="download-btn"
							disabled={!safeConfig || safeBatches[key as ChainKey].length === 0}
							onclick={() => downloadSafeJson(key as ChainKey)}
						>
							JSON ({safeBatches[key as ChainKey].length})
						</button>
						{#if states[key as ChainKey].loadedAt && !states[key as ChainKey].loading}
							{#if states[key as ChainKey].historyLoading}
								<span class="history-loading">📈 Loading…</span>
							{:else}
								<button class="history-btn" onclick={() => loadHistory(key as ChainKey)}>
									📈 7d
								</button>
							{/if}
						{/if}
						<button onclick={() => loadChain(key as ChainKey)}>↻ Refresh</button>
					</div>
				</div>

				{#if !chainCollapsed[key as ChainKey]}
					<div class="chain-body">
						{#if states[key as ChainKey].historyError}
							<p class="history-error">{states[key as ChainKey].historyError}</p>
						{/if}

						{#if states[key as ChainKey].loading}
							<p class="state-msg">Loading...</p>
						{:else if states[key as ChainKey].error}
							<p class="state-msg error">{states[key as ChainKey].error}</p>
						{:else if chainHasMatch(config.factory, states[key as ChainKey].factory, states[key as ChainKey].vault, states[key as ChainKey].pairs)}
							{@const anySelected =
								sidebarStore.selectedCount > 0 ||
								sidebarStore.selectedFactoryCount > 0 ||
								sidebarStore.selectedVaultCount > 0}

							<div class="top-cards">
								{#if (!anySelected || sidebarStore.selectedFactoryCount > 0) && (sidebarStore.selectedFactoryCount === 0 || sidebarStore.isFactorySelected(key as ChainKey))}
									<FactoryCard
										chainLabel={config.name}
										data={states[key as ChainKey].factory}
										prevData={null}
										loading={false}
										error={null}
										chainKey={key as ChainKey}
										factoryAddress={config.factory}
										pairAddresses={states[key as ChainKey].pairs.map((p) => p.address)}
										defaultPairAddresses={states[key as ChainKey].pairs
											.filter((p) => sidebarStore.isSelected(p.address))
											.map((p) => p.address)}
										onEdit={openEdit}
									/>
								{/if}

								{#if (!anySelected || sidebarStore.selectedVaultCount > 0) && states[key as ChainKey].vault && (sidebarStore.selectedVaultCount === 0 || sidebarStore.isVaultSelected(key as ChainKey))}
									{@const symMap = Object.fromEntries(
										states[key as ChainKey].pairs
											.flatMap((p) => [
												[p.token0.toLowerCase(), p.token0Symbol],
												[p.token1.toLowerCase(), p.token1Symbol]
											])
											.filter(([, s]) => s)
									)}
									<VaultCard
										data={states[key as ChainKey].vault!}
										prevData={null}
										tokenSymbols={symMap}
										chainKey={key as ChainKey}
										chainLabel={config.name}
										onEdit={openEdit}
									/>
								{/if}
							</div>

							{#if (!anySelected || sidebarStore.selectedCount > 0) && states[key as ChainKey].pairs.length > 0}
								{@const filtered = filterPairs(
									states[key as ChainKey].pairs,
									config.factory,
									states[key as ChainKey].factory,
									states[key as ChainKey].vault
								)}
								{@const visible =
									sidebarStore.selectedCount > 0
										? filtered.filter((p) => sidebarStore.isSelected(p.address))
										: filtered}
								<button
									class="pairs-label"
									aria-expanded={!pairsCollapsed[key as ChainKey]}
									aria-label={`${pairsCollapsed[key as ChainKey] ? 'Expand' : 'Collapse'} pairs for ${config.name}`}
									title={pairsCollapsed[key as ChainKey] ? 'Expand pairs' : 'Collapse pairs'}
									onclick={() => togglePairsCollapsed(key as ChainKey)}
								>
									<span class="toggle-icon" aria-hidden="true">
										{pairsCollapsed[key as ChainKey] ? '▸' : '▾'}
									</span>
									<span>Pairs ({visible.length} / {states[key as ChainKey].pairs.length})</span>
								</button>
								{#if !pairsCollapsed[key as ChainKey]}
									<div class="pairs-grid">
										{#each visible as pair (pair.address)}
											{@const pairHistory = states[key as ChainKey].pairHistory?.[pair.address] ?? []}
											<PairCard
												data={pair}
												prevData={null}
												history={pairHistory}
												chainLabel={config.name}
												chainKey={key as ChainKey}
												onEdit={openEdit}
											/>
										{/each}
									</div>
								{/if}
							{/if}
						{/if}

						{#if safeBatches[key as ChainKey].length > 0}
							<div class="safe-batch">
								{#each safeBatches[key as ChainKey] as tx, i}
									<div class="safe-tx">
										<span>{i + 1}. {tx.contractMethod.name}</span>
										<button onclick={() => removeSafeTx(key as ChainKey, i)}>✕</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</main>

{#if activeEdit}
	<div class="modal-backdrop">
		<div class="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
			<div class="edit-modal-header">
				<div>
					<h2 id="edit-modal-title">{activeEdit.title}</h2>
					<span>{activeEdit.chainName} · {activeEdit.targetLabel}</span>
				</div>
				<button class="modal-close" onclick={() => (activeEdit = null)}>✕</button>
			</div>
			<div class="edit-fields">
				{#each activeEdit.fields as field (field.key)}
					<label>
						<span>{field.label}</span>
						{#if field.type === 'bool'}
							<select bind:value={editValues[field.key]}>
								<option value="true">true</option>
								<option value="false">false</option>
							</select>
						{:else if field.type === 'address[]'}
							<textarea bind:value={editValues[field.key]} rows="3"></textarea>
						{:else}
							<input bind:value={editValues[field.key]} />
						{/if}
					</label>
				{/each}
			</div>
			{#if editError}
				<p class="edit-error">{editError}</p>
			{/if}
			<div class="edit-actions">
				<button onclick={() => (activeEdit = null)}>Cancel</button>
				<button class="add-btn" onclick={addEditToBatch}>Add to JSON batch</button>
			</div>
		</div>
	</div>
{/if}

<style>
	main {
		max-width: none;
		margin: 0 auto;
		padding: 1rem;
		font-family: system-ui, sans-serif;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	h1 {
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0;
	}

	.range-bar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-bottom: 1rem;
		padding: 0.6rem 0.85rem;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
	}
	.range-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: #475569;
		white-space: nowrap;
	}
	.range-input {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
		color: #64748b;
	}
	.range-input input {
		font-size: 0.75rem;
		padding: 0.25rem 0.4rem;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		background: #fff;
		color: #0f172a;
	}
	.range-arrow {
		color: #94a3b8;
		font-size: 0.85rem;
	}
	.compare-btn {
		font-size: 0.8rem;
		padding: 0.3rem 0.85rem;
		border: 1px solid #6366f1;
		border-radius: 6px;
		background: #6366f1;
		color: #fff;
		cursor: pointer;
		font-weight: 600;
	}
	.compare-btn:hover {
		background: #4f46e5;
		border-color: #4f46e5;
	}
	.range-error {
		font-size: 0.75rem;
		color: #dc2626;
	}

	.search-bar {
		position: relative;
		margin-bottom: 1.5rem;
	}
	.search-bar input {
		width: 100%;
		padding: 0.5rem 2.5rem 0.5rem 0.75rem;
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		font-size: 0.85rem;
		background: #f8fafc;
		box-sizing: border-box;
	}
	.search-bar input:focus {
		outline: none;
		border-color: #94a3b8;
		background: #fff;
	}
	.clear-btn {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		border: none;
		background: transparent;
		cursor: pointer;
		color: #94a3b8;
		font-size: 0.8rem;
		padding: 0.2rem 0.3rem;
	}
	.clear-btn:hover {
		color: #475569;
	}

	.chains {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}
	.chain-col {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.chain-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.chain-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		flex: 1;
		align-self: stretch;
		justify-content: flex-start;
		min-width: 0;
		border: none;
		background: transparent;
		padding: 0.35rem 0.1rem;
		color: #475569;
		cursor: pointer;
	}
	.chain-toggle:hover {
		background: transparent;
		color: #0f172a;
	}
	.toggle-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		color: #94a3b8;
		font-size: 0.8rem;
		line-height: 1;
	}
	.chain-actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
		justify-content: flex-end;
		flex-shrink: 0;
	}
	.chain-name {
		font-size: 0.85rem;
		font-weight: 600;
		color: #475569;
		white-space: nowrap;
	}
	.chain-body {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.safe-link,
	.download-btn {
		font-size: 0.75rem;
		padding: 0.25rem 0.55rem;
		border: 1px solid #bbf7d0;
		border-radius: 6px;
		background: #f0fdf4;
		color: #15803d;
		text-decoration: none;
		cursor: pointer;
	}
	.safe-missing {
		font-size: 0.75rem;
		padding: 0.25rem 0.55rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		background: #f8fafc;
		color: #94a3b8;
	}
	.download-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.safe-batch {
		border: 1px solid #bbf7d0;
		border-radius: 8px;
		background: #f0fdf4;
		padding: 0.45rem 0.55rem;
	}
	.safe-tx {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.72rem;
		color: #166534;
	}
	.safe-tx button {
		border: none;
		background: transparent;
		color: #15803d;
		padding: 0.1rem 0.2rem;
	}
	.pairs-label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		align-self: flex-start;
		font-size: 0.75rem;
		font-weight: 600;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 0.25rem;
		padding: 0.15rem 0.1rem;
		border: none;
		background: transparent;
		cursor: pointer;
	}
	.pairs-label:hover {
		color: #475569;
	}
	.top-cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
		align-items: start;
	}
	.pairs-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.5rem;
		align-items: start;
	}
	@media (max-width: 1280px) {
		.pairs-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
	@media (max-width: 900px) {
		.pairs-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 680px) {
		.top-cards,
		.pairs-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.history-btn {
		font-size: 0.75rem;
		padding: 0.25rem 0.6rem;
		border: 1px solid #a5f3fc;
		border-radius: 6px;
		background: #ecfeff;
		color: #0891b2;
		cursor: pointer;
	}
	.history-btn:hover {
		background: #cffafe;
	}
	.history-loading {
		font-size: 0.72rem;
		color: #0891b2;
		padding: 0.25rem 0.4rem;
	}
	.history-error {
		font-size: 0.72rem;
		color: #dc2626;
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 6px;
		padding: 0.35rem 0.6rem;
	}
	.state-msg {
		font-size: 0.85rem;
		color: #64748b;
		padding: 1rem 0;
	}
	.state-msg.error {
		color: #ef4444;
	}
	button {
		font-size: 0.8rem;
		padding: 0.3rem 0.75rem;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		background: #f8fafc;
		cursor: pointer;
	}
	button:hover {
		background: #f1f5f9;
	}
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: rgba(15, 23, 42, 0.32);
	}
	.edit-modal {
		width: min(420px, 100%);
		border: 1px solid #cbd5e1;
		border-radius: 8px;
		background: #fff;
		box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
		padding: 1rem;
	}
	.edit-modal-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.85rem;
	}
	.edit-modal-header h2 {
		font-size: 1rem;
		margin: 0 0 0.15rem;
	}
	.edit-modal-header span {
		font-size: 0.72rem;
		color: #64748b;
	}
	.modal-close {
		border: none;
		background: transparent;
		padding: 0.1rem 0.2rem;
	}
	.edit-fields {
		display: grid;
		gap: 0.65rem;
	}
	.edit-fields label {
		display: grid;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: #475569;
	}
	.edit-fields input,
	.edit-fields select,
	.edit-fields textarea {
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		padding: 0.45rem 0.5rem;
		font-size: 0.85rem;
	}
	.edit-fields textarea {
		resize: vertical;
		min-height: 4.8rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.78rem;
	}
	.edit-error {
		margin: 0.75rem 0 0;
		font-size: 0.75rem;
		color: #dc2626;
	}
	.edit-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	.add-btn {
		border-color: #16a34a;
		background: #16a34a;
		color: #fff;
	}
	.add-btn:hover {
		background: #15803d;
	}
</style>
