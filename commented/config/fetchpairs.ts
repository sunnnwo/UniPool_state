// ═══════════════════════════════════════════════════════════════════════════════
// fetchpairs.ts — Pair(유동성 풀) 컨트랙트 데이터 조회 모듈
//
// ■ AMM(Automated Market Maker, 자동화 마켓 메이커)이란?
//   주문서(order book) 없이 알고리즘으로 가격을 결정하는 거래 방식.
//   Uniswap이 대표적 예. "Reserve(보유량)"를 기반으로 가격이 결정됨.
//   예) 풀이 ETH 10개, USDC 20000개 보유 중이면 → ETH 가격 = 2000 USDC
//       누가 ETH를 사면 ETH가 줄고 USDC가 늘어 → ETH 가격 상승 (슬리피지)
//
// ■ Reserve(보유량)란?
//   풀이 실제로 보유한 토큰 수량.
//   x * y = k 공식(유니스왑 v2)에서 x, y가 reserve.
//   유저가 토큰을 넣으면 reserve 증가, 꺼내가면 감소.
//
// ■ Virtual Reserve(가상 보유량)란?
//   UniPool 고유 기능. 실제 reserve와 별개로 가격 계산에만 쓰는 "가상" 수량.
//   In(살 때)과 Out(팔 때)을 별도로 관리해 비대칭 가격(스프레드)을 만든다.
//   예) vReserve0In < vReserve0Out → token0 매수가 > 매도가 → 스프레드 발생
//   → Price Decay로 시간이 지나면 실제 가격에 수렴.
//
// ■ Tick(틱)이란?
//   가격 범위를 이산적(discrete, 끊어진) 단계로 나눈 단위. Uniswap v3 방식.
//   예) Tick 0 = 가격 1.0000, Tick 1 = 가격 1.0001, Tick -1 = 가격 0.9999...
//   유동성을 특정 가격 구간에 집중시키기 위해 사용.
//
// ■ RAY(레이) = 10^27 이란?
//   솔리디티에는 소수점이 없어서 비율을 정수로 저장해야 함.
//   1 RAY = 10^27 = 100%를 나타내는 기준값.
//   예) 이자율 5% = 0.05 = 5 * 10^25 (RAY 단위)
//   JavaScript에서 퍼센트로 변환: Number(value) / 1e27 * 100
//
// ■ Yield Accumulator(수익 누산기)란?
//   누적 이자 배율을 저장하는 값 (단위: RAY).
//   처음 1 RAY(= 1.0)에서 시작. 이자가 쌓일수록 증가.
//   예) 1.05 * 10^27 → 5% 이자가 누적된 상태.
//   LP 토큰 1개의 현재 가치 = 초기 가치 * (현재 누산기 / 예치 당시 누산기)
// ═══════════════════════════════════════════════════════════════════════════════

import { createPublicClient, http, formatUnits } from 'viem';
// formatUnits: BigInt 원시값을 사람이 읽기 쉬운 소수로 변환하는 viem 유틸.
// 예) formatUnits(1000000n, 6) → "1.000000"  (USDC 1달러: 6 decimals)
//     formatUnits(1000000000000000000n, 18) → "1.000000000000000000"  (ETH 1개: 18 decimals)

import type { CHAINS } from './chains';
import { PAIR_ABI } from './pair';
import { FACTORY_ABI } from './factory';

// 토큰 심볼/소수점 조회에만 필요한 최소 ERC-20 ABI.
// 전체 ERC-20 ABI 대신 필요한 함수 2개만 정의해 번들 크기를 줄임.
const ERC20_META_ABI = [
	{ name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' as const },
	{ name: 'decimals', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' as const }
] as const;

// ─── 이자율 파라미터 ─────────────────────────────────────────────────────────
// fetchFactory.ts의 InterestParams와 동일한 구조.
// 단, Pair에서는 token0 / token1 각각 별도 이자율 모델을 가진다.
// (Factory는 하나의 기본값, 각 Pair는 토큰별로 개별 설정 가능)
type InterestParams = {
	protocolFeeBps: number;         // 이자 수익의 프로토콜 수수료 비율 (bps)
	optimalPointBps: number;        // 이자율 곡선 꺾임점 — 사용률 기준 (bps)
	interestRateBaseBps: number;    // 기본 연이자율 (꺾임점 이하, bps)
	interestRateOptimalBps: number; // 꺾임점에서의 연이자율 (bps)
	interestRateAddBps: number;     // 꺾임점 초과 시 추가 이자율 (bps)
};

// Pair 하나에서 읽어오는 전체 데이터 구조.
// Pair는 UniPool 프로토콜의 핵심 — AMM 스왑 + 대출이 통합된 단일 스마트 컨트랙트.
export type PairData = {
	address: `0x${string}`;  // 이 Pair 컨트랙트 자체의 주소

	// Pair 자체도 ERC-20 토큰(LP 토큰)임.
	// ERC-20: 이더리움 표준 토큰 인터페이스. 이름/심볼/잔액/전송 기능을 가짐.
	// LP 토큰(Liquidity Provider Token): 유동성 공급을 증명하는 영수증 토큰.
	// LP 토큰을 태우면(burn) 공급했던 토큰을 돌려받을 수 있음.
	name: string;     // ERC-20 토큰 이름 (예: "UniPool ETH/USDC LP")
	symbol: string;   // ERC-20 심볼 (예: "ULP")
	decimals: number; // LP 토큰의 소수점 자릿수 (보통 18)
	totalSupply: bigint; // 현재 유통 중인 LP 토큰 총량 (발행량 - 소각량)

	token0: `0x${string}`; // 풀이 보유한 첫 번째 토큰 컨트랙트 주소
	token1: `0x${string}`; // 풀이 보유한 두 번째 토큰 컨트랙트 주소
	factory: `0x${string}`; // 이 Pair를 생성한 Factory 컨트랙트 주소

	reserve0: bigint; // 풀이 현재 실제로 보유한 token0 수량
	reserve1: bigint; // 풀이 현재 실제로 보유한 token1 수량

	virtualReserves: {
		// 매수(In)와 매도(Out)에 별도 가상 보유량 → 비대칭 가격(스프레드) 구현
		// "In": 이 토큰을 풀에 넣을 때 (= 이 토큰으로 상대 토큰을 살 때)
		// "Out": 이 토큰을 풀에서 꺼낼 때 (= 상대 토큰을 팔아 이 토큰을 받을 때)
		virtualReserve0In: bigint;  // token0 매수 기준 가상 reserve
		virtualReserve0Out: bigint; // token0 매도 기준 가상 reserve
		virtualReserve1In: bigint;  // token1 매수 기준 가상 reserve
		virtualReserve1Out: bigint; // token1 매도 기준 가상 reserve
	};

	fees: {
		feeLp: number;   // LP(유동성 공급자) 수수료 비율 (bps)
		feePool: number; // 프로토콜 운영 수수료 비율 (bps)
		burnFee: number; // LP 토큰 소각 수수료 비율 (bps)
	};
	loanFees: {
		// 대출(loan) 실행 시 부과되는 수수료 비율 (bps).
		// Flash loan(플래시 론, 동일 트랜잭션 내 상환 조건 대출)에도 동일 수수료 적용.
		loanFee0: number; // token0 대출 수수료 (bps)
		loanFee1: number; // token1 대출 수수료 (bps)
	};
	feeCollector: `0x${string}`; // 이 Pair의 수수료를 수취하는 주소

	// token0와 token1 각각 별도 이자율 모델 파라미터 (위 InterestParams 설명 참고)
	interestParams: { token0: InterestParams; token1: InterestParams };

	// 현재 시점의 이자 배율 (단위: RAY = 10^27).
	// 대출자가 실제로 갚아야 하는 금액 = 빌린 원금 * (현재 배율 / 빌릴 당시 배율)
	interestMultiplier0: bigint; // token0의 현재 이자 배율
	interestMultiplier1: bigint; // token1의 현재 이자 배율

	// 현재 변동 이자율 (단위: RAY, 연이자율 기준).
	// 실제 % 변환: Number(value) / 1e27 * 100
	// 예) 3 * 10^25 RAY → 3% 연이자율
	variableInterestRate0: bigint; // token0 현재 연이자율 (RAY)
	variableInterestRate1: bigint; // token1 현재 연이자율 (RAY)

	// 마지막 온체인(on-chain) 업데이트 시점의 수익 누산기 값.
	// 현재 interestMultiplier와 비교해 "마지막 업데이트 이후 미반영 이자"를 계산 가능.
	lastYieldAccumulator: { yieldAcc0: bigint; yieldAcc1: bigint };

	totalBorrowed0: bigint; // 현재 대출 중인 token0 총량 (미상환)
	totalBorrowed1: bigint; // 현재 대출 중인 token1 총량 (미상환)

	// 누적된 풀 수수료 — feeCollector로 아직 이전(transfer)되지 않은 미지급 수수료.
	accumulatedPoolFees: { fee0: bigint; fee1: bigint };

	// 마지막으로 이자율/누산기가 업데이트된 유닉스 타임스탬프(Unix timestamp, 초 단위).
	// 유닉스 타임스탬프: 1970년 1월 1일 00:00:00 UTC로부터 경과한 초.
	lastUpdateTimestamp: bigint;

	// 다음 대출 생성 시 부여될 ID.
	// 지금까지 생성된 대출 수 + 1 = 이 풀에서 총 몇 건의 대출이 실행됐는지 확인 가능.
	nextLoanId: bigint;

	borrowLimitBps: number;        // 이 Pair의 담보 대비 최대 대출 비율 (bps)
	liquidationPenaltyBps: number; // 청산 시 패널티 비율 (bps)
	maxBorrowPerTick: number;      // 하나의 틱에서 허용 최대 대출 비율 (bps)
	maxBorrowPerRange: number;     // 범위 전체에서 허용 최대 대출 비율 (bps)
	priceDecay: bigint;            // 가상 가격 → 실제 시장가 수렴 속도
	swapPriceToleranceBps: number; // 스왑 허용 슬리피지 한도 (bps)
	tickBuffer: number;            // 청산 계산 여유 틱 수

	// 풀 생성 시 영구 잠금되는 최소 LP 토큰 수량.
	// "dead shares"라 불리며 0으로 나누는 수학적 오류를 방지하기 위해 도입.
	minimumLiquidity: bigint;

	// interestMultiplier 값의 소수점 자릿수 상수 (= RAY_DECIMALS = 27).
	interestMultiplierDecimals: number;

	// RAY 단위의 소수점 자릿수 상수 (= 27).
	// 10^rayDecimals = 10^27 = 1 RAY
	rayDecimals: number;

	// ERC-20 token0의 심볼 (예: "WETH", "USDC").
	// reserve0, totalBorrowed0 등의 레이블과 단위 표시에 사용.
	// 조회 실패 시 빈 문자열("").
	token0Symbol: string;

	// token0의 소수점 자릿수.
	// 예) WETH=18, USDT=6, cbBTC=8
	// reserve0 등의 bigint 원시값을 사람이 읽기 쉬운 소수로 변환할 때 필요.
	token0Decimals: number;

	// ERC-20 token1의 심볼 (예: "USDT", "cbBTC")
	token1Symbol: string;

	// token1의 소수점 자릿수
	token1Decimals: number;
};

type ChainConfig = (typeof CHAINS)[keyof typeof CHAINS];

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`;
const INTEREST_FALLBACK: InterestParams = {
	protocolFeeBps: 0,
	optimalPointBps: 0,
	interestRateBaseBps: 0,
	interestRateOptimalBps: 0,
	interestRateAddBps: 0
};

// ─── viem multicall 반환 규칙 ────────────────────────────────────────────────
// 솔리디티 함수 반환값 → viem 변환 규칙:
//   반환값 1개   → 값 직접         예) getFeeCollector() → "0x..."
//   반환값 여러개 → 배열            예) getTokens()       → ["0x...", "0x..."]
//   tuple 반환  → 객체(필드명 포함) 예) getVirtualReserves() → { virtualReserve0In: ... }

// 단일 Pair 컨트랙트에서 모든 데이터를 읽어오는 내부 함수.
// client를 외부에서 받는 이유: fetchAllPairs가 하나의 client 인스턴스를 여러 Pair에 재사용.
// (Pair마다 새 client를 만들면 객체 생성 오버헤드 발생)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchOnePair(client: any, pairAddress: `0x${string}`, blockNumber?: bigint): Promise<PairData> {
	const results = await client.multicall({
		allowFailure: true,
		...(blockNumber !== undefined ? { blockNumber } : {}),
		contracts: [
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'name' },                        // [0]  ERC-20 이름
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'symbol' },                      // [1]  ERC-20 심볼
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'decimals' },                    // [2]  소수점 자릿수 (uint8, 보통 18)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'totalSupply' },                 // [3]  LP 토큰 총 발행량
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTokens' },                   // [4]  [token0, token1] 주소 배열
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getFactory' },                  // [5]  Factory 주소
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getReserves' },                 // [6]  [reserve0, reserve1]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getVirtualReserves' },          // [7]  {virtualReserve0In, ...} 객체
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getFeesBps' },                  // [8]  [feeLp, feePool, burnFee]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLoanFeesBps' },              // [9]  [loanFee0, loanFee1]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getFeeCollector' },             // [10] 수수료 수취 주소
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getInterestParamsBps' },        // [11] [token0Params, token1Params] — 배열 of tuple
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getInterestMultiplier0' },      // [12] token0 이자 배율 (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getInterestMultiplier1' },      // [13] token1 이자 배율 (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'calcVariableInterestRate0' },   // [14] token0 현재 변동 이자율 (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'calcVariableInterestRate1' },   // [15] token1 현재 변동 이자율 (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLastYieldAccumulator' },     // [16] [yieldAcc0, yieldAcc1]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTotalBorrowed0' },           // [17] token0 총 미상환 대출량
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTotalBorrowed1' },           // [18] token1 총 미상환 대출량
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getAccumulatedPoolFees' },      // [19] [fee0, fee1] 미지급 수수료
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLastUpdateTimestamp' },      // [20] 유닉스 타임스탬프 (초)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getNextLoanId' },               // [21] 다음 대출 ID
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getBorrowLimitBps' },           // [22]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLiquidationPenaltyBps' },    // [23]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getMaxBorrowPerTickAndRange' }, // [24] [maxTick, maxRange]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getPriceDecay' },               // [25]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getSwapPriceToleranceBps' },    // [26]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTickBuffer' },               // [27]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'MINIMUM_LIQUIDITY' },           // [28] 상수: 최소 LP
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'INTEREST_MULTIPLIER_DECIMALS' }, // [29] 상수: 이자 배율 소수점 자릿수
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'RAY_DECIMALS' }                 // [30] 상수: 27
		]
	});

	// results[i]가 성공이면 result를, 실패면 fallback을 반환하는 헬퍼
	function get<T>(i: number, fallback: T): T {
		const r = results[i];
		return r.status === 'success' ? (r.result as T) : fallback;
	}

	// 배열 반환 함수들 파싱
	const tokens = get<readonly [`0x${string}`, `0x${string}`]>(4, [ZERO, ZERO]);
	const reserves = get<readonly [bigint, bigint]>(6, [0n, 0n]);
	const fees = get<readonly [number, number, number]>(8, [0, 0, 0]);
	const loanFees = get<readonly [number, number]>(9, [0, 0]);

	// [11] getInterestParamsBps → Pair는 token0/token1 각각 tuple → [tuple0, tuple1] 배열 반환.
	//      Factory와 차이: Factory는 tuple 하나, Pair는 tuple 두 개 배열.
	const interest = get<readonly [InterestParams, InterestParams]>(11, [
		INTEREST_FALLBACK,
		INTEREST_FALLBACK
	]);

	const yieldAcc = get<readonly [bigint, bigint]>(16, [0n, 0n]);
	const poolFees = get<readonly [bigint, bigint]>(19, [0n, 0n]);
	const maxBorrow = get<readonly [number, number]>(24, [0, 0]);

	// [7] getVirtualReserves → 솔리디티 named tuple → viem이 필드명이 있는 객체로 변환
	const vReserves = get<{
		virtualReserve0In: bigint;
		virtualReserve0Out: bigint;
		virtualReserve1In: bigint;
		virtualReserve1Out: bigint;
	}>(7, {
		virtualReserve0In: 0n,
		virtualReserve0Out: 0n,
		virtualReserve1In: 0n,
		virtualReserve1Out: 0n
	});

	return {
		address: pairAddress,
		name: get<string>(0, ''),
		symbol: get<string>(1, ''),
		decimals: get<number>(2, 18),
		totalSupply: get<bigint>(3, 0n),
		token0: tokens[0],
		token1: tokens[1],
		factory: get<`0x${string}`>(5, ZERO),
		reserve0: reserves[0],
		reserve1: reserves[1],
		virtualReserves: vReserves,
		fees: { feeLp: fees[0], feePool: fees[1], burnFee: fees[2] },
		loanFees: { loanFee0: loanFees[0], loanFee1: loanFees[1] },
		feeCollector: get<`0x${string}`>(10, ZERO),
		interestParams: { token0: interest[0], token1: interest[1] },
		interestMultiplier0: get<bigint>(12, 0n),
		interestMultiplier1: get<bigint>(13, 0n),
		variableInterestRate0: get<bigint>(14, 0n),
		variableInterestRate1: get<bigint>(15, 0n),
		lastYieldAccumulator: { yieldAcc0: yieldAcc[0], yieldAcc1: yieldAcc[1] },
		totalBorrowed0: get<bigint>(17, 0n),
		totalBorrowed1: get<bigint>(18, 0n),
		accumulatedPoolFees: { fee0: poolFees[0], fee1: poolFees[1] },
		lastUpdateTimestamp: get<bigint>(20, 0n),
		nextLoanId: get<bigint>(21, 0n),
		borrowLimitBps: get<number>(22, 0),
		liquidationPenaltyBps: get<number>(23, 0),
		maxBorrowPerTick: maxBorrow[0],
		maxBorrowPerRange: maxBorrow[1],
		priceDecay: get<bigint>(25, 0n),
		swapPriceToleranceBps: get<number>(26, 0),
		tickBuffer: get<number>(27, 0),
		minimumLiquidity: get<bigint>(28, 0n),
		interestMultiplierDecimals: get<number>(29, 0),
		rayDecimals: get<number>(30, 0),
		// 아래 4개는 fetchAllPairs의 2차 multicall에서 채워진다.
		// fetchOnePair 단독 호출 시에는 빈 값/기본값으로 반환.
		token0Symbol: '',
		token0Decimals: 18,
		token1Symbol: '',
		token1Decimals: 18
	};
}

// Factory에서 모든 Pair 주소를 가져온 뒤, 각 Pair 데이터를 병렬로 읽어오는 함수.
// allPairsLength: fetchFactoryData에서 얻은 data.allPairsLength
export async function fetchAllPairs(
	config: ChainConfig,
	factoryAddress: `0x${string}`,
	allPairsLength: bigint,
	blockNumber?: bigint
): Promise<PairData[]> {
	const client = createPublicClient({
		chain: config.chain,
		transport: http(config.rpc)
	});

	const length = Number(allPairsLength);
	if (length === 0) return [];

	// 1단계: Factory에서 인덱스 0~(length-1)에 해당하는 Pair 주소를 일괄 조회.
	// allowFailure: false → Pair 주소 조회 실패는 치명적 오류 → 에러를 throw.
	const indexResults = await client.multicall({
		allowFailure: false,
		...(blockNumber !== undefined ? { blockNumber } : {}),
		contracts: Array.from({ length }, (_, i) => ({
			address: factoryAddress,
			abi: FACTORY_ABI,
			functionName: 'getPairAtIndex' as const,
			args: [BigInt(i)] as const // 인덱스를 BigInt로 변환 (솔리디티 uint256 파라미터)
		}))
	});

	const pairAddresses = indexResults as `0x${string}`[];

	// 2단계: 각 Pair 주소에서 데이터를 병렬로 읽어옴.
	// Promise.all: 여러 비동기 작업을 동시에 실행 → 가장 느린 하나의 시간만큼 대기.
	// 직렬 실행(순서대로)이면 Pair 수 × 왕복 시간 → 매우 느림.
	const pairs = await Promise.all(pairAddresses.map((addr) => fetchOnePair(client, addr, blockNumber)));

	// 3단계: 모든 Pair에 등장하는 고유 토큰 주소를 모아 심볼/소수점을 일괄 조회.
	// Set으로 중복 제거 → 같은 토큰이 여러 Pair에 등장해도 한 번만 RPC 호출.
	// flatMap: pairs 배열을 펼쳐서 [token0, token1, token0, token1, ...] 형태로 만든 뒤 중복 제거.
	const uniqueTokens = [...new Set(pairs.flatMap((p) => [p.token0, p.token1]))];

	// 토큰마다 2개 함수(symbol, decimals) → uniqueTokens.length × 2개를 1번 RPC 요청으로.
	// i번째 토큰의 인덱스: symbol = i*2, decimals = i*2+1
	const metaResults = await client.multicall({
		allowFailure: true,
		...(blockNumber !== undefined ? { blockNumber } : {}),
		contracts: uniqueTokens.flatMap((token) => [
			{ address: token, abi: ERC20_META_ABI, functionName: 'symbol' as const },   // i*2+0: ERC-20 심볼
			{ address: token, abi: ERC20_META_ABI, functionName: 'decimals' as const }  // i*2+1: 소수점 자릿수
		])
	});

	// 토큰 주소 → { symbol, decimals } 맵(Map).
	// Map은 키-값 쌍을 저장하는 JavaScript 자료구조.
	// tokenMeta.get("0x...") → { symbol: "WETH", decimals: 18 }
	const tokenMeta = new Map<string, { symbol: string; decimals: number }>();
	uniqueTokens.forEach((token, i) => {
		const symResult = metaResults[i * 2];
		const decResult = metaResults[i * 2 + 1];
		tokenMeta.set(token, {
			symbol: symResult.status === 'success' ? (symResult.result as string) : '',
			decimals: decResult.status === 'success' ? (decResult.result as number) : 18
		});
	});

	// 4단계: 각 Pair에 토큰 메타데이터를 주입해 반환.
	// 스프레드 연산자(...p): 기존 Pair 데이터를 복사한 뒤 4개 필드만 덮어씀.
	return pairs.map((p) => ({
		...p,
		token0Symbol: tokenMeta.get(p.token0)?.symbol ?? '',
		token0Decimals: tokenMeta.get(p.token0)?.decimals ?? 18,
		token1Symbol: tokenMeta.get(p.token1)?.symbol ?? '',
		token1Decimals: tokenMeta.get(p.token1)?.decimals ?? 18
	}));
}

// ─── 표시용 유틸리티 함수들 ─────────────────────────────────────────────────

// bps(베이시스 포인트)를 퍼센트 문자열로 변환.
// 예) bpsToPercent(30) → "0.30%",  bpsToPercent(8000) → "80.00%"
export function bpsToPercent(bps: number): string {
	return `${(bps / 100).toFixed(2)}%`;
}

// 유닉스 타임스탬프(초)를 로컬 시간 문자열로 변환.
// 0이면 데이터 없음을 나타내는 "—" 반환.
export function formatTimestamp(ts: bigint): string {
	if (ts === 0n) return '—';
	return new Date(Number(ts) * 1000).toLocaleString();
	// * 1000: JavaScript Date는 밀리초 단위이지만 블록체인 타임스탬프는 초 단위 → 변환 필요.
}

// BigInt 원시값을 소수점이 있는 문자열로 변환.
// 예) formatAmount(1000000n, 6)  → "1.000000"  (USDC 1달러: 6 decimals)
//     formatAmount(1000000000000000000n, 18) → "1.000000000000000000"  (ETH 1개)
export function formatAmount(value: bigint, decimals: number): string {
	return formatUnits(value, decimals);
}
