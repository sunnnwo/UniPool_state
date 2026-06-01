// ═══════════════════════════════════════════════════════════════════════════════
// fetchvault.ts — Vault 컨트랙트 데이터 조회 모듈
//
// ■ Vault(금고)란?
//   Pair 풀에서 당장 대출이나 스왑에 쓰이지 않는 "유휴(idle) 자금"을 모아
//   Aave에 예치해 추가 이자를 버는 스마트 컨트랙트.
//
//   흐름:
//   [사용자 → Pair 풀에 유동성 공급]
//     ↓ 사용되지 않는 부분
//   [Vault] → [Aave에 예치] → 이자 발생
//                            ↓
//                    LP에게 분배 (Yield Accumulator 통해)
//
// ■ Aave란?
//   별도의 DeFi(탈중앙화 금융) 대출 프로토콜.
//   토큰을 맡기면(예치하면) 이자를 준다.
//   예치하면 이자가 자동으로 쌓이는 "aToken"을 받는다.
//   예) USDC 예치 → aUSDC 수령. 시간이 지날수록 aUSDC ↔ USDC 교환 비율이 올라감.
//
// ■ isIdle(유휴 상태)이란?
//   true  = 토큰이 Vault에 그냥 보관됨 (Aave에 예치 안 됨, 이자 안 쌓임)
//   false = 토큰이 Aave에 예치되어 이자를 벌고 있음 ("In Aave")
//
// ■ Yield Accumulator(수익 누산기)란?
//   Aave에서 발생한 이자를 LP들에게 공정하게 분배하기 위한 누적 배율.
//   은행 예금의 "복리 지수(compound index)"와 유사한 개념.
//   - yieldAccumulator: 현재 시점의 누적 배율
//   - lastYieldAccumulator: 마지막 온체인 업데이트 시점의 배율
//   두 값의 차이 = 마지막 업데이트 이후 발생한 추가 Aave 이자
// ═══════════════════════════════════════════════════════════════════════════════

import { createPublicClient, http } from 'viem';
import type { CHAINS } from './chains';
import { VAULT_ABI } from './vault';

// ─── 타입 ─────────────────────────────────────────────────────────────────────

// getAssetData 반환 구조
// 솔리디티에서 128바이트 = 4필드 × 32바이트 크기의 struct(구조체)로 반환됨.
type AssetData = {
	// Vault 내부 이자 누적 추적값.
	// ※ 주의: 토큰마다 스케일이 다름 — RAY(10^27) 단위가 아닐 수 있음.
	//   예) EV 토큰 ≈ 10^27, USDT ≈ 10^10, WETH ≈ 10^18
	// 외부에 노출되는 RAY 정규화 값은 getYieldAccumulator() 사용 (VaultTokenData.yieldAccumulator).
	// 이 값은 lastYieldAccumulator와 비교해 "마지막 업데이트 이후 추가 이자"를 계산하는 용도.
	yieldAccumulator: bigint;

	// 마지막 온체인 업데이트 시점의 내부 누산기 값 (assetData.yieldAccumulator와 동일 스케일).
	// 현재 yieldAccumulator와의 차이 = 아직 반영되지 않은 Aave 이자.
	lastYieldAccumulator: bigint;

	// 이 토큰이 Vault에서 활성화되어 있는지.
	// false이면 이 토큰으로 Vault 기능(예치/인출) 불가.
	isActive: boolean;

	// 이 토큰이 Aave 이자 수취 대상으로 설정되어 있는지.
	// false = Aave 이자 미지원. Vault 자체 추적/보관은 가능 (isIdle=true로 동작).
	// ※ "Vault에서 완전히 미지원"이 아님 — 단지 Aave 연동이 꺼진 상태.
	isSupported: boolean;
};

// getAaveTokenSupport 반환 구조
// 이 토큰이 Aave와 어떻게 연동되어 있는지 나타냄.
// 검증 결과: 일부 Vault는 Aave를 사용하지 않아 전부 0/false일 수 있음.
type AaveTokenSupport = {
	// 이 토큰이 Aave 연동으로 설정되어 있는지.
	// false = 이 Vault는 Aave 없이 운영 (토큰을 그냥 Vault에 보관).
	isSupported: boolean;

	// Aave에서 이 토큰을 예치하면 받는 이자 토큰(aToken) 주소.
	// 예) USDC 예치 → aUSDC 주소가 여기 저장됨.
	// Aave 미사용이면 zero address(0x000...000).
	aToken: `0x${string}`;

	// Vault가 현재 실제로 Aave에 예치한 양.
	currentBalance: bigint;

	// Vault가 Aave에 예치하려는 목표 수량.
	// targetBalance > currentBalance → 아직 예치 진행 중.
	targetBalance: bigint;
};

// 토큰 하나에 대한 Vault 관련 모든 데이터 묶음
export type VaultTokenData = {
	token: `0x${string}`; // 조회한 토큰의 컨트랙트 주소

	assetData: AssetData;

	// getAssetStatus 결과: true = Idle(Vault에 보관, Aave 미예치), false = Aave에 예치 중
	isIdle: boolean;

	aaveSupport: AaveTokenSupport;

	// getYieldAccumulator() 결과. 항상 RAY(10^27) 단위로 정규화된 수익 누산기.
	// 초기값 1 RAY(= 10^27). 이자가 쌓일수록 증가.
	// 예) 1.001 × 10^27 → 0.1% 이자 누적.
	// ※ assetData.yieldAccumulator와 다른 값 — assetData는 토큰별 내부 스케일,
	//    이 값은 RAY 정규화. 화면 표시에는 이 값을 사용할 것.
	yieldAccumulator: bigint;
};

// Vault 전체 상태
export type VaultData = {
	address: `0x${string}`;  // Vault 컨트랙트 자체 주소
	factory: `0x${string}`; // 이 Vault를 소유/관리하는 Factory 주소
	aavePool: `0x${string}`; // 연결된 Aave 풀 주소. zero address면 Aave 미사용.
	// tokens: 각 토큰(token0, token1)의 Vault 상태를 담은 배열.
	// fetchAllPairs에서 수집한 토큰 주소 배열 순서와 일치.
	tokens: VaultTokenData[];
};

type ChainConfig = (typeof CHAINS)[keyof typeof CHAINS];

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`;

// ─── 메인 함수 ────────────────────────────────────────────────────────────────
// vaultAddress: fetchFactoryData에서 얻은 data.vault
// tokenAddresses: fetchAllPairs에서 각 Pair의 token0/token1을 수집한 배열 (중복 제거된 상태)
// blockNumber: 과거 블록 조회 시 지정 (아카이브 노드 필요), 미지정 시 현재 상태
export async function fetchVaultData(
	config: ChainConfig,
	vaultAddress: `0x${string}`,
	tokenAddresses: `0x${string}`[],
	blockNumber?: bigint
): Promise<VaultData> {
	const client = createPublicClient({
		chain: config.chain,
		transport: http(config.rpc)
	});

	// blockNumber가 있으면 { blockNumber: ... }, 없으면 {} 를 multicall에 spread
	const blockOpt = blockNumber !== undefined ? { blockNumber } : {};

	// ── 1단계: Vault 기본 정보 조회 ──────────────────────────────────────────
	// 토큰과 무관한 Factory 주소, Aave 풀 주소만 조회 (2개 함수)
	const baseResults = await client.multicall({
		allowFailure: true,
		...blockOpt,
		contracts: [
			{ address: vaultAddress, abi: VAULT_ABI, functionName: 'getFactory' },  // [0] Factory 주소
			{ address: vaultAddress, abi: VAULT_ABI, functionName: 'getAavePool' }  // [1] Aave 풀 주소
		]
	});

	function getBase<T>(i: number, fallback: T): T {
		const r = baseResults[i];
		return r.status === 'success' ? (r.result as T) : fallback;
	}

	// ── 2단계: 토큰별 함수들 ─────────────────────────────────────────────────
	// 각 토큰마다 4개 함수를 호출 → 토큰 수 × 4개를 한 번의 multicall로 묶음
	// 예) 토큰 2개 → 8개 호출을 1번 RPC 요청으로
	//
	// contracts 배열 구조 (토큰 n개 가정):
	//   토큰0: [getAssetData, getAssetStatus, getAaveTokenSupport, getYieldAccumulator]  인덱스 0~3
	//   토큰1: [getAssetData, getAssetStatus, getAaveTokenSupport, getYieldAccumulator]  인덱스 4~7
	//   ...
	// 인덱스 계산: 토큰 i의 함수 j → i * 4 + j
	const tokenContracts = tokenAddresses.flatMap((token) => [
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getAssetData' as const,
			args: [token] as const
		}, // i*4+0: 활성화 여부, 수익 누산기 등 기본 상태
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getAssetStatus' as const,
			args: [token] as const
		}, // i*4+1: true = idle(Vault 보관), false = Aave 예치 중
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getAaveTokenSupport' as const,
			args: [token] as const
		}, // i*4+2: Aave aToken 주소, 예치 잔액 등
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getYieldAccumulator' as const,
			args: [token] as const
		} // i*4+3: 현재 수익 누산기 값 (assetData와 같은 값, 별도 노출)
	]);

	const tokenResults = await client.multicall({
		allowFailure: true,
		...blockOpt,
		contracts: tokenContracts
	});

	// ── 3단계: 결과 파싱 ──────────────────────────────────────────────────────
	const ASSET_FALLBACK: AssetData = {
		yieldAccumulator: 0n,
		lastYieldAccumulator: 0n,
		isActive: false,
		isSupported: false
	};
	const AAVE_FALLBACK: AaveTokenSupport = {
		isSupported: false,
		aToken: ZERO,
		currentBalance: 0n,
		targetBalance: 0n
	};

	const tokens: VaultTokenData[] = tokenAddresses.map((token, i) => {
		const base = i * 4; // 이 토큰의 결과가 tokenResults 배열에서 시작하는 인덱스

		// tokenResults에서 특정 오프셋(base + offset)의 결과를 꺼내는 헬퍼
		function getToken<T>(offset: number, fallback: T): T {
			const r = tokenResults[base + offset];
			return r.status === 'success' ? (r.result as T) : fallback;
		}

		return {
			token,
			assetData: getToken<AssetData>(0, ASSET_FALLBACK),        // getAssetData 결과
			isIdle: getToken<boolean>(1, false),                       // getAssetStatus 결과
			aaveSupport: getToken<AaveTokenSupport>(2, AAVE_FALLBACK), // getAaveTokenSupport 결과
			yieldAccumulator: getToken<bigint>(3, 0n)                  // getYieldAccumulator 결과
		};
	});

	return {
		address: vaultAddress,
		factory: getBase<`0x${string}`>(0, ZERO),
		aavePool: getBase<`0x${string}`>(1, ZERO),
		tokens
	};
}
