import type { ChainKey } from '../config/chains';

export type PairEntry = {
  address: string;
  symbol: string;
  token0Symbol: string;
  token1Symbol: string;
  chain: ChainKey;
  chainLabel: string;
};

export type ChainEntry = {
  chain: ChainKey;
  chainLabel: string;
  address: string;
};

class SidebarStore {
  // ── Pair ──────────────────────────────────────────────────────────────
  pairs = $state<PairEntry[]>([]);
  selectedAddresses = $state<Set<string>>(new Set());

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
    const kept = this.pairs.filter((p) => p.chain !== chain);
    const added: PairEntry[] = rawPairs.map((p) => ({
      address: p.address,
      symbol: p.symbol,
      token0Symbol: p.token0Symbol ?? p.token0.slice(0, 6) + '…',
      token1Symbol: p.token1Symbol ?? p.token1.slice(0, 6) + '…',
      chain,
      chainLabel,
    }));
    this.pairs = [...kept, ...added];
  }

  togglePair(address: string) {
    const next = new Set(this.selectedAddresses);
    if (next.has(address)) next.delete(address);
    else next.add(address);
    this.selectedAddresses = next;
  }

  isSelected(address: string): boolean {
    return this.selectedAddresses.has(address);
  }

  clearPairs() {
    this.selectedAddresses = new Set();
  }

  get selectedCount(): number {
    return this.selectedAddresses.size;
  }

  // ── Factory ───────────────────────────────────────────────────────────
  factories = $state<ChainEntry[]>([]);
  selectedFactories = $state<Set<ChainKey>>(new Set());

  setFactory(chain: ChainKey, chainLabel: string, address: string) {
    this.factories = [
      ...this.factories.filter((f) => f.chain !== chain),
      { chain, chainLabel, address },
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

  // ── Vault ─────────────────────────────────────────────────────────────
  vaults = $state<ChainEntry[]>([]);
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

export const sidebarStore = new SidebarStore();
