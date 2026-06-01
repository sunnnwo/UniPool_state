// ═══════════════════════════════════════════════════════════════════════════════
// chains.ts — 지원 체인(블록체인 네트워크) 설정 모듈
//
// ■ 이 파일의 역할
//   앱이 어떤 체인들과 통신하는지 한 곳에서 정의한다.
//   RPC URL, Factory 컨트랙트 주소를 체인별로 묶어 둔 "체인 설정 테이블".
//
// ■ EVM(Ethereum Virtual Machine, 이더리움 가상 머신)이란?
//   이더리움이 스마트 컨트랙트를 실행하는 방식을 정의한 표준.
//   Arbitrum, Base, BSC 모두 EVM 호환(EVM-compatible)이다.
//   → 동일한 솔리디티 코드, ABI, viem 라이브러리를 그대로 재사용 가능.
//
// ■ Layer 2(L2)란?
//   이더리움(Layer 1) 위에 올려진 별도 체인.
//   거래 수수료(gas)가 싸고 처리 속도가 빠르다.
//   - Arbitrum: L2, Optimistic Rollup 방식. 이더리움 메인넷보다 가스비 ~10배 저렴.
//   - Base:     L2, Optimistic Rollup. Coinbase가 운영.
//   - BSC:      L1이지만 EVM 호환. Binance Smart Chain. 이더리움과 독립적 체인.
//
// ■ 왜 이더리움 메인넷은 지원하지 않는가?
//   .env의 VITE_FACTORY_ETHEREUM = 0x000...000 (zero address, 미배포)
//   → 이더리움에는 Factory가 배포되지 않아 지원 불가.
//
// ■ import.meta.env란?
//   Vite(빌드 도구)가 .env 파일의 값을 앱에 주입하는 방식.
//   VITE_ 접두사가 붙은 환경 변수만 클라이언트에 노출됨.
//   예) .env의 VITE_RPC_ARBITRUM → import.meta.env.VITE_RPC_ARBITRUM로 접근.
//   보안: VITE_ 없는 변수(예: 서버 비밀키)는 브라우저에 절대 노출 안 됨.
//
// ■ as const란?
//   TypeScript에서 객체/배열의 타입을 "리터럴 타입"으로 고정.
//   as const 없으면: CHAINS.arbitrum.name 타입 = string (넓은 타입)
//   as const 있으면: CHAINS.arbitrum.name 타입 = "Arbitrum One" (좁은 타입)
//   → ChainKey 타입("arbitrum" | "base" | "bsc")을 정확하게 추론 가능.
// ═══════════════════════════════════════════════════════════════════════════════

// viem/chains: viem 라이브러리가 제공하는 체인 메타데이터 (chainId, 기본 RPC 등).
// 여기서 import한 arbitrum/base/bsc는 viem이 알아서 네트워크 규칙을 적용할 때 씀.
import { arbitrum, base, bsc } from "viem/chains";

// ─── 배포 현황 ────────────────────────────────────────────────────────────────
// 실제 배포 체인: Arbitrum, Base, BSC
// 이더리움은 .env에 VITE_FACTORY_ETHEREUM = 0x000...000 (zero address) → 미배포
//
// Factory 주소 (각 체인별 UniPool 프로토콜 진입점):
//   Arbitrum: 0xa88216E6Cf409a25c719234C4817628Ae406b6A7
//   Base:     0xC264944E9E7073F8F98fEf7338Cda973914FcA44
//   BSC:      0xabD8DC06559634e59F6698c33A5E65e90e917b91

export const CHAINS = {
  // ── Arbitrum One ──────────────────────────────────────────────────────────
  // Ethereum L2. Offchain Labs가 운영. Optimistic Rollup.
  // 블록 시간 ~0.25초 (이더리움 ~12초 대비 훨씬 빠름).
  arbitrum: {
    name: "Arbitrum One",

    // viem에게 "이 클라이언트는 Arbitrum 체인이다"라고 알려줌.
    // → 자동으로 Arbitrum chainId(42161), 기본 탐색기 URL 등을 적용.
    chain: arbitrum,

    // Alchemy의 전용(Dedicated) Arbitrum 노드 RPC 엔드포인트.
    // as string: import.meta.env 반환값이 string | undefined 이므로
    //            명시적으로 string이라고 TypeScript에 알려줌.
    rpc: import.meta.env.VITE_RPC_ARBITRUM as string,

    // 0x${string}: "0x"로 시작하는 이더리움 주소 타입 (viem 컨벤션).
    factory: import.meta.env.VITE_FACTORY_ARBITRUM as `0x${string}`,
  },

  // ── Base ──────────────────────────────────────────────────────────────────
  // Ethereum L2. Coinbase가 운영. OP Stack 기반.
  // "Onchain is the next online" 슬로건으로 일반 사용자 온보딩에 집중.
  base: {
    name: "Base",
    chain: base,
    rpc: import.meta.env.VITE_RPC_BASE as string,
    factory: import.meta.env.VITE_FACTORY_BASE as `0x${string}`,
  },

  // ── BNB Smart Chain (BSC) ─────────────────────────────────────────────────
  // 이더리움과 별개의 독립 체인. Binance 생태계와 연동.
  // EVM 호환이라 동일한 코드 사용 가능.
  // 가스비가 저렴하고 사용자 기반이 넓음 (특히 아시아/동남아 지역).
  bsc: {
    name: "BNB Smart Chain",
    chain: bsc,
    // BSC RPC도 Alchemy를 통해 연결 (VITE_RPC_BSC = Alchemy BNB 엔드포인트)
    rpc: import.meta.env.VITE_RPC_BSC as string,
    factory: import.meta.env.VITE_FACTORY_BSC as `0x${string}`,
  },
} as const; // as const: 키 타입을 "arbitrum"|"base"|"bsc"로 고정 (string으로 넓어지지 않게)

// ─── 타입 추출 ─────────────────────────────────────────────────────────────
// keyof typeof CHAINS → "arbitrum" | "base" | "bsc"
// typeof CHAINS: 런타임 값(CHAINS 객체)에서 타입을 역으로 추출.
// keyof: 그 타입의 모든 키를 유니온(|) 타입으로 꺼냄.
//
// 사용 예)
//   function loadChain(key: ChainKey) { ... }
//   loadChain("arbitrum")  // ✅ OK
//   loadChain("ethereum")  // ❌ 컴파일 에러 (없는 체인)
export type ChainKey = keyof typeof CHAINS;
