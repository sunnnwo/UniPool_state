import { arbitrum, base, bsc } from "viem/chains";

// ─── 실제 배포 체인: Arbitrum, Base, BSC ──────────────────────────────────────
// 근거: .env의 VITE_FACTORY_ETHEREUM = 0x000...000 (zero address) → 이더리움 미배포
// Arbitrum: 0xa88216E6Cf409a25c719234C4817628Ae406b6A7
// Base:     0xC264944E9E7073F8F98fEf7338Cda973914FcA44
// BSC:      0xabD8DC06559634e59F6698c33A5E65e90e917b91

export const CHAINS = {
  arbitrum: {
    name: "Arbitrum One",
    chain: arbitrum,
    rpc: import.meta.env.VITE_RPC_ARBITRUM as string,
    factory: import.meta.env.VITE_FACTORY_ARBITRUM as `0x${string}`,
  },
  base: {
    name: "Base",
    chain: base,
    rpc: import.meta.env.VITE_RPC_BASE as string,
    factory: import.meta.env.VITE_FACTORY_BASE as `0x${string}`,
  },
  bsc: {
    name: "BNB Smart Chain",
    chain: bsc,
    // BSC RPC도 .env에 Alchemy 키로 정상 입력되어 있음 → hardcode 불필요
    rpc: import.meta.env.VITE_RPC_BSC as string,
    factory: import.meta.env.VITE_FACTORY_BSC as `0x${string}`,
  },
} as const;

export type ChainKey = keyof typeof CHAINS;
