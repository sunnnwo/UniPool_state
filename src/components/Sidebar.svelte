<script lang="ts">
  import { sidebarStore } from '$lib/sidebar.svelte';
  import type { ChainKey } from '../config/chains';

  let factoryOpen = $state(false);
  let vaultOpen = $state(false);
  let pairsOpen = $state(false);

  const sortedPairs = $derived(
    [...sidebarStore.pairs].sort((a, b) =>
      (a.token0Symbol + a.token1Symbol).localeCompare(b.token0Symbol + b.token1Symbol)
    )
  );

  const sortedFactories = $derived(
    [...sidebarStore.factories].sort((a, b) => a.chainLabel.localeCompare(b.chainLabel))
  );

  const sortedVaults = $derived(
    [...sidebarStore.vaults].sort((a, b) => a.chainLabel.localeCompare(b.chainLabel))
  );

  function shortAddr(addr: string) {
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  function clearAll(section: 'factory' | 'vault' | 'pair') {
    if (section === 'factory') sidebarStore.clearFactories();
    else if (section === 'vault') sidebarStore.clearVaults();
    else sidebarStore.clearPairs();
  }
</script>

<nav class="sidebar">
  <div class="sidebar-title">Menu</div>

  <!-- ── Factory ── -->
  <button
    class="nav-item"
    class:active={factoryOpen}
    onclick={() => (factoryOpen = !factoryOpen)}
  >
    <span class="nav-icon">🏭</span>
    <span class="nav-label">Factory</span>
    {#if sidebarStore.selectedFactoryCount > 0}
      <span class="count-badge selected">{sidebarStore.selectedFactoryCount}</span>
    {:else if sortedFactories.length > 0}
      <span class="count-badge">{sortedFactories.length}</span>
    {/if}
    <span class="chevron" class:open={factoryOpen}>›</span>
  </button>

  {#if factoryOpen}
    <div class="item-list">
      {#if sortedFactories.length === 0}
        <p class="empty-hint">데이터를 먼저 로드해주세요</p>
      {:else}
        {#if sidebarStore.selectedFactoryCount > 0}
          <div class="filter-bar">
            <span class="filter-label">🔍 {sidebarStore.selectedFactoryCount}개 필터 중</span>
            <button class="clear-btn" onclick={() => clearAll('factory')}>전체 해제</button>
          </div>
        {/if}
        {#each sortedFactories as entry (entry.chain)}
          <label class="entry-item" class:checked={sidebarStore.isFactorySelected(entry.chain)}>
            <input
              type="checkbox"
              checked={sidebarStore.isFactorySelected(entry.chain)}
              onchange={() => sidebarStore.toggleFactory(entry.chain as ChainKey)}
            />
            <div class="entry-info">
              <span class="entry-label">{entry.chainLabel}</span>
              <span class="entry-addr">{shortAddr(entry.address)}</span>
            </div>
          </label>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- ── Vault ── -->
  <button
    class="nav-item"
    class:active={vaultOpen}
    onclick={() => (vaultOpen = !vaultOpen)}
  >
    <span class="nav-icon">🏦</span>
    <span class="nav-label">Vault</span>
    {#if sidebarStore.selectedVaultCount > 0}
      <span class="count-badge selected">{sidebarStore.selectedVaultCount}</span>
    {:else if sortedVaults.length > 0}
      <span class="count-badge">{sortedVaults.length}</span>
    {/if}
    <span class="chevron" class:open={vaultOpen}>›</span>
  </button>

  {#if vaultOpen}
    <div class="item-list">
      {#if sortedVaults.length === 0}
        <p class="empty-hint">데이터를 먼저 로드해주세요</p>
      {:else}
        {#if sidebarStore.selectedVaultCount > 0}
          <div class="filter-bar">
            <span class="filter-label">🔍 {sidebarStore.selectedVaultCount}개 필터 중</span>
            <button class="clear-btn" onclick={() => clearAll('vault')}>전체 해제</button>
          </div>
        {/if}
        {#each sortedVaults as entry (entry.chain)}
          <label class="entry-item" class:checked={sidebarStore.isVaultSelected(entry.chain)}>
            <input
              type="checkbox"
              checked={sidebarStore.isVaultSelected(entry.chain)}
              onchange={() => sidebarStore.toggleVault(entry.chain as ChainKey)}
            />
            <div class="entry-info">
              <span class="entry-label">{entry.chainLabel}</span>
              <span class="entry-addr">{shortAddr(entry.address)}</span>
            </div>
          </label>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- ── Pair ── -->
  <button
    class="nav-item"
    class:active={pairsOpen}
    onclick={() => (pairsOpen = !pairsOpen)}
  >
    <span class="nav-icon">⬡</span>
    <span class="nav-label">Pair</span>
    {#if sidebarStore.selectedCount > 0}
      <span class="count-badge selected">{sidebarStore.selectedCount}</span>
    {:else if sortedPairs.length > 0}
      <span class="count-badge">{sortedPairs.length}</span>
    {/if}
    <span class="chevron" class:open={pairsOpen}>›</span>
  </button>

  {#if pairsOpen}
    <div class="item-list">
      {#if sortedPairs.length === 0}
        <p class="empty-hint">데이터를 먼저 로드해주세요</p>
      {:else}
        {#if sidebarStore.selectedCount > 0}
          <div class="filter-bar">
            <span class="filter-label">🔍 {sidebarStore.selectedCount}개 필터 중</span>
            <button class="clear-btn" onclick={() => clearAll('pair')}>전체 해제</button>
          </div>
        {/if}
        {#each sortedPairs as pair (pair.address)}
          <label class="entry-item" class:checked={sidebarStore.isSelected(pair.address)}>
            <input
              type="checkbox"
              checked={sidebarStore.isSelected(pair.address)}
              onchange={() => sidebarStore.togglePair(pair.address)}
            />
            <div class="entry-info">
              <span class="entry-label">{pair.token0Symbol}/{pair.token1Symbol}</span>
              <span class="pair-meta">
                <span class="chain-tag">{pair.chainLabel}</span>
                <span class="entry-addr">{shortAddr(pair.address)}</span>
              </span>
            </div>
          </label>
        {/each}
      {/if}
    </div>
  {/if}
</nav>

<style>
  .sidebar {
    width: 220px;
    min-width: 220px;
    height: 100vh;
    position: sticky;
    top: 0;
    background: #0f172a;
    color: #e2e8f0;
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    overflow-y: auto;
    font-family: system-ui, sans-serif;
  }

  .sidebar-title {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #64748b;
    padding: 0 1rem 0.75rem;
    border-bottom: 1px solid #1e293b;
    margin-bottom: 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.55rem 1rem;
    background: none;
    border: none;
    color: #cbd5e1;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }
  .nav-item:hover { background: #1e293b; }
  .nav-item.active { background: #1e293b; color: #fff; }

  .nav-icon { font-size: 1rem; line-height: 1; }
  .nav-label { flex: 1; }

  .count-badge {
    font-size: 0.7rem;
    background: #334155;
    color: #94a3b8;
    border-radius: 999px;
    padding: 0.1rem 0.45rem;
    font-weight: 600;
  }
  .count-badge.selected {
    background: #6366f1;
    color: #fff;
  }

  .chevron {
    font-size: 1rem;
    transition: transform 0.2s;
    display: inline-block;
  }
  .chevron.open { transform: rotate(90deg); }

  /* ── 공통 드롭다운 ── */
  .item-list {
    padding: 0 0 0.5rem;
    background: #0a1120;
    border-bottom: 1px solid #1e293b;
  }

  .empty-hint {
    font-size: 0.75rem;
    color: #475569;
    padding: 0.5rem 1.25rem;
    margin: 0;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.35rem 0.75rem 0.35rem 1rem;
    background: #1e1b4b;
    border-bottom: 1px solid #312e81;
  }
  .filter-label {
    font-size: 0.7rem;
    color: #a5b4fc;
    font-weight: 600;
  }
  .clear-btn {
    font-size: 0.65rem;
    background: none;
    border: 1px solid #4338ca;
    color: #818cf8;
    border-radius: 4px;
    padding: 0.1rem 0.4rem;
    cursor: pointer;
  }
  .clear-btn:hover { background: #312e81; }

  .entry-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    cursor: pointer;
    transition: background 0.1s;
    border-left: 2px solid transparent;
  }
  .entry-item:hover { background: #1e293b; }
  .entry-item.checked {
    background: #1e1b4b;
    border-left-color: #6366f1;
  }

  .entry-item input[type='checkbox'] {
    margin-top: 0.2rem;
    accent-color: #6366f1;
    flex-shrink: 0;
  }

  .entry-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
  }

  .entry-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-addr {
    font-size: 0.65rem;
    color: #475569;
    font-family: monospace;
  }

  .pair-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .chain-tag {
    font-size: 0.6rem;
    background: #1e293b;
    color: #64748b;
    border-radius: 3px;
    padding: 0.05rem 0.3rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
</style>
