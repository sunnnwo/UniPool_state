<script lang="ts">
  // ─── +page.svelte ──────────────────────────────────────────────────────────
  // 이 파일의 역할:
  //   앱의 메인 페이지. 모든 체인의 데이터 로딩을 조율하고,
  //   Factory / Vault / Pair 카드를 체인별로 나란히 표시한다.
  //
  // SvelteKit에서 +page.svelte는 라우트(route = URL 경로)에 대응하는 페이지 컴포넌트다.
  //   src/routes/+page.svelte → http://localhost:5173/ (루트 경로)
  //   src/routes/about/+page.svelte → http://localhost:5173/about

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

  // ─── 상태 타입 정의 ────────────────────────────────────────────────────────
  type Snapshot = {
    factory: FactoryData | null;
    vault: VaultData | null;
    pairs: PairData[];
    capturedAt: Date;
  };

  type ChainState = {
    factory: FactoryData | null;
    pairs: PairData[];
    vault: VaultData | null;
    loading: boolean;
    error: string | null;
    loadedAt: Date | null;
    baseline: Snapshot | null;
    // 7일 히스토리: 스파크라인 그래프용
    factoryHistory: FactoryData[];
    pairHistory: Record<string, PairData[]> | null;
    historyLoading: boolean;
    historyError: string | null;
  };

  // ─── $state: Svelte 5 반응형 상태 ─────────────────────────────────────────
  // Svelte 4: let states = writable({})  (스토어 방식, 더 복잡함)
  // Svelte 5: let states = $state({})   (rune 방식, 더 직관적)
  //
  // $state()로 선언한 변수는 "반응형(reactive)":
  //   값이 바뀌면 Svelte가 자동으로 해당 변수를 사용하는 UI를 다시 렌더링한다.
  //   states[key].loading = true → 로딩 스피너 즉시 표시
  //   states[key].factory = data → 카드 즉시 표시
  //
  // Record<ChainKey, ChainState>:
  //   Record<K, V> = { [key in K]: V } 타입.
  //   "arbitrum", "base", "bsc" 키에 대해 ChainState 값을 갖는 객체 타입.
  //
  // Object.fromEntries(Object.keys(CHAINS).map(...)):
  //   Object.keys(CHAINS)     → ["arbitrum", "base", "bsc"]
  //   .map((k) => [k, {...}]) → [["arbitrum", {...}], ["base", {...}], ["bsc", {...}]]
  //   Object.fromEntries(...)  → { arbitrum: {...}, base: {...}, bsc: {...} }
  //
  // as unknown as Record<ChainKey, ChainState>:
  //   Object.fromEntries의 반환 타입이 { [k: string]: ... }라서
  //   "arbitrum" | "base" | "bsc" 키를 가진 타입으로 직접 캐스팅(casting)이 안 된다.
  //   캐스팅 = 컴파일러에게 "이 값의 타입은 이것이다"라고 강제로 알려주는 것.
  //   unknown을 경유하면 어떤 타입으로든 캐스팅 가능.
  let states = $state<Record<ChainKey, ChainState>>(
    Object.fromEntries(
      Object.keys(CHAINS).map((k) => [k, { factory: null, pairs: [], vault: null, loading: false, error: null, loadedAt: null, baseline: null, factoryHistory: [], pairHistory: null, historyLoading: false, historyError: null }])
    ) as unknown as Record<ChainKey, ChainState>
  );

  // ─── 검색 상태 ────────────────────────────────────────────────────────────
  // $state(''): 빈 문자열로 초기화된 반응형 변수.
  // input에 bind:value={searchQuery}를 연결하면
  // 사용자가 타이핑할 때마다 이 값이 자동으로 업데이트된다.
  let searchQuery = $state('');

  // ─── 검색어 정규화 ────────────────────────────────────────────────────────
  // $derived: searchQuery가 바뀔 때마다 자동으로 재계산되는 파생 값.
  //
  // 왜 일반 함수(function filterPairs)를 쓰면 안 되는가?
  //   Svelte 5에서 일반 함수는 반응형이 아니다.
  //   searchQuery가 바뀌어도 함수가 반환한 값이 재계산되지 않는다.
  //   따라서 템플릿의 {@const filtered = filterPairs(...)}가 업데이트되지 않는다.
  //
  // $derived를 쓰면:
  //   searchQuery($state)가 바뀌는 순간 Svelte가 이 값을 자동으로 다시 계산한다.
  //   → 검색어 입력 즉시 필터링 결과가 반영된다.
  //
  // .trim(): 앞뒤 공백 제거
  // .toLowerCase(): 대소문자 무시
  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  // filterPairs: 정규화된 검색어로 Pair 배열을 필터링하는 함수.
  // normalizedQuery($derived)를 참조하므로 검색어가 바뀌면 함수 호출 결과도 바뀐다.
  // chain-level 주소(factory, vault, fee collector 등)가 query와 일치하는지 확인
  function matchesChainAddrs(query: string, chainFactoryAddr: string, factory: FactoryData | null, vault: VaultData | null): boolean {
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

  function filterPairs(
    pairs: PairData[],
    chainFactoryAddr: string,
    factory: FactoryData | null,
    vault: VaultData | null
  ): PairData[] {
    if (!normalizedQuery) return pairs;
    if (matchesChainAddrs(normalizedQuery, chainFactoryAddr, factory, vault)) return pairs;
    return pairs.filter((p) =>
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

  // 체인에 query와 매칭되는 항목이 하나라도 있는지 확인 (factory/vault 카드 표시 여부 결정)
  function chainHasMatch(chainFactoryAddr: string, factory: FactoryData | null, vault: VaultData | null, pairs: PairData[]): boolean {
    if (!normalizedQuery) return true;
    if (matchesChainAddrs(normalizedQuery, chainFactoryAddr, factory, vault)) return true;
    return pairs.some((p) =>
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

  // ─── DeFiLlama 날짜→블록 변환 ──────────────────────────────────────────────
  const DEFILLAMA_SLUG: Record<ChainKey, string> = {
    arbitrum: 'arbitrum',
    base: 'base',
    bsc: 'bsc'
  };

  async function dateToBlock(chainKey: ChainKey, date: Date): Promise<bigint> {
    const ts = Math.floor(date.getTime() / 1000);
    const res = await fetch(`https://coins.llama.fi/block/${DEFILLAMA_SLUG[chainKey]}/${ts}`);
    if (!res.ok) throw new Error(`Block lookup failed (${DEFILLAMA_SLUG[chainKey]} @ ${ts})`);
    const json = await res.json() as { height: number };
    return BigInt(json.height);
  }

  // ─── 날짜 범위 비교 상태 ─────────────────────────────────────────────────
  let fromDate = $state('');
  let toDate = $state('');
  let rangeError = $state<string | null>(null);

  async function compareChainRange(key: ChainKey, fromBlock: bigint, toBlock: bigint, from: Date, to: Date) {
    const config = CHAINS[key];
    states[key].loading = true;
    states[key].error = null;

    try {
      // 시작 블록 데이터 → baseline
      const baseFactory = await fetchFactoryData(config, fromBlock);
      const basePairs = await fetchAllPairs(config, config.factory, baseFactory.allPairsLength, fromBlock);
      const baseTokens = [...new Set(basePairs.flatMap((p) => [p.token0, p.token1]))] as `0x${string}`[];
      const baseVault = await fetchVaultData(config, baseFactory.vault, baseTokens, fromBlock);
      states[key].baseline = { factory: baseFactory, vault: baseVault, pairs: basePairs, capturedAt: from };

      // 종료 블록 데이터 → current
      const toFactory = await fetchFactoryData(config, toBlock);
      const toPairs = await fetchAllPairs(config, config.factory, toFactory.allPairsLength, toBlock);
      const toTokens = [...new Set(toPairs.flatMap((p) => [p.token0, p.token1]))] as `0x${string}`[];
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

  async function compareAllRange() {
    rangeError = null;
    if (!fromDate || !toDate) { rangeError = '시작일과 종료일을 모두 입력해주세요.'; return; }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from >= to) { rangeError = '시작일은 종료일보다 앞이어야 합니다.'; return; }

    try {
      // 모든 체인의 블록 번호를 병렬로 조회
      const keys = Object.keys(CHAINS) as ChainKey[];
      const blockPairs = await Promise.all(
        keys.map(async (key) => {
          const [fromBlock, toBlock] = await Promise.all([dateToBlock(key, from), dateToBlock(key, to)]);
          return { key, fromBlock, toBlock };
        })
      );
      // 체인별 비교 실행
      await Promise.all(blockPairs.map(({ key, fromBlock, toBlock }) =>
        compareChainRange(key, fromBlock, toBlock, from, to)
      ));
    } catch (e) {
      rangeError = e instanceof Error ? e.message : 'Block lookup failed';
    }
  }

  // ─── 단일 체인 로드 함수 ─────────────────────────────────────────────────
  // async: 내부에서 await를 써서 비동기 작업을 순서대로 실행.
  async function loadChain(key: ChainKey) {
    const config = CHAINS[key];

    // 로딩 시작: Svelte가 loading=true를 감지해서 "Loading..." 메시지 표시
    states[key].loading = true;
    states[key].error = null;

    // try/catch/finally:
    //   try:     성공 경로. 에러 없으면 여기만 실행.
    //   catch:   에러 발생 시 실행. e = 발생한 에러 객체.
    //   finally: 성공/실패 관계없이 항상 실행. 로딩 종료에 씀.
    try {
      // 1단계: Factory 데이터
      // await: 이 Promise가 완료될 때까지 기다린다.
      //        기다리는 동안 브라우저는 다른 작업(UI 업데이트 등)을 계속할 수 있다.
      const factory = await fetchFactoryData(config);
      states[key].factory = factory;  // 즉시 UI에 Factory 카드 표시
      sidebarStore.setFactory(key, config.name, config.factory);

      // 2단계: Pair 목록
      // factory.allPairsLength를 재사용 → Factory를 다시 호출하지 않아도 됨
      const pairs = await fetchAllPairs(config, config.factory, factory.allPairsLength);
      states[key].pairs = pairs;  // 즉시 UI에 Pair 카드들 표시
      sidebarStore.setPairsForChain(key, config.name, pairs);

      // 3단계: Vault
      // pairs에서 token0, token1 주소를 모두 추출 → 중복 제거 → Vault에 한 번만 조회
      //
      // .flatMap((p) => [p.token0, p.token1]):
      //   각 Pair에서 두 토큰 주소를 꺼내 하나의 배열로 펼침.
      //   예) 2개 Pair → ["0xWETH", "0xUSDT", "0xWETH", "0xDAI"]
      //
      // new Set(allTokens):
      //   Set = 중복을 허용하지 않는 집합 자료구조.
      //   같은 주소가 여러 Pair에 있어도 한 번만 조회하도록 중복 제거.
      //   → ["0xWETH", "0xUSDT", "0xDAI"]
      //
      // [...new Set(allTokens)]:
      //   Set을 다시 배열로 변환 (spread 연산자).
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

  function setBaseline(key: ChainKey) {
    const s = states[key];
    if (!s.loadedAt) return;
    states[key].baseline = {
      factory: s.factory,
      vault: s.vault,
      pairs: [...s.pairs],
      capturedAt: s.loadedAt
    };
  }

  function formatTime(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function formatDuration(from: Date, to: Date): string {
    const secs = Math.floor((to.getTime() - from.getTime()) / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ${secs % 60}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  }

  // ─── 전체 체인 병렬 로드 ──────────────────────────────────────────────────
  // Promise.all: 3개 체인을 동시에 로드.
  //   순차: 체인1 완료 → 체인2 완료 → 체인3 완료 (느림)
  //   병렬: 체인1, 체인2, 체인3 동시 시작 → 가장 느린 것 기다림 (빠름)
  //
  // (Object.keys(CHAINS) as ChainKey[]):
  //   Object.keys는 string[]을 반환하지만
  //   우리는 ChainKey("arbitrum"|"base"|"bsc") 타입이 필요하므로 캐스팅.
  function loadAll() {
    return Promise.all((Object.keys(CHAINS) as ChainKey[]).map(loadChain));
  }

  // ─── 7일 히스토리 로드 ────────────────────────────────────────────────────
  // 오늘부터 6일 전 UTC 자정 ~ 오늘 UTC 자정까지 7개 시점의 데이터를 수집한다.
  // 각 시점의 블록 번호를 DeFiLlama API로 조회 후, 해당 블록의 Factory/Pair를 fetch.
  //
  // 아카이브 노드(archive node)가 필요한 이유:
  //   일반 RPC 노드는 최신 블록 상태만 저장.
  //   과거 블록의 스마트컨트랙트 상태를 조회하려면 아카이브 노드가 필요.
  //   아카이브 노드 없이 과거 블록을 조회하면 RPC 에러 발생.
  async function loadHistory(key: ChainKey) {
    if (!states[key].factory) {
      states[key].historyError = '먼저 현재 데이터를 로드해주세요.';
      return;
    }
    states[key].historyLoading = true;
    states[key].historyError = null;

    try {
      const config = CHAINS[key];

      // 오늘부터 6일 전까지 UTC 자정 기준 7개 날짜 생성
      // i=0 → 6일 전, i=6 → 오늘 (오래된 순서대로 정렬 → 스파크라인 왼쪽=과거)
      //
      // Date.now() % 86_400_000: 오늘 UTC 자정 이후 경과 밀리초.
      // now - (now % 86_400_000): UTC 자정 타임스탬프 (뮤터블 Date 객체 생성 없이 계산)
      const nowMs = Date.now();
      const todayMidnightMs = nowMs - (nowMs % 86_400_000);
      const dates = Array.from({ length: 7 }, (_, i) =>
        new Date(todayMidnightMs - (6 - i) * 86_400_000)
      );

      // DeFiLlama API로 각 날짜에 해당하는 블록 번호 조회 (병렬)
      const blocks = await Promise.all(dates.map((d) => dateToBlock(key, d)));

      // 각 블록 시점의 Factory + Pair 데이터를 순차 fetch
      // 병렬로 하면 RPC에 부하가 과다할 수 있어 순차 처리
      const snapshots: { factory: FactoryData; pairs: PairData[] }[] = [];
      for (const block of blocks) {
        const factory = await fetchFactoryData(config, block);
        const pairs = await fetchAllPairs(config, config.factory, factory.allPairsLength, block);
        snapshots.push({ factory, pairs });
      }

      // Factory 히스토리: 날짜 순서대로 7개
      states[key].factoryHistory = snapshots.map((s) => s.factory);

      // Pair 히스토리: 주소별로 그룹화
      // byAddr["0xPairAddr"] = [day0Data, day1Data, ..., day6Data]
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
      // 아카이브 노드 관련 에러 친화적 메시지
      if (msg.toLowerCase().includes('block') || msg.toLowerCase().includes('missing') || msg.toLowerCase().includes('archive')) {
        states[key].historyError = `히스토리 조회 실패: 아카이브 노드가 필요합니다. (${msg})`;
      } else {
        states[key].historyError = `히스토리 조회 실패: ${msg}`;
      }
    } finally {
      states[key].historyLoading = false;
    }
  }
</script>

<!-- ─── 마크업(HTML 템플릿) ────────────────────────────────────────────────── -->
<main>
  <header>
    <h1>UniPool — Parameter Dashboard</h1>
    <!-- onclick={loadAll}: 버튼 클릭 시 loadAll 함수 호출 -->
    <button onclick={loadAll}>Load all chains</button>
  </header>

  <!-- 날짜 범위 비교 -->
  <div class="range-bar">
    <span class="range-label">기간 비교</span>
    <label class="range-input">
      <span>시작</span>
      <input type="datetime-local" bind:value={fromDate} />
    </label>
    <span class="range-arrow">→</span>
    <label class="range-input">
      <span>종료</span>
      <input type="datetime-local" bind:value={toDate} />
    </label>
    <button class="compare-btn" onclick={compareAllRange}>Compare</button>
    {#if rangeError}
      <span class="range-error">{rangeError}</span>
    {/if}
  </div>

  <!-- 검색창 -->
  <div class="search-bar">
    <!-- bind:value={searchQuery}:
         양방향 바인딩(two-way binding).
         input 값이 바뀌면 searchQuery가 업데이트되고,
         searchQuery가 바뀌면 input 값도 업데이트된다. -->
    <input
      type="text"
      placeholder="Search pairs by symbol, name, or address..."
      bind:value={searchQuery}
    />
    <!-- {#if searchQuery}: searchQuery가 빈 문자열이 아닐 때만 표시 -->
    {#if searchQuery}
      <!-- () => (searchQuery = ''): 클릭 시 검색어 초기화 -->
      <button class="clear-btn" onclick={() => (searchQuery = '')}>✕</button>
    {/if}
  </div>

  <!-- 체인별 컬럼 그리드 -->
  <div class="chains">
    <!-- {#each Object.entries(CHAINS) as [key, config] (key)}:
         CHAINS를 [key, value] 쌍으로 순회.
         (key) = 각 항목의 고유 식별자. Svelte가 리스트를 효율적으로 업데이트하는데 씀.
         key가 없으면 항목이 바뀔 때 모든 DOM을 다시 생성 → 비효율. -->
    {#each Object.entries(CHAINS) as [key, config] (key)}
      <div class="chain-col">
        <div class="chain-header">
          <span class="chain-name">{config.name}</span>
          <div class="chain-actions">
            {#if states[key as ChainKey].loadedAt && !states[key as ChainKey].loading}
              <button class="baseline-btn" onclick={() => setBaseline(key as ChainKey)}>
                📍 Set baseline
              </button>
              {#if states[key as ChainKey].historyLoading}
                <span class="history-loading">📈 로딩중…</span>
              {:else}
                <button class="history-btn" onclick={() => loadHistory(key as ChainKey)}>
                  📈 7d
                </button>
              {/if}
            {/if}
            <button onclick={() => loadChain(key as ChainKey)}>↻ Refresh</button>
          </div>
        </div>

        {#if states[key as ChainKey].historyError}
          <p class="history-error">{states[key as ChainKey].historyError}</p>
        {/if}

        {#if states[key as ChainKey].baseline}
          {@const bl = states[key as ChainKey].baseline!}
          {@const cur = states[key as ChainKey].loadedAt}
          <div class="period-bar">
            <span class="period-label">Baseline {formatTime(bl.capturedAt)}</span>
            {#if cur && cur > bl.capturedAt}
              <span class="period-arrow">→</span>
              <span class="period-label">{formatTime(cur)}</span>
              <span class="period-duration">({formatDuration(bl.capturedAt, cur)})</span>
            {:else}
              <span class="period-hint">— Refresh to compare</span>
            {/if}
          </div>
        {/if}

        <!-- {#if}: 조건부 렌더링. 조건이 true일 때만 해당 블록을 DOM에 추가. -->
        {#if states[key as ChainKey].loading}
          <p class="state-msg">Loading...</p>

        {:else if states[key as ChainKey].error}
          <p class="state-msg error">{states[key as ChainKey].error}</p>

        {:else if chainHasMatch(config.factory, states[key as ChainKey].factory, states[key as ChainKey].vault, states[key as ChainKey].pairs)}
          {#if sidebarStore.selectedFactoryCount === 0 || sidebarStore.isFactorySelected(key as ChainKey)}
            <FactoryCard
              chainLabel={config.name}
              data={states[key as ChainKey].factory}
              prevData={states[key as ChainKey].baseline?.factory ?? null}
              loading={false}
              error={null}
            />
          {/if}

          {#if states[key as ChainKey].vault && (sidebarStore.selectedVaultCount === 0 || sidebarStore.isVaultSelected(key as ChainKey))}
            {@const symMap = Object.fromEntries(
              states[key as ChainKey].pairs.flatMap((p) => [
                [p.token0.toLowerCase(), p.token0Symbol],
                [p.token1.toLowerCase(), p.token1Symbol]
              ]).filter(([, s]) => s)
            )}
            <VaultCard
              data={states[key as ChainKey].vault!}
              prevData={states[key as ChainKey].baseline?.vault ?? null}
              tokenSymbols={symMap}
            />
          {/if}

          <!-- Pair 카드 목록 -->
          {#if states[key as ChainKey].pairs.length > 0}
            {@const filtered = filterPairs(states[key as ChainKey].pairs, config.factory, states[key as ChainKey].factory, states[key as ChainKey].vault)}
            {@const visible = sidebarStore.selectedCount > 0
              ? filtered.filter(p => sidebarStore.isSelected(p.address))
              : filtered}
            <div class="pairs-label">
              Pairs ({visible.length} / {states[key as ChainKey].pairs.length})
            </div>
            {#each visible as pair (pair.address)}
              {@const prevPair = states[key as ChainKey].baseline?.pairs.find(p => p.address === pair.address) ?? null}
              {@const pairHistory = states[key as ChainKey].pairHistory?.[pair.address] ?? []}
              <PairCard data={pair} prevData={prevPair} history={pairHistory} chainLabel={config.name} />
            {/each}
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</main>

<style>
  main {
    max-width: 1400px;
    margin: 0 auto;       /* 가운데 정렬 */
    padding: 2rem 1rem;
    font-family: system-ui, sans-serif;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  h1 { font-size: 1.2rem; font-weight: 600; margin: 0; }

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
  .range-arrow { color: #94a3b8; font-size: 0.85rem; }
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
  .compare-btn:hover { background: #4f46e5; border-color: #4f46e5; }
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
    box-sizing: border-box;  /* padding이 width 안에 포함되도록 */
  }
  .search-bar input:focus {
    outline: none;
    border-color: #94a3b8;
    background: #fff;
  }
  .clear-btn {
    position: absolute;    /* search-bar 기준으로 절대 위치 */
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);  /* 세로 중앙 정렬 */
    border: none;
    background: transparent;
    cursor: pointer;
    color: #94a3b8;
    font-size: 0.8rem;
    padding: 0.2rem 0.3rem;
  }
  .clear-btn:hover { color: #475569; }

  .chains {
    display: grid;
    /* auto-fit: 공간에 맞게 컬럼 수 자동 조정
       minmax(320px, 1fr): 최소 320px, 최대 가용 공간 균등 분배 */
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    align-items: start;   /* 각 컬럼이 내용에 맞게 높이 조정 (stretch 대신) */
  }
  .chain-col { display: flex; flex-direction: column; gap: 0.75rem; }
  .chain-header { display: flex; align-items: center; justify-content: space-between; }
  .chain-actions { display: flex; align-items: center; gap: 0.4rem; }
  .baseline-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid #a5b4fc;
    border-radius: 6px;
    background: #eef2ff;
    color: #4338ca;
    cursor: pointer;
  }
  .baseline-btn:hover { background: #e0e7ff; }
  .period-bar {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: #64748b;
    background: #f1f5f9;
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
  }
  .period-arrow { color: #94a3b8; }
  .period-duration { font-weight: 600; color: #475569; }
  .period-hint { color: #94a3b8; font-style: italic; }
  .chain-name { font-size: 0.85rem; font-weight: 600; color: #475569; }
  .pairs-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.25rem;
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
  .history-btn:hover { background: #cffafe; }
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
  .state-msg { font-size: 0.85rem; color: #64748b; padding: 1rem 0; }
  .state-msg.error { color: #ef4444; }
  button {
    font-size: 0.8rem;
    padding: 0.3rem 0.75rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: #f8fafc;
    cursor: pointer;
  }
  button:hover { background: #f1f5f9; }
</style>