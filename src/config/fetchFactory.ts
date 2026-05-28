// ═══════════════════════════════════════════════════════════════════════════════
// fetchFactory.ts — Factory 스마트 컨트랙트 데이터 조회 모듈
//
// ■ 스마트 컨트랙트(Smart Contract)란?
//   블록체인 위에 배포된 프로그램. 0x로 시작하는 주소로 식별되며,
//   한 번 배포되면 코드를 바꿀 수 없다. 함수를 "호출"하면 데이터를 읽거나 쓸 수 있다.
//
// ■ RPC(Remote Procedure Call)란?
//   블록체인 노드(서버)에 함수 호출 요청을 보내는 방식.
//   예) "이 주소의 컨트랙트에서 getFeeCollector()를 호출하면 뭐가 나와?"
//
// ■ Multicall(멀티콜)이란?
//   여러 함수 호출을 하나의 HTTP 요청으로 묶는 최적화 기법.
//   13개 함수를 각각 호출하면 13번 왕복 → Multicall이면 1번 왕복으로 끝남.
//
// ■ blockNumber(블록 번호)란?
//   블록체인은 ~2~12초마다 새 "블록"을 생성하고 번호를 부여한다.
//   특정 blockNumber를 지정하면 그 시점의 과거 상태를 조회할 수 있음.
//   - 미지정 → 지금 현재 최신 상태
//   - 지정   → 그 블록 당시 상태 (아카이브 노드 필요)
//
// ■ 아카이브 노드(Archive Node)란?
//   모든 과거 블록 상태를 통째로 저장하는 특수 노드.
//   일반 노드는 최근 ~128블록만 유지 → 오래된 블록 조회 불가.
//   이 앱의 "날짜 비교" 기능은 아카이브 노드가 있어야 동작한다.
// ═══════════════════════════════════════════════════════════════════════════════

import { createPublicClient, http } from 'viem';
// viem: 이더리움/EVM 체인과 통신하는 TypeScript 라이브러리.
// createPublicClient: 읽기 전용 클라이언트 (서명 없이 데이터 조회만 가능).
// http: HTTPS 방식으로 RPC 노드에 연결하는 transport(전송) 방식.

import type { CHAINS } from './chains';
import { FACTORY_ABI } from './factory';
// ABI(Application Binary Interface, 어플리케이션 바이너리 인터페이스)란?
// 컨트랙트에 어떤 함수가 있고, 어떤 파라미터를 받고, 무엇을 반환하는지 기술한 명세.
// viem이 ABI를 보고 함수 호출 시 자동으로 타입 추론 + 인코딩/디코딩을 처리한다.

// ─── BPS(Basis Points, 베이시스 포인트)란? ────────────────────────────────────
// 금융에서 작은 비율을 정수로 표현하는 단위.
//   1 bps = 0.01% = 1 / 10,000
//   예) 30 bps = 0.30%,  300 bps = 3.00%,  10000 bps = 100%
// 소수점 오류(0.1 + 0.2 ≠ 0.3 문제)를 피하기 위해 블록체인에서 널리 사용.

// ─── 이자율 모델(Kinked Interest Rate Model, 꺾인 이자율 곡선) ──────────────
// 대출 프로토콜(Aave, Compound 등)이 이자율을 결정하는 방식.
// "사용률(utilization)" = 빌려간 양 / 총 예치량 에 따라 이자율이 변함.
//
//  이자율(%)
//   │                              ╱  (이 구간: 사용률 과다 → 이자율 급등)
//   │                         ╱
//   interestRateOptimal  ───●  ← Optimal Point(꺾임점)
//   │                  ╱
//   interestRateBase  ╱
//   └──────────────────┬───────── 사용률(0% ~ 100%)
//                 optimalPoint
//
// 사용률이 꺾임점(예: 80%) 미만이면 이자율이 완만하게 증가.
// 초과하면 급격히 증가 → 과도한 대출을 억제하는 효과.

type InterestParams = {
	// 이자 수익 중 프로토콜(운영팀)이 가져가는 수수료 비율 (단위: bps).
	// 예) 1000 bps = 10% → 이자가 100원이면 10원은 프로토콜 몫.
	protocolFeeBps: number;

	// 이자율 곡선의 "꺾임점" — 사용률이 이 값을 넘으면 이자율이 급등 (단위: bps).
	// 예) 8000 bps = 80% → 풀의 80% 이상 빌려가면 이자율 급등.
	optimalPointBps: number;

	// 사용률 0% 일 때의 기본 연이자율 (단위: bps).
	interestRateBaseBps: number;

	// 사용률이 정확히 optimalPoint일 때의 목표 연이자율 (단위: bps).
	interestRateOptimalBps: number;

	// 사용률이 optimalPoint를 초과할 때 추가로 붙는 이자율 (단위: bps).
	// 이 값이 클수록 초과 대출에 강한 패널티를 줌.
	interestRateAddBps: number;
};

// Factory 컨트랙트에서 읽어오는 전체 설정 데이터 구조.
// Factory는 모든 Pair 풀의 "기본값 창고" 역할을 한다.
export type FactoryData = {
	// 누적된 수수료를 받는 지갑 또는 컨트랙트 주소.
	feeCollector: `0x${string}`;

	// Beacon Proxy 패턴의 Beacon 컨트랙트 주소.
	// Beacon Proxy 패턴: Pair 풀이 수백 개여도 구현 코드는 하나.
	// Beacon 주소 하나만 업데이트하면 모든 Pair 풀이 동시에 새 버전으로 업그레이드됨.
	// (각 Pair를 개별 업그레이드할 필요 없음 → 가스비 절감)
	beaconAddress: `0x${string}`;

	// 유휴(idle, 당장 쓰이지 않는) 자금을 Aave에 예치하는 Vault 컨트랙트 주소.
	// Aave: 별도의 DeFi 대출 프로토콜. 토큰을 맡기면 이자를 줌.
	vault: `0x${string}`;

	// Aave 대출 풀 컨트랙트 주소.
	aavePool: `0x${string}`;

	// Factory가 지금까지 생성한 Pair(유동성 풀) 총 개수.
	// bigint 타입인 이유: 솔리디티 uint256 → JS의 number는 2^53까지만 안전 → bigint 사용.
	allPairsLength: bigint;

	fees: {
		// 스왑할 때 LP(Liquidity Provider, 유동성 공급자)에게 돌아가는 수수료 비율 (bps).
		feeLp: number;
		// 스왑 수수료 중 프로토콜 운영을 위해 feeCollector로 가는 비율 (bps).
		feePool: number;
		// 스왑할 때 LP 토큰의 일부를 소각(burn, 태워서 없앰)하는 수수료 (bps).
		// 소각 → 토큰 총 공급량 감소 → 남은 토큰의 가치 상승 효과.
		burnFee: number;
	};

	// 이자율 모델 파라미터 (위 InterestParams 설명 참고).
	// Factory의 값은 각 Pair 생성 시 기본값으로 적용됨. Pair는 개별 오버라이드 가능.
	interestParams: InterestParams;

	// 최대 담보 대비 대출 비율 (LTV, Loan-to-Value).
	// 예) 8000 bps = 80% → 담보 가치가 100원이면 최대 80원까지만 빌릴 수 있음.
	borrowLimitBps: number;

	// 청산(liquidation) 시 추가 패널티 비율 (bps).
	// 청산: 담보 가치가 빌린 금액보다 부족해지면 강제로 포지션을 정리하는 것.
	// 예) 500 bps = 5% → 청산 시 담보에서 5% 추가로 차감됨.
	liquidationPenaltyBps: number;

	// 하나의 틱(tick) 구간에서 허용되는 최대 대출 비율 (bps).
	// 틱(tick): 가격 범위를 이산적(discrete, 끊어진) 단계로 나눈 단위. Uniswap v3 방식.
	// 특정 가격대에 대출이 집중되는 것을 막기 위한 상한선.
	maxBorrowPerTick: number;

	// 여러 틱에 걸친 전체 범위에서 허용되는 최대 대출 비율 (bps).
	maxBorrowPerRange: number;

	// 가상 가격(virtual price)이 실제 시장가를 향해 수렴하는 속도.
	// Virtual Price: 스왑 방향(살 때/팔 때)에 따라 다른 "비대칭 가격"의 기준값.
	// 거래가 없으면 이 속도로 시간이 지날수록 시장가에 가까워짐.
	priceDecay: bigint;

	// 스왑 시 허용 가격 슬리피지(slippage) 최대 범위 (bps).
	// 슬리피지: 예상 가격과 실제 체결 가격의 차이.
	// 이 범위를 초과하면 트랜잭션이 자동으로 실패(revert)됨.
	swapPriceToleranceBps: number;

	// 청산 계산 시 여유를 주는 틱 수.
	// 급격한 가격 변동 시 즉시 청산되지 않도록 완충 역할.
	tickBuffer: number;
};

type ChainConfig = (typeof CHAINS)[keyof typeof CHAINS];

// Factory 컨트랙트의 모든 설정을 한 번의 RPC 요청(Multicall)으로 읽어옴.
// config: 어느 체인인지 (rpc URL + Factory 컨트랙트 주소 포함)
// blockNumber: 특정 과거 블록 시점을 조회하려면 지정, 미지정 시 현재 상태
export async function fetchFactoryData(config: ChainConfig, blockNumber?: bigint): Promise<FactoryData> {
	const client = createPublicClient({
		chain: config.chain,        // 체인 정보 (Arbitrum / Base / BSC)
		transport: http(config.rpc) // RPC 엔드포인트 URL (Alchemy, Infura 등)
	});

	const results = await client.multicall({
		allowFailure: true, // 일부 함수가 실패해도 나머지 결과는 계속 받음. 실패 시 { status: 'failure' }.
		...(blockNumber !== undefined ? { blockNumber } : {}),
		// blockNumber가 지정됐으면 { blockNumber: ... } 스프레드, 없으면 빈 객체.
		// 빈 객체를 스프레드 하면 아무것도 추가 안 함 → 최신 블록 조회.
		contracts: [
			// 배열의 각 항목 = "어떤 컨트랙트의 어떤 함수를 호출할지" 명세
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getFeeCollector' },          // [0]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getBeaconAddress' },          // [1]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getVault' },                  // [2]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getAavePool' },               // [3]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getAllPairsLength' },         // [4]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getFeesBps' },               // [5] → 반환: [feeLp, feePool, burnFee]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getInterestParamsBps' },     // [6] → 반환: 단일 tuple 객체
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getBorrowLimitBps' },        // [7]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getLiquidationPenaltyBps' }, // [8]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getMaxBorrowPerTickAndRange' }, // [9] → 반환: [maxTick, maxRange]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getPriceDecay' },            // [10]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getSwapPriceToleranceBps' }, // [11]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getTickBuffer' }             // [12]
		]
	});

	// 결과 파싱 헬퍼 함수.
	// i: contracts 배열에서의 인덱스
	// fallback: 호출 실패 시 대신 반환할 기본값
	// T: TypeScript 제네릭(generic) — 반환 타입을 호출 시점에 지정
	function get<T>(i: number, fallback: T): T {
		const r = results[i];
		return r.status === 'success' ? (r.result as T) : fallback;
	}

	// [5] getFeesBps → 솔리디티에서 (uint16 feeLp, uint16 feePool, uint16 burnFee) 반환.
	//     viem multicall은 복수 반환값을 배열로 줌: [feeLp, feePool, burnFee]
	const fees = get<readonly [number, number, number]>(5, [0, 0, 0]);

	// [6] getInterestParamsBps → Factory는 단일 tuple 반환 → viem이 객체로 변환.
	//     (Pair와 달리 Factory는 token0/token1 구분 없이 하나의 파라미터 세트)
	const INTEREST_FALLBACK: InterestParams = {
		protocolFeeBps: 0,
		optimalPointBps: 0,
		interestRateBaseBps: 0,
		interestRateOptimalBps: 0,
		interestRateAddBps: 0
	};
	const interest = get<InterestParams>(6, INTEREST_FALLBACK);

	// [9] getMaxBorrowPerTickAndRange → [maxPerTick, maxPerRange] 배열 반환
	const maxBorrow = get<readonly [number, number]>(9, [0, 0]);

	// ZERO address: 실제로 존재하지 않는 주소. 컨트랙트 미설정 또는 미지원 상태를 나타냄.
	const ZERO = '0x0000000000000000000000000000000000000000' as const;

	return {
		feeCollector: get<`0x${string}`>(0, ZERO),
		beaconAddress: get<`0x${string}`>(1, ZERO),
		vault: get<`0x${string}`>(2, ZERO),
		aavePool: get<`0x${string}`>(3, ZERO),
		allPairsLength: get<bigint>(4, 0n), // 0n: BigInt 리터럴 (일반 숫자 0과 다른 타입)
		fees: { feeLp: fees[0], feePool: fees[1], burnFee: fees[2] },
		interestParams: interest,
		borrowLimitBps: get<number>(7, 0),
		liquidationPenaltyBps: get<number>(8, 0),
		maxBorrowPerTick: maxBorrow[0],
		maxBorrowPerRange: maxBorrow[1],
		priceDecay: get<bigint>(10, 0n),
		swapPriceToleranceBps: get<number>(11, 0),
		tickBuffer: get<number>(12, 0)
	};
}

// bps(베이시스 포인트)를 퍼센트 문자열로 변환하는 표시용 유틸리티.
// 예) bpsToPercent(30) → "0.30%",  bpsToPercent(8000) → "80.00%"
export function bpsToPercent(bps: number): string {
	return `${(bps / 100).toFixed(2)}%`;
}
