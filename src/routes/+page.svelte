<script lang="ts">
  // ─── +page.svelte ──────────────────────────────────────────────────────────
  // Role of this file:
  //   The app's main page. Coordinates data loading for all chains and displays
  //   Factory / Vault / Pair cards side-by-side per chain.
  //
  // In SvelteKit, +page.svelte is the page component corresponding to a route (URL path).
  //   src/routes/+page.svelte → http://localhost:5173/ (root path)
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

  // ─── State type definition ────────────────────────────────────────────────
  type ChainState = {
    factory: FactoryData | null;
    pairs: PairData[];
    vault: VaultData | null;
    loading: boolean;
    error: string | null;
    loadedAt: Date | null;
    // 7-day history: used for sparkline charts
    factoryHistory: FactoryData[];
    pairHistory: Record<string, PairData[]> | null;
    historyLoading: boolean;
    historyError: string | null;
  };

  // ─── $state: Svelte 5 reactive state ──────────────────────────────────────
  // Svelte 4: let states = writable({})  (store pattern, more verbose)
  // Svelte 5: let states = $state({})   (rune pattern, more intuitive)
  //
  // Variables declared with $state() are "reactive":
  //   When the value changes, Svelte automatically re-renders any UI using that variable.
  //   states[key].loading = true → loading spinner shown immediately
  //   states[key].factory = data → card shown immediately
  //
  // Record<ChainKey, ChainState>:
  //   Record<K, V> = { [key in K]: V } type.
  //   Object type with keys "arbitrum", "base", "bsc" and ChainState values.
  //
  // Object.fromEntries(Object.keys(CHAINS).map(...)):
  //   Object.keys(CHAINS)     → ["arbitrum", "base", "bsc"]
  //   .map((k) => [k, {...}]) → [["arbitrum", {...}], ["base", {...}], ["bsc", {...}]]
  //   Object.fromEntries(...)  → { arbitrum: {...}, base: {...}, bsc: {...} }
  //
  // as unknown as Record<ChainKey, ChainState>:
  //   Object.fromEntries returns { [k: string]: ... }, which cannot be directly
  //   cast to a type with keys "arbitrum" | "base" | "bsc".
  //   Casting = telling the compiler "treat this value as this type".
  //   Routing through unknown allows casting to any type.
  let states = $state<Record<ChainKey, ChainState>>(
    Object.fromEntries(
      Object.keys(CHAINS).map((k) => [k, { factory: null, pairs: [], vault: null, loading: false, error: null, loadedAt: null, factoryHistory: [], pairHistory: null, historyLoading: false, historyError: null }])
    ) as unknown as Record<ChainKey, ChainState>
  );

  // ─── Search state ──────────────────────────────────────────────────────────
  // $state(''): reactive variable initialised to an empty string.
  // Connecting bind:value={searchQuery} to an input means
  // this value updates automatically as the user types.
  let searchQuery = $state('');

  // ─── Search query normalisation ──────────────────────────────────────────
  // $derived: a derived value that auto-recalculates whenever searchQuery changes.
  //
  // Why not use a plain function (function filterPairs)?
  //   In Svelte 5 a plain function is not reactive.
  //   When searchQuery changes the function's return value is not recalculated.
  //   Therefore {@const filtered = filterPairs(...)} in the template would not update.
  //
  // With $derived:
  //   The moment searchQuery ($state) changes, Svelte automatically recomputes this value.
  //   → Filtering results update instantly as the user types.
  //
  // .trim(): removes leading and trailing whitespace
  // .toLowerCase(): makes the comparison case-insensitive
  const normalizedQuery = $derived(searchQuery.trim().toLowerCase());

  // filterPairs: filters the Pair array using the normalised search query.
  // References normalizedQuery ($derived), so when the query changes the filter result also changes.
  // Checks whether chain-level addresses (factory, vault, fee collector, etc.) match the query
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

  // Checks whether the chain has at least one item matching the query (determines whether factory/vault cards are shown)
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

  // ─── DeFiLlama date → block conversion ──────────────────────────────────
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

  // ─── Date range comparison state ────────────────────────────────────────
  let fromDate = $state('');
  let toDate = $state('');
  let rangeError = $state<string | null>(null);

  async function compareChainRange(key: ChainKey, toBlock: bigint, to: Date) {
    const config = CHAINS[key];
    states[key].loading = true;
    states[key].error = null;

    try {
      // end-block data → current
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
    if (!fromDate || !toDate) { rangeError = 'Please enter both a start date and an end date.'; return; }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from >= to) { rangeError = 'Start date must be earlier than end date.'; return; }

    try {
      // fetch block numbers for all chains in parallel
      const keys = Object.keys(CHAINS) as ChainKey[];
      const blockPairs = await Promise.all(
        keys.map(async (key) => {
          const toBlock = await dateToBlock(key, to);
          return { key, toBlock };
        })
      );
      // run comparison per chain
      await Promise.all(blockPairs.map(({ key, toBlock }) =>
        compareChainRange(key, toBlock, to)
      ));
    } catch (e) {
      rangeError = e instanceof Error ? e.message : 'Block lookup failed';
    }
  }

  // ─── Single chain load function ──────────────────────────────────────────
  // async: uses await internally to execute async operations sequentially.
  async function loadChain(key: ChainKey) {
    const config = CHAINS[key];

    // start loading: Svelte detects loading=true and shows the "Loading..." message
    states[key].loading = true;
    states[key].error = null;

    // try/catch/finally:
    //   try:     success path. Runs only if no error occurs.
    //   catch:   runs when an error is thrown. e = the error object.
    //   finally: always runs regardless of success or failure. Used to end loading.
    try {
      // Step 1: Factory data
      // await: waits until this Promise resolves.
      //        While waiting, the browser can continue other work (UI updates, etc.).
      const factory = await fetchFactoryData(config);
      states[key].factory = factory;  // show Factory card in UI immediately
      sidebarStore.setFactory(key, config.name, config.factory);

      // Step 2: Pair list
      // reuses factory.allPairsLength → no need to call Factory again
      const pairs = await fetchAllPairs(config, config.factory, factory.allPairsLength);
      states[key].pairs = pairs;  // show Pair cards in UI immediately
      sidebarStore.setPairsForChain(key, config.name, pairs);

      // Step 3: Vault
      // extract all token0/token1 addresses from pairs → deduplicate → query Vault only once
      //
      // .flatMap((p) => [p.token0, p.token1]):
      //   extracts both token addresses from each Pair into a single flat array.
      //   e.g. 2 Pairs → ["0xWETH", "0xUSDT", "0xWETH", "0xDAI"]
      //
      // new Set(allTokens):
      //   Set = a data structure that does not allow duplicates.
      //   Even if the same address appears in multiple Pairs, it is queried only once.
      //   → ["0xWETH", "0xUSDT", "0xDAI"]
      //
      // [...new Set(allTokens)]:
      //   converts the Set back to an array (spread operator).
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

  // ─── Load all chains in parallel ──────────────────────────────────────────
  // Promise.all: loads all 3 chains concurrently.
  //   Sequential: chain1 done → chain2 done → chain3 done (slow)
  //   Parallel:   chain1, chain2, chain3 start simultaneously → wait for the slowest (fast)
  //
  // (Object.keys(CHAINS) as ChainKey[]):
  //   Object.keys returns string[], but we need ChainKey ("arbitrum"|"base"|"bsc") type → cast.
  function loadAll() {
    return Promise.all((Object.keys(CHAINS) as ChainKey[]).map(loadChain));
  }

  // ─── Load 7-day history ───────────────────────────────────────────────────
  // Collects data at 7 points in time: UTC midnight 6 days ago through today's UTC midnight.
  // Looks up the block number at each point via the DeFiLlama API, then fetches Factory/Pair at that block.
  //
  // Why an archive node is required:
  //   A standard RPC node only stores the latest block state.
  //   Querying smart contract state at a past block requires an archive node.
  //   Querying past blocks without an archive node results in an RPC error.
  async function loadHistory(key: ChainKey) {
    if (!states[key].factory) {
      states[key].historyError = 'Please load current data first.';
      return;
    }
    states[key].historyLoading = true;
    states[key].historyError = null;

    try {
      const config = CHAINS[key];

      // generate 7 dates from 6 days ago to today, each at UTC midnight
      // i=0 → 6 days ago, i=6 → today (sorted oldest first → sparkline left=past)
      //
      // Date.now() % 86_400_000: milliseconds elapsed since today's UTC midnight.
      // now - (now % 86_400_000): UTC midnight timestamp (computed without creating a mutable Date object)
      const nowMs = Date.now();
      const todayMidnightMs = nowMs - (nowMs % 86_400_000);
      const dates = Array.from({ length: 7 }, (_, i) =>
        new Date(todayMidnightMs - (6 - i) * 86_400_000)
      );

      // look up the block number for each date via the DeFiLlama API (in parallel)
      const blocks = await Promise.all(dates.map((d) => dateToBlock(key, d)));

      // fetch Factory + Pair data at each block point sequentially
      // parallel fetching could overload the RPC, so sequential processing is used
      const snapshots: { factory: FactoryData; pairs: PairData[] }[] = [];
      for (const block of blocks) {
        const factory = await fetchFactoryData(config, block);
        const pairs = await fetchAllPairs(config, config.factory, factory.allPairsLength, block);
        snapshots.push({ factory, pairs });
      }

      // Factory history: 7 entries in chronological order
      states[key].factoryHistory = snapshots.map((s) => s.factory);

      // Pair history: grouped by address
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
      // user-friendly error message for archive node issues
      if (msg.toLowerCase().includes('block') || msg.toLowerCase().includes('missing') || msg.toLowerCase().includes('archive')) {
        states[key].historyError = `History fetch failed: an archive node is required. (${msg})`;
      } else {
        states[key].historyError = `History fetch failed: ${msg}`;
      }
    } finally {
      states[key].historyLoading = false;
    }
  }
</script>

<!-- ─── Markup (HTML template) ───────────────────────────────────────────── -->
<main>
  <header>
    <h1>UniPool — Parameter Dashboard</h1>
    <!-- onclick={loadAll}: calls loadAll when the button is clicked -->
    <button onclick={loadAll}>Load all chains</button>
  </header>

  <!-- Date range comparison -->
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

  <!-- Search bar -->
  <div class="search-bar">
    <!-- bind:value={searchQuery}:
         two-way binding.
         When the input value changes, searchQuery is updated;
         when searchQuery changes, the input value is also updated. -->
    <input
      type="text"
      placeholder="Search pairs by symbol, name, or address..."
      bind:value={searchQuery}
    />
    <!-- {#if searchQuery}: shown only when searchQuery is not an empty string -->
    {#if searchQuery}
      <!-- () => (searchQuery = ''): clears the search query on click -->
      <button class="clear-btn" onclick={() => (searchQuery = '')}>✕</button>
    {/if}
  </div>

  <!-- Per-chain column grid -->
  <div class="chains">
    <!-- {#each Object.entries(CHAINS) as [key, config] (key)}:
         iterates CHAINS as [key, value] pairs.
         (key) = unique identifier for each item; used by Svelte to update the list efficiently.
         without a key, all DOM nodes are recreated when an item changes → inefficient. -->
    {#each Object.entries(CHAINS) as [key, config] (key)}
      <div class="chain-col">
        <div class="chain-header">
          <span class="chain-name">{config.name}</span>
          <div class="chain-actions">
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

        {#if states[key as ChainKey].historyError}
          <p class="history-error">{states[key as ChainKey].historyError}</p>
        {/if}

        <!-- {#if}: conditional rendering. Adds the block to the DOM only when condition is true. -->
        {#if states[key as ChainKey].loading}
          <p class="state-msg">Loading...</p>

        {:else if states[key as ChainKey].error}
          <p class="state-msg error">{states[key as ChainKey].error}</p>

        {:else if chainHasMatch(config.factory, states[key as ChainKey].factory, states[key as ChainKey].vault, states[key as ChainKey].pairs)}
          {@const anySelected = sidebarStore.selectedCount > 0 || sidebarStore.selectedFactoryCount > 0 || sidebarStore.selectedVaultCount > 0}

          {#if (!anySelected || sidebarStore.selectedFactoryCount > 0) && (sidebarStore.selectedFactoryCount === 0 || sidebarStore.isFactorySelected(key as ChainKey))}
            <FactoryCard
              chainLabel={config.name}
              data={states[key as ChainKey].factory}
              prevData={null}
              loading={false}
              error={null}
            />
          {/if}

          {#if (!anySelected || sidebarStore.selectedVaultCount > 0) && states[key as ChainKey].vault && (sidebarStore.selectedVaultCount === 0 || sidebarStore.isVaultSelected(key as ChainKey))}
            {@const symMap = Object.fromEntries(
              states[key as ChainKey].pairs.flatMap((p) => [
                [p.token0.toLowerCase(), p.token0Symbol],
                [p.token1.toLowerCase(), p.token1Symbol]
              ]).filter(([, s]) => s)
            )}
            <VaultCard
              data={states[key as ChainKey].vault!}
              prevData={null}
              tokenSymbols={symMap}
            />
          {/if}

          <!-- Pair card list -->
          {#if (!anySelected || sidebarStore.selectedCount > 0) && states[key as ChainKey].pairs.length > 0}
            {@const filtered = filterPairs(states[key as ChainKey].pairs, config.factory, states[key as ChainKey].factory, states[key as ChainKey].vault)}
            {@const visible = sidebarStore.selectedCount > 0
              ? filtered.filter(p => sidebarStore.isSelected(p.address))
              : filtered}
            <div class="pairs-label">
              Pairs ({visible.length} / {states[key as ChainKey].pairs.length})
            </div>
            {#each visible as pair (pair.address)}
              {@const pairHistory = states[key as ChainKey].pairHistory?.[pair.address] ?? []}
              <PairCard data={pair} prevData={null} history={pairHistory} chainLabel={config.name} />
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
    margin: 0 auto;       /* center horizontally */
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
    box-sizing: border-box;  /* include padding within width */
  }
  .search-bar input:focus {
    outline: none;
    border-color: #94a3b8;
    background: #fff;
  }
  .clear-btn {
    position: absolute;    /* positioned relative to search-bar */
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);  /* vertical center */
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
    /* auto-fit: auto-adjust column count to available space
       minmax(320px, 1fr): minimum 320px, maximum equal share of available space */
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    align-items: start;   /* each column sizes to its content (instead of stretch) */
  }
  .chain-col { display: flex; flex-direction: column; gap: 0.75rem; }
  .chain-header { display: flex; align-items: center; justify-content: space-between; }
  .chain-actions { display: flex; align-items: center; gap: 0.4rem; }
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