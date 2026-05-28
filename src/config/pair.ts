// ─── Pair ABI ──────────────────────────────────────────────────────────────────
// 실제 온체인 검증 완료 (Arbitrum Pair: 0xfa896ef9659ea0dcf42c751e2b1f78f626fe8f56)
//
// ── tuple 구조 검증 방법 ────────────────────────────────────────────────────────
// 반환 바이트 수로 필드 개수를 역산함: 바이트 ÷ 32 = 필드 수
// 예) 320바이트 ÷ 32 = 10필드 → 5필드짜리 tuple 두 개 (token0 + token1)
//     128바이트 ÷ 32 = 4필드 → 4필드짜리 tuple 하나
//
// ── Factory ABI와 다른 점 ────────────────────────────────────────────────────
// getInterestParamsBps: Factory = 160바이트(tuple 1개), Pair = 320바이트(tuple 2개)
// getFeesBps: 둘 다 96바이트(3개) — 동일
// getLoanFeesBps: Pair에만 있음 (64바이트, 2개)

export const PAIR_ABI = [
	// ─── 식별 ────────────────────────────────────────────────────────────────────
	// 64바이트 = 32×2 → address 두 개
	{
		type: 'function',
		name: 'getTokens',
		inputs: [],
		outputs: [
			{ name: 'token0_', type: 'address' },
			{ name: 'token1_', type: 'address' }
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 = address 하나
		type: 'function',
		name: 'getFactory',
		inputs: [],
		outputs: [{ name: 'factory_', type: 'address' }],
		stateMutability: 'view'
	},

	// ─── 유동성 ──────────────────────────────────────────────────────────────────
	// 64바이트 = 32×2 → uint256 두 개
	{
		type: 'function',
		name: 'getReserves',
		inputs: [],
		outputs: [
			{ name: 'reserve0_', type: 'uint256' },
			{ name: 'reserve1_', type: 'uint256' }
		],
		stateMutability: 'view'
	},
	{
		// 128바이트 = 32×4 → tuple 하나, 4개 필드
		// ┌─ 검증: 128 ÷ 32 = 4 ✅
		// virtualReserve0In / 0Out / 1In / 1Out
		type: 'function',
		name: 'getVirtualReserves',
		inputs: [],
		outputs: [
			{
				name: 'reserves_',
				type: 'tuple',
				components: [
					{ name: 'virtualReserve0In', type: 'uint128' },
					{ name: 'virtualReserve0Out', type: 'uint128' },
					{ name: 'virtualReserve1In', type: 'uint128' },
					{ name: 'virtualReserve1Out', type: 'uint128' }
				]
			}
		],
		stateMutability: 'view'
	},

	// ─── 수수료 ──────────────────────────────────────────────────────────────────
	// 96바이트 = 32×3 → uint16 세 개 (Factory와 동일 구조)
	{
		type: 'function',
		name: 'getFeesBps',
		inputs: [],
		outputs: [
			{ name: 'feeLpBps_', type: 'uint16' },
			{ name: 'feePoolBps_', type: 'uint16' },
			{ name: 'burnFeeBps_', type: 'uint16' }
		],
		stateMutability: 'view'
	},
	{
		// 64바이트 = 32×2 → uint16 두 개
		// Pair에만 있음 — token0, token1 각각 loanFee
		type: 'function',
		name: 'getLoanFeesBps',
		inputs: [],
		outputs: [
			{ name: 'loanFee0_', type: 'uint16' },
			{ name: 'loanFee1_', type: 'uint16' }
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 = address 하나
		type: 'function',
		name: 'getFeeCollector',
		inputs: [],
		outputs: [{ name: 'feeCollector_', type: 'address' }],
		stateMutability: 'view'
	},

	// ─── 이자율 모델 ─────────────────────────────────────────────────────────────
	{
		// 320바이트 = 32×10 = 5필드 × 2개 tuple (token0 + token1)
		// ┌─ 검증: 320 ÷ 32 = 10 = 5×2 ✅
		// ┌─ Factory와 차이: Factory는 160바이트(tuple 1개), Pair는 320바이트(tuple 2개)
		// 필드 구조 (token0, token1 동일):
		//   protocolFeeBps      uint16  → 프로토콜 수수료 비율
		//   optimalPointBps     uint16  → 최적 이용률 지점
		//   interestRateBaseBps uint32  → 기본 이자율 (uint32라서 큰 값 가능)
		//   interestRateOptimalBps uint32 → 최적점에서의 이자율
		//   interestRateAddBps  uint32  → 최적점 초과 시 추가 이자율
		type: 'function',
		name: 'getInterestParamsBps',
		inputs: [],
		outputs: [
			{
				name: 'paramsToken0_',
				type: 'tuple',
				components: [
					{ name: 'protocolFeeBps', type: 'uint16' },
					{ name: 'optimalPointBps', type: 'uint16' },
					{ name: 'interestRateBaseBps', type: 'uint32' },
					{ name: 'interestRateOptimalBps', type: 'uint32' },
					{ name: 'interestRateAddBps', type: 'uint32' }
				]
			},
			{
				name: 'paramsToken1_',
				type: 'tuple',
				components: [
					{ name: 'protocolFeeBps', type: 'uint16' },
					{ name: 'optimalPointBps', type: 'uint16' },
					{ name: 'interestRateBaseBps', type: 'uint32' },
					{ name: 'interestRateOptimalBps', type: 'uint32' },
					{ name: 'interestRateAddBps', type: 'uint32' }
				]
			}
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 → uint256 하나
		// INTEREST_MULTIPLIER_DECIMALS()로 나눠서 실제 배율 계산
		type: 'function',
		name: 'getInterestMultiplier0',
		inputs: [],
		outputs: [{ name: 'multiplier_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getInterestMultiplier1',
		inputs: [],
		outputs: [{ name: 'multiplier_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		// 32바이트 → uint256 하나
		// RAY 단위 (소수점 27자리) → RAY_DECIMALS()로 나눠서 % 표시
		type: 'function',
		name: 'calcVariableInterestRate0',
		inputs: [],
		outputs: [{ name: 'rate_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'calcVariableInterestRate1',
		inputs: [],
		outputs: [{ name: 'rate_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		// 64바이트 = 32×2 → uint256 두 개 (yieldAcc0, yieldAcc1)
		type: 'function',
		name: 'getLastYieldAccumulator',
		inputs: [],
		outputs: [
			{ name: 'yieldAcc0_', type: 'uint256' },
			{ name: 'yieldAcc1_', type: 'uint256' }
		],
		stateMutability: 'view'
	},

	// ─── 대출 현황 ────────────────────────────────────────────────────────────────
	// 32바이트 → uint256 하나
	{
		type: 'function',
		name: 'getTotalBorrowed0',
		inputs: [],
		outputs: [{ name: 'borrowed_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getTotalBorrowed1',
		inputs: [],
		outputs: [{ name: 'borrowed_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		// 64바이트 = 32×2 → uint256 두 개
		type: 'function',
		name: 'getAccumulatedPoolFees',
		inputs: [],
		outputs: [
			{ name: 'feePoolToken0_', type: 'uint256' },
			{ name: 'feePoolToken1_', type: 'uint256' }
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 → uint256 (Unix timestamp)
		// 표시 시: new Date(Number(value) * 1000).toLocaleString()
		type: 'function',
		name: 'getLastUpdateTimestamp',
		inputs: [],
		outputs: [{ name: 'timestamp_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		// 32바이트 → uint256
		type: 'function',
		name: 'getNextLoanId',
		inputs: [],
		outputs: [{ name: 'id_', type: 'uint256' }],
		stateMutability: 'view'
	},

	// ─── 공통 파라미터 getter (Pair 개별값) ──────────────────────────────────────
	// Factory와 동일한 ABI — Pair 주소로 호출하면 해당 Pair의 개별값 반환
	{
		// 32바이트 → uint16
		type: 'function',
		name: 'getBorrowLimitBps',
		inputs: [],
		outputs: [{ name: 'borrowLimitBps_', type: 'uint16' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getLiquidationPenaltyBps',
		inputs: [],
		outputs: [{ name: 'liquidationPenaltyBps_', type: 'uint16' }],
		stateMutability: 'view'
	},
	{
		// 64바이트 = 32×2 → uint32 두 개
		type: 'function',
		name: 'getMaxBorrowPerTickAndRange',
		inputs: [],
		outputs: [
			{ name: 'maxBorrowPerTickBps_', type: 'uint32' },
			{ name: 'maxBorrowPerTickRangeBps_', type: 'uint32' }
		],
		stateMutability: 'view'
	},
	{
		// 32바이트 → uint128 (bigint)
		type: 'function',
		name: 'getPriceDecay',
		inputs: [],
		outputs: [{ name: 'priceDecay_', type: 'uint128' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getSwapPriceToleranceBps',
		inputs: [],
		outputs: [{ name: 'toleranceBps_', type: 'uint16' }],
		stateMutability: 'view'
	},
	{
		// 32바이트 → int16 (signed — 음수 가능)
		type: 'function',
		name: 'getTickBuffer',
		inputs: [],
		outputs: [{ name: 'tickBuffer_', type: 'int16' }],
		stateMutability: 'view'
	},

	// ─── ERC20 (LP 토큰) ──────────────────────────────────────────────────────────
	// name(), symbol(): 96바이트 → string (ABI 인코딩: offset 32 + length 32 + data 32)
	// decimals(), totalSupply(): 32바이트 → 단순 값
	{
		type: 'function',
		name: 'name',
		inputs: [],
		outputs: [{ name: 'name_', type: 'string' }],
		stateMutability: 'pure'
	},
	{
		type: 'function',
		name: 'symbol',
		inputs: [],
		outputs: [{ name: 'symbol_', type: 'string' }],
		stateMutability: 'pure'
	},
	{
		type: 'function',
		name: 'decimals',
		inputs: [],
		outputs: [{ name: '', type: 'uint8' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'totalSupply',
		inputs: [],
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view'
	},

	// ─── 상수 (pure — 체인 읽기 없음, 항상 고정값) ───────────────────────────────
	// 32바이트씩
	{
		type: 'function',
		name: 'MINIMUM_LIQUIDITY',
		inputs: [],
		outputs: [{ name: 'liq_', type: 'uint256' }],
		stateMutability: 'pure'
	},
	{
		// getInterestMultiplier0/1() 결과를 해석할 때 이 값으로 나눔
		type: 'function',
		name: 'INTEREST_MULTIPLIER_DECIMALS',
		inputs: [],
		outputs: [{ name: 'decimals_', type: 'uint8' }],
		stateMutability: 'pure'
	},
	{
		// calcVariableInterestRate0/1() 결과를 해석할 때 이 값으로 나눔 (보통 27)
		type: 'function',
		name: 'RAY_DECIMALS',
		inputs: [],
		outputs: [{ name: 'decimals_', type: 'uint8' }],
		stateMutability: 'pure'
	}
] as const;
