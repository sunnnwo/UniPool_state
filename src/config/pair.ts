// ─── Pair ABI ──────────────────────────────────────────────────────────────────
// On-chain verification complete (Arbitrum Pair: 0xfa896ef9659ea0dcf42c751e2b1f78f626fe8f56)
//
// ── How to verify tuple structure ────────────────────────────────────────────
// Back-calculate field count from returned byte size: bytes ÷ 32 = field count
// e.g. 320 bytes ÷ 32 = 10 fields → two 5-field tuples (token0 + token1)
//      128 bytes ÷ 32 = 4 fields  → one 4-field tuple
//
// ── Differences from Factory ABI ─────────────────────────────────────────────
// getInterestParamsBps: Factory = 160 bytes (1 tuple), Pair = 320 bytes (2 tuples)
// getFeesBps: both 96 bytes (3 fields) — identical
// getLoanFeesBps: Pair only (64 bytes, 2 fields)

export const PAIR_ABI = [
	// ─── Identification ─────────────────────────────────────────────────────────
	// 64 bytes = 32×2 → two addresses
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
		// 32 bytes = one address
		type: 'function',
		name: 'getFactory',
		inputs: [],
		outputs: [{ name: 'factory_', type: 'address' }],
		stateMutability: 'view'
	},

	// ─── Liquidity ───────────────────────────────────────────────────────────────
	// 64 bytes = 32×2 → two uint256
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
		// 128 bytes = 32×4 → one tuple, 4 fields
		// ┌─ Verified: 128 ÷ 32 = 4 ✅
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

	// ─── Fees ────────────────────────────────────────────────────────────────────
	// 96 bytes = 32×3 → three uint16 (same structure as Factory)
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
		// 64 bytes = 32×2 → two uint16
		// Pair only — loanFee for token0 and token1 respectively
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
		// 32 bytes = one address
		type: 'function',
		name: 'getFeeCollector',
		inputs: [],
		outputs: [{ name: 'feeCollector_', type: 'address' }],
		stateMutability: 'view'
	},

	// ─── Interest Rate Model ──────────────────────────────────────────────────────
	{
		// 320 bytes = 32×10 = 5 fields × 2 tuples (token0 + token1)
		// ┌─ Verified: 320 ÷ 32 = 10 = 5×2 ✅
		// ┌─ Differs from Factory: Factory = 160 bytes (1 tuple), Pair = 320 bytes (2 tuples)
		// Field layout (same for token0 and token1):
		//   protocolFeeBps         uint16  → protocol fee ratio
		//   optimalPointBps        uint16  → optimal utilization point
		//   interestRateBaseBps    uint32  → base interest rate (uint32 allows large values)
		//   interestRateOptimalBps uint32  → interest rate at optimal utilization
		//   interestRateAddBps     uint32  → additional rate above optimal utilization
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
		// 32 bytes → one uint256
		// Divide by INTEREST_MULTIPLIER_DECIMALS() to get the actual multiplier
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
		// 32 bytes → one uint256
		// RAY unit (27 decimal places) → divide by RAY_DECIMALS() for % display
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
		// 64 bytes = 32×2 → two uint256 (yieldAcc0, yieldAcc1)
		type: 'function',
		name: 'getLastYieldAccumulator',
		inputs: [],
		outputs: [
			{ name: 'yieldAcc0_', type: 'uint256' },
			{ name: 'yieldAcc1_', type: 'uint256' }
		],
		stateMutability: 'view'
	},

	// ─── Borrow State ────────────────────────────────────────────────────────────
	// 32 bytes → one uint256
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
		// 64 bytes = 32×2 → two uint256
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
		// 32 bytes → uint256 (Unix timestamp)
		// Display: new Date(Number(value) * 1000).toLocaleString()
		type: 'function',
		name: 'getLastUpdateTimestamp',
		inputs: [],
		outputs: [{ name: 'timestamp_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		// 32 bytes → uint256
		type: 'function',
		name: 'getNextLoanId',
		inputs: [],
		outputs: [{ name: 'id_', type: 'uint256' }],
		stateMutability: 'view'
	},

	// ─── Common parameter getters (per-Pair values) ──────────────────────────────
	// Same ABI as Factory — calling with a Pair address returns that Pair's individual value
	{
		// 32 bytes → uint16
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
		// 64 bytes = 32×2 → two uint32
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
		// 32 bytes → uint128 (bigint)
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
		// 32 bytes → int16 (signed — can be negative)
		type: 'function',
		name: 'getTickBuffer',
		inputs: [],
		outputs: [{ name: 'tickBuffer_', type: 'int16' }],
		stateMutability: 'view'
	},

	// ─── ERC20 (LP Token) ────────────────────────────────────────────────────────
	// name(), symbol(): 96 bytes → string (ABI encoding: offset 32 + length 32 + data 32)
	// decimals(), totalSupply(): 32 bytes → simple value
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

	// ─── Constants (pure — no chain reads, always fixed) ─────────────────────────
	// 32 bytes each
	{
		type: 'function',
		name: 'MINIMUM_LIQUIDITY',
		inputs: [],
		outputs: [{ name: 'liq_', type: 'uint256' }],
		stateMutability: 'pure'
	},
	{
		// Divide getInterestMultiplier0/1() result by this value to interpret it
		type: 'function',
		name: 'INTEREST_MULTIPLIER_DECIMALS',
		inputs: [],
		outputs: [{ name: 'decimals_', type: 'uint8' }],
		stateMutability: 'pure'
	},
	{
		// Divide calcVariableInterestRate0/1() result by this value to interpret it (typically 27)
		type: 'function',
		name: 'RAY_DECIMALS',
		inputs: [],
		outputs: [{ name: 'decimals_', type: 'uint8' }],
		stateMutability: 'pure'
	}
] as const;
