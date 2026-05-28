export const FACTORY_ABI = [
	{
		type: 'function',
		name: 'getAllPairsLength',
		inputs: [],
		outputs: [{ name: 'length_', type: 'uint256' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getPairAtIndex',
		inputs: [{ name: 'index', type: 'uint256' }],
		outputs: [{ name: 'pair_', type: 'address' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getVault',
		inputs: [],
		outputs: [{ name: 'vault_', type: 'address' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getAavePool',
		inputs: [],
		outputs: [{ name: 'aavePool_', type: 'address' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getBeaconAddress',
		inputs: [],
		outputs: [{ name: 'beacon_', type: 'address' }],
		stateMutability: 'view'
	},
	{
		type: 'function',
		name: 'getFeeCollector',
		inputs: [],
		outputs: [{ name: 'feeCollector_', type: 'address' }],
		stateMutability: 'view'
	},
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
		// 실제 확인 결과: tuple 하나만 반환 (160바이트 = 5개 필드 × 32바이트)
		// Pair ABI의 token0/token1 두 개와 달리 Factory는 단일 tuple
		// 필드값 예시: [1500, 9000, 0, 1500, 18500]
		type: 'function',
		name: 'getInterestParamsBps',
		inputs: [],
		outputs: [
			{
				name: 'params_',
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
		type: 'function',
		name: 'getTickBuffer',
		inputs: [],
		outputs: [{ name: 'tickBuffer_', type: 'int16' }],
		stateMutability: 'view'
	}
] as const;
