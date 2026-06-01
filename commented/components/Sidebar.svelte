<script lang="ts">
  // ═══════════════════════════════════════════════════════════════════════════
  // Sidebar.svelte — 좌측 사이드바 네비게이션 컴포넌트
  //
  // ■ 이 파일의 역할
  //   Factory / Vault / Pair 항목을 체크박스 목록으로 보여주는 좌측 사이드바.
  //   체크박스를 켜면 sidebarStore의 선택 상태가 바뀌고,
  //   +page.svelte의 카드 표시 필터가 그 상태를 읽어 해당 카드만 표시한다.
  //
  // ■ 사이드바의 동작 방식
  //   1. 체인 데이터 로드 → sidebarStore.setPairsForChain(...) 호출 → pairs 목록 갱신
  //   2. 사이드바가 그 pairs를 체크박스 목록으로 표시
  //   3. 사용자가 체크박스 클릭 → togglePair(address) → selectedAddresses에 추가/제거
  //   4. +page.svelte가 selectedAddresses를 읽어 선택된 카드만 필터링
  //
  // ■ Svelte 5 $state/$derived 요약
  //   $state(초기값): 반응형 변수 선언. 값 변경 시 이를 참조하는 모든 곳 자동 업데이트.
  //   $derived(표현식): 다른 $state에서 파생된 값. 의존 값이 바뀔 때 자동 재계산.
  //
  // ■ 아코디언(accordion) UI 패턴
  //   Factory / Vault / Pair 각 섹션이 접었다 펼 수 있는 아코디언 형태.
  //   factoryOpen / vaultOpen / pairsOpen: 각 섹션의 펼침 상태.
  // ═══════════════════════════════════════════════════════════════════════════

  import { sidebarStore } from '$lib/sidebar.svelte';
  import type { ChainKey } from '../config/chains';

  // ─── 아코디언 펼침 상태 ───────────────────────────────────────────────────
  // 각 섹션이 열려있는지(true) 닫혀있는지(false)를 추적하는 반응형 변수.
  // 초기값 false: 처음 로드 시 모든 섹션 접혀있음.
  let factoryOpen = $state(false);
  let vaultOpen = $state(false);
  let pairsOpen = $state(false);

  // ─── 정렬된 목록 파생 값 ─────────────────────────────────────────────────
  // $derived: sidebarStore.pairs가 바뀔 때마다 자동으로 알파벳 순 정렬.
  // [...배열]: 원본을 복사한 뒤 sort() → sidebarStore.pairs 원본은 변경하지 않음.
  //            (sort는 원본 배열을 변경하므로 복사 필수)
  //
  // localeCompare: 문자열 비교 함수. 'a'.localeCompare('b') < 0 → 'a'가 먼저.
  // token0Symbol + token1Symbol: "WETHUSDT" 형태로 이어붙여 정렬 → 토큰 쌍 기준 정렬.
  const sortedPairs = $derived(
    [...sidebarStore.pairs].sort((a, b) =>
      (a.token0Symbol + a.token1Symbol).localeCompare(b.token0Symbol + b.token1Symbol)
    )
  );

  // Factory는 체인 이름 기준 알파벳 순 정렬.
  const sortedFactories = $derived(
    [...sidebarStore.factories].sort((a, b) => a.chainLabel.localeCompare(b.chainLabel))
  );

  // Vault도 체인 이름 기준 알파벳 순 정렬.
  const sortedVaults = $derived(
    [...sidebarStore.vaults].sort((a, b) => a.chainLabel.localeCompare(b.chainLabel))
  );

  // 42자리 이더리움 주소를 "0x1234…abcd" 형태로 단축.
  // slice(0, 6): "0x1234", slice(-4): "abcd" (마지막 4자리)
  function shortAddr(addr: string) {
    return addr.slice(0, 6) + '…' + addr.slice(-4);
  }

  // 섹션별 전체 선택 해제.
  // section에 따라 sidebarStore의 해당 clear 메서드를 호출.
  function clearAll(section: 'factory' | 'vault' | 'pair') {
    if (section === 'factory') sidebarStore.clearFactories();
    else if (section === 'vault') sidebarStore.clearVaults();
    else sidebarStore.clearPairs();
  }
</script>

<!--
  nav.sidebar: 왼쪽에 고정된 사이드바 컨테이너.
  height: 100vh → 뷰포트 전체 높이.
  position: sticky; top: 0 → 스크롤해도 화면 상단에 고정.
  overflow-y: auto → 항목이 많으면 사이드바 자체가 스크롤됨.
-->
<nav class="sidebar">
  <div class="sidebar-title">Menu</div>

  <!-- ══════════════════════════════════
       Factory 섹션 아코디언
       ══════════════════════════════════ -->
  <button
    class="nav-item"
    class:active={factoryOpen}
    onclick={() => (factoryOpen = !factoryOpen)}
  >
    <span class="nav-icon">🏭</span>
    <span class="nav-label">Factory</span>

    <!--
      count-badge: Factory 선택 수 표시.
      선택된 게 있으면 보라색(selected), 없으면 회색.
      sortedFactories.length > 0 이면 전체 개수도 표시.
    -->
    {#if sidebarStore.selectedFactoryCount > 0}
      <span class="count-badge selected">{sidebarStore.selectedFactoryCount}</span>
    {:else if sortedFactories.length > 0}
      <span class="count-badge">{sortedFactories.length}</span>
    {/if}

    <!-- chevron(›): factoryOpen이 true이면 .open 클래스 추가 → CSS rotate(90deg) 적용 -->
    <span class="chevron" class:open={factoryOpen}>›</span>
  </button>

  <!-- {#if factoryOpen}: 섹션이 열려있을 때만 목록 렌더링 -->
  {#if factoryOpen}
    <div class="item-list">
      {#if sortedFactories.length === 0}
        <!-- 데이터 로드 전: 힌트 메시지 표시 -->
        <p class="empty-hint">데이터를 먼저 로드해주세요</p>
      {:else}
        <!-- 1개 이상 선택됐으면 "필터 중" 안내 + 전체 해제 버튼 표시 -->
        {#if sidebarStore.selectedFactoryCount > 0}
          <div class="filter-bar">
            <span class="filter-label">🔍 {sidebarStore.selectedFactoryCount}개 필터 중</span>
            <button class="clear-btn" onclick={() => clearAll('factory')}>전체 해제</button>
          </div>
        {/if}

        <!--
          {#each sortedFactories as entry (entry.chain)}:
          entry.chain을 키(key)로 사용해 Svelte가 각 항목을 추적.
          키가 있으면 데이터 변경 시 DOM을 최소한만 다시 생성 (성능 최적화).
        -->
        {#each sortedFactories as entry (entry.chain)}
          <!--
            label 태그: 내부 checkbox와 연결. label을 클릭해도 체크박스가 토글됨.
            class:checked: isFactorySelected가 true이면 .checked CSS 클래스 추가 → 강조 표시.
          -->
          <label class="entry-item" class:checked={sidebarStore.isFactorySelected(entry.chain)}>
            <input
              type="checkbox"
              checked={sidebarStore.isFactorySelected(entry.chain)}
              onchange={() => sidebarStore.toggleFactory(entry.chain as ChainKey)}
            />
            <div class="entry-info">
              <span class="entry-label">{entry.chainLabel}</span>
              <!-- 주소 단축 표시: "0x1234...abcd" -->
              <span class="entry-addr">{shortAddr(entry.address)}</span>
            </div>
          </label>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- ══════════════════════════════════
       Vault 섹션 아코디언
       (Factory 섹션과 동일한 구조)
       ══════════════════════════════════ -->
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

  <!-- ══════════════════════════════════
       Pair 섹션 아코디언
       ══════════════════════════════════ -->
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

        <!--
          pair.address를 키로 사용.
          Pair가 추가/제거돼도 이미 렌더링된 다른 Pair의 DOM은 유지됨.
        -->
        {#each sortedPairs as pair (pair.address)}
          <label class="entry-item" class:checked={sidebarStore.isSelected(pair.address)}>
            <input
              type="checkbox"
              checked={sidebarStore.isSelected(pair.address)}
              onchange={() => sidebarStore.togglePair(pair.address)}
            />
            <div class="entry-info">
              <!-- "WETH/USDT" 형태로 토큰 쌍 표시 -->
              <span class="entry-label">{pair.token0Symbol}/{pair.token1Symbol}</span>
              <span class="pair-meta">
                <!-- chain-tag: 어느 체인인지 작은 배지로 표시 ("ARBITRUM", "BASE", "BSC") -->
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
  /*
   * position: sticky; top: 0
   *   일반 흐름에 있지만 스크롤 시 화면 상단에 고정됨.
   *   (position: fixed는 레이아웃 흐름에서 완전히 빠져 다른 요소와 겹칠 수 있음)
   *
   * height: 100vh
   *   뷰포트(브라우저 창) 전체 높이. vh = viewport height.
   *   vh 단위는 브라우저 창 크기 변경 시 자동 조정됨.
   *
   * overflow-y: auto
   *   내용이 높이를 초과하면 세로 스크롤바 자동 생성.
   */
  .sidebar {
    width: 220px;
    min-width: 220px;
    height: 100vh;
    position: sticky;
    top: 0;
    background: #0f172a; /* 짙은 남색 (Tailwind slate-900) */
    color: #e2e8f0;      /* 밝은 회색 (Tailwind slate-200) */
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    overflow-y: auto;
    font-family: system-ui, sans-serif;
  }

  /* 섹션 상단 "MENU" 타이틀 */
  .sidebar-title {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em; /* 자간 넓게 → 타이틀 강조 효과 */
    text-transform: uppercase;
    color: #64748b; /* 중간 회색 */
    padding: 0 1rem 0.75rem;
    border-bottom: 1px solid #1e293b;
    margin-bottom: 0.5rem;
  }

  /* 각 섹션의 헤더 버튼 (Factory / Vault / Pair) */
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
    transition: background 0.15s; /* 호버 시 배경 변화 애니메이션 */
  }
  .nav-item:hover { background: #1e293b; }
  /* .active: 섹션이 열려있을 때 배경 강조 + 흰 텍스트 */
  .nav-item.active { background: #1e293b; color: #fff; }

  .nav-icon { font-size: 1rem; line-height: 1; }
  .nav-label { flex: 1; } /* 남은 공간 차지 → 배지와 chevron을 오른쪽으로 밀어냄 */

  /* 아이템 개수 배지 */
  .count-badge {
    font-size: 0.7rem;
    background: #334155; /* 비선택: 어두운 회색 */
    color: #94a3b8;
    border-radius: 999px; /* 완전한 원형 */
    padding: 0.1rem 0.45rem;
    font-weight: 600;
  }
  /* .selected: 1개 이상 선택됐을 때 보라색으로 강조 */
  .count-badge.selected {
    background: #6366f1; /* Tailwind indigo-500 */
    color: #fff;
  }

  /* 화살표 아이콘. .open 클래스 시 90도 회전 (아코디언 열림 표시) */
  .chevron {
    font-size: 1rem;
    transition: transform 0.2s; /* 부드러운 회전 애니메이션 */
    display: inline-block;
  }
  .chevron.open { transform: rotate(90deg); }

  /* 체크박스 항목 목록 컨테이너 */
  .item-list {
    padding: 0 0 0.5rem;
    background: #0a1120; /* 사이드바보다 더 어두운 배경 → 계층 구분 */
    border-bottom: 1px solid #1e293b;
  }

  /* 데이터 없을 때 힌트 텍스트 */
  .empty-hint {
    font-size: 0.75rem;
    color: #475569;
    padding: 0.5rem 1.25rem;
    margin: 0;
  }

  /* 필터 활성 시 상단에 표시되는 안내 바 */
  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.35rem 0.75rem 0.35rem 1rem;
    background: #1e1b4b; /* 보라색 배경 → 필터 활성 상태 강조 */
    border-bottom: 1px solid #312e81;
  }
  .filter-label {
    font-size: 0.7rem;
    color: #a5b4fc; /* 연한 보라 */
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

  /* 개별 체크박스 항목 행 */
  .entry-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    cursor: pointer;
    transition: background 0.1s;
    border-left: 2px solid transparent; /* 선택 시 왼쪽 보라 테두리 */
  }
  .entry-item:hover { background: #1e293b; }
  /* .checked: 선택된 항목 — 왼쪽 보라 테두리 + 어두운 배경 */
  .entry-item.checked {
    background: #1e1b4b;
    border-left-color: #6366f1;
  }

  /* 체크박스 색상을 브랜드 컬러(보라)로 변경 */
  .entry-item input[type='checkbox'] {
    margin-top: 0.2rem;
    accent-color: #6366f1; /* CSS accent-color: 폼 요소 기본 색상 변경 */
    flex-shrink: 0; /* 공간 부족해도 체크박스 크기 유지 */
  }

  .entry-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0; /* flex 자식에서 텍스트 overflow 처리를 위해 필요 */
  }

  /* 항목 이름 (체인명 또는 토큰쌍) */
  .entry-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #e2e8f0;
    white-space: nowrap;     /* 줄바꿈 없이 한 줄 */
    overflow: hidden;         /* 넘치면 자르기 */
    text-overflow: ellipsis; /* 자른 부분에 "..." 표시 */
  }

  /* 컨트랙트 주소 단축 표시 */
  .entry-addr {
    font-size: 0.65rem;
    color: #475569;
    font-family: monospace; /* 고정폭 폰트 → 주소 가독성 향상 */
  }

  /* Pair의 체인 태그 + 주소를 가로로 배치 */
  .pair-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  /* "ARBITRUM", "BASE", "BSC" 작은 배지 */
  .chain-tag {
    font-size: 0.6rem;
    background: #1e293b;
    color: #64748b;
    border-radius: 3px;
    padding: 0.05rem 0.3rem;
    font-weight: 600;
    text-transform: uppercase; /* 소문자 입력도 대문자로 표시 */
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
</style>
