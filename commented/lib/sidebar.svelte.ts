// ═══════════════════════════════════════════════════════════════════════════════
// sidebar.svelte.ts — 사이드바 전역 상태 관리 모듈
//
// ■ 이 파일의 역할
//   앱 전체에서 사이드바 선택 상태를 공유하는 "전역 스토어".
//   여러 컴포넌트가 같은 선택 상태를 읽고 쓸 수 있도록 중앙에서 관리한다.
//
// ■ .svelte.ts 파일이란?
//   Svelte 5에서 $state/$derived 등의 룬(rune)을 TypeScript 파일(.ts)에서 사용하려면
//   확장자를 .svelte.ts로 해야 한다. 그래야 Svelte 컴파일러가 룬을 인식한다.
//   일반 .ts에서는 $state() 사용 불가.
//
// ■ Svelte 5 룬($state)이란?
//   반응형 상태를 선언하는 새로운 방식. Svelte 4의 writable 스토어를 대체.
//   클래스 필드에 $state()를 붙이면 그 값이 바뀔 때 이를 읽는 컴포넌트가 자동 업데이트.
//
// ■ 왜 클래스(class)로 만드는가?
//   $state 필드들과 그것을 조작하는 메서드들을 하나로 묶기 위해.
//   export const sidebarStore = new SidebarStore() 로 싱글턴 인스턴스를 내보내면,
//   모든 컴포넌트가 같은 인스턴스를 import해서 상태를 공유할 수 있다.
//
// ■ 싱글턴(singleton)이란?
//   앱 전체에 인스턴스가 딱 하나만 존재하는 패턴.
//   여러 컴포넌트가 import해도 모두 같은 객체를 가리킨다.
//
// ■ 이 스토어가 관리하는 3가지 섹션
//   Factory: 각 체인의 Factory 카드 표시 여부
//   Vault:   각 체인의 Vault 카드 표시 여부
//   Pair:    특정 Pair 카드 표시 여부 (주소로 식별)
// ═══════════════════════════════════════════════════════════════════════════════

import type { ChainKey } from '../config/chains';

// ─── 타입 정의 ───────────────────────────────────────────────────────────────

// 사이드바 Pair 목록의 각 항목 타입.
// +page.svelte에서 fetchAllPairs 결과를 이 형태로 변환해 sidebarStore에 전달.
export type PairEntry = {
  address: string;      // Pair 컨트랙트 주소 (선택/해제 식별자로 사용)
  symbol: string;       // ERC-20 심볼 (예: "ULP")
  token0Symbol: string; // token0 심볼 (예: "WETH") — 사이드바에 "WETH/USDT" 형태로 표시
  token1Symbol: string; // token1 심볼 (예: "USDT")
  chain: ChainKey;      // 이 Pair가 속한 체인 ("arbitrum" | "base" | "bsc")
  chainLabel: string;   // 사람이 읽는 체인 이름 (예: "Arbitrum One")
};

// 사이드바 Factory / Vault 목록의 각 항목 타입.
// Factory와 Vault는 체인당 하나씩이므로 chain으로 식별.
export type ChainEntry = {
  chain: ChainKey;      // 체인 키 (선택/해제 식별자로 사용)
  chainLabel: string;   // 사람이 읽는 체인 이름
  address: string;      // Factory 또는 Vault 컨트랙트 주소
};

// ─── 상태 클래스 ─────────────────────────────────────────────────────────────
class SidebarStore {

  // ══════════════════════════════════════
  // Pair 섹션
  // ══════════════════════════════════════

  // pairs: 모든 체인에서 로드된 Pair 목록 (사이드바에 체크박스로 표시됨).
  // $state([]): 빈 배열로 초기화. 값이 바뀌면 이를 읽는 모든 컴포넌트 자동 업데이트.
  pairs = $state<PairEntry[]>([]);

  // selectedAddresses: 현재 체크된(선택된) Pair 주소 집합.
  // Set<string>: 중복 없는 문자열 집합. has()로 O(1) 시간에 포함 여부 확인.
  // 비어있으면 = "필터 없음" = 모든 Pair 표시.
  selectedAddresses = $state<Set<string>>(new Set());

  // 특정 체인의 Pair 목록을 최신 데이터로 교체한다.
  // chain: 교체할 체인의 키 ("arbitrum" 등)
  // rawPairs: fetchAllPairs에서 가져온 원시 Pair 데이터 배열
  setPairsForChain(
    chain: ChainKey,
    chainLabel: string,
    rawPairs: Array<{
      address: string;
      symbol: string;
      token0: string;
      token1: string;
      token0Symbol?: string | null;
      token1Symbol?: string | null;
    }>
  ) {
    // 기존 pairs에서 이 체인을 제외하고 (kept) 새 데이터(added)를 합친다.
    // 이렇게 하면 다른 체인의 Pair는 그대로 유지된다.
    const kept = this.pairs.filter((p) => p.chain !== chain);

    const added: PairEntry[] = rawPairs.map((p) => ({
      address: p.address,
      symbol: p.symbol,
      // token0Symbol이 없으면 주소 앞 6자리 + 말줄임표로 대체 (fallback)
      token0Symbol: p.token0Symbol ?? p.token0.slice(0, 6) + '…',
      token1Symbol: p.token1Symbol ?? p.token1.slice(0, 6) + '…',
      chain,
      chainLabel,
    }));

    // 스프레드 연산자로 배열 합치기. [kept, added] 직접 할당은 Svelte 반응성 트리거 안 됨.
    // 항상 새 배열을 만들어 할당해야 Svelte가 변화를 감지한다.
    this.pairs = [...kept, ...added];
  }

  // Pair를 선택/해제 토글한다. 이미 선택됐으면 해제, 아니면 선택.
  togglePair(address: string) {
    // Set은 불변(immutable) 조작이 필요하므로 복사 후 수정 후 재할당.
    // this.selectedAddresses.add(address) 직접 호출은 Svelte 반응성 트리거 안 됨.
    const next = new Set(this.selectedAddresses);
    if (next.has(address)) next.delete(address);
    else next.add(address);
    this.selectedAddresses = next; // 새 Set 할당 → Svelte가 변화 감지
  }

  // 주소가 현재 선택된 상태인지 확인. Set.has()는 O(1) 시간 복잡도.
  isSelected(address: string): boolean {
    return this.selectedAddresses.has(address);
  }

  // 모든 Pair 선택 해제. 빈 Set을 재할당.
  clearPairs() {
    this.selectedAddresses = new Set();
  }

  // 현재 선택된 Pair 수. 0이면 = "필터 없음" = 모든 Pair 표시.
  // get: JavaScript getter — 함수지만 속성처럼 접근 가능 (호출 시 ()가 불필요).
  //      sidebarStore.selectedCount (O) vs sidebarStore.selectedCount() (X)
  get selectedCount(): number {
    return this.selectedAddresses.size;
  }

  // ══════════════════════════════════════
  // Factory 섹션
  // ══════════════════════════════════════

  // factories: 로드된 Factory 항목 목록 (체인별 1개씩, 최대 3개).
  factories = $state<ChainEntry[]>([]);

  // selectedFactories: 선택된(필터링 중인) Factory 체인 키 집합.
  // ChainKey("arbitrum"|"base"|"bsc")를 키로 사용 — Pair와 달리 주소가 아닌 체인 키.
  selectedFactories = $state<Set<ChainKey>>(new Set());

  // 특정 체인의 Factory 항목을 등록/업데이트.
  // 이미 같은 체인의 항목이 있으면 교체, 없으면 추가.
  setFactory(chain: ChainKey, chainLabel: string, address: string) {
    this.factories = [
      ...this.factories.filter((f) => f.chain !== chain), // 기존 항목 제거
      { chain, chainLabel, address },                      // 새 항목 추가
    ];
  }

  toggleFactory(chain: ChainKey) {
    const next = new Set(this.selectedFactories);
    if (next.has(chain)) next.delete(chain);
    else next.add(chain);
    this.selectedFactories = next;
  }

  isFactorySelected(chain: ChainKey): boolean {
    return this.selectedFactories.has(chain);
  }

  clearFactories() {
    this.selectedFactories = new Set();
  }

  get selectedFactoryCount(): number {
    return this.selectedFactories.size;
  }

  // ══════════════════════════════════════
  // Vault 섹션
  // ══════════════════════════════════════

  // vaults: 로드된 Vault 항목 목록 (체인별 1개씩, 최대 3개).
  vaults = $state<ChainEntry[]>([]);

  // selectedVaults: 선택된 Vault 체인 키 집합.
  selectedVaults = $state<Set<ChainKey>>(new Set());

  setVault(chain: ChainKey, chainLabel: string, address: string) {
    this.vaults = [
      ...this.vaults.filter((v) => v.chain !== chain),
      { chain, chainLabel, address },
    ];
  }

  toggleVault(chain: ChainKey) {
    const next = new Set(this.selectedVaults);
    if (next.has(chain)) next.delete(chain);
    else next.add(chain);
    this.selectedVaults = next;
  }

  isVaultSelected(chain: ChainKey): boolean {
    return this.selectedVaults.has(chain);
  }

  clearVaults() {
    this.selectedVaults = new Set();
  }

  get selectedVaultCount(): number {
    return this.selectedVaults.size;
  }
}

// ─── 싱글턴 인스턴스 내보내기 ─────────────────────────────────────────────
// 이 파일을 import하는 모든 컴포넌트가 동일한 인스턴스를 공유한다.
// import { sidebarStore } from '$lib/sidebar.svelte'
// → $lib 별칭은 SvelteKit이 src/lib를 가리키도록 자동 설정.
export const sidebarStore = new SidebarStore();
