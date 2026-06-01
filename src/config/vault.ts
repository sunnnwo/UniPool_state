// ─── Vault ABI ────────────────────────────────────────────────────────────────
// On-chain verification complete (Arbitrum Vault: 0xabD8DC06559634e59F6698c33A5E65e90e917b91)
//
// ── Tuple verification ────────────────────────────────────────────────────────
// getAssetData:       128 bytes = 32×4 → one tuple, 4 fields
//   [0] yieldAccumulator     (uint256) — current cumulative yield multiplier
//   [1] lastYieldAccumulator (uint256) — previous cumulative yield multiplier
//   [2] 1 (bool)             — isActive: whether this asset is active
//   [3] 1 (bool)             — isSupported: whether this asset is supported
//
// getAaveTokenSupport: 128 bytes = 32×4 → one tuple, 4 fields
//   Verified: both WETH and USDT are all 0 → this Vault does not use Aave
//   Fields are defined per ABI spec but not actively used

export const VAULT_ABI = [
	// ─── No-argument functions ───────────────────────────────────────────────────
	{
		// 32 bytes → address
		type: 'function',
		name: 'getFactory',
		inputs: [],
		outputs: [{ name: 'factory_', type: 'address' }],
		stateMutability: 'view'
	},
	{
		// 32 bytes → address
		type: 'function',
		name: 'getAavePool',
		inputs: [],
		outputs: [{ name: 'aavePool_', type: 'address' }],
		stateMutability: 'view'
	},

	// ─── Functions that accept a token address argument ──────────────────────────
	// All 4 below take a Pair's token0 or token1 address as the argument
	{
		// 128 bytes = 32×4 → one tuple (4 fields)
		// ┌─ Verified: WETH → [5867..., 5862..., 1, 1] / USDT → [73754..., 73648..., 1, 1]
		// yieldAccumulator:     current cumulative yield multiplier (not RAY-normalised, raw scale)
		// lastYieldAccumulator: accumulator at last on-chain update → diff gives period yield
		// isActive:   whether this asset is currently active (bool)
		// isSupported: whether this asset is supported by this Vault (bool)
		type: 'function',
		name: 'getAssetData',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [
			{
				name: 'data_',
				type: 'tuple',
				components: [
					{ name: 'yieldAccumulator', type: 'uint256' },
					{ name: 'lastYieldAccumulator', type: 'uint256' },
					{ name: 'isActive', type: 'bool' },
					{ name: 'isSupported', type: 'bool' }
				]
			}
		],
		stateMutability: 'view'
	},
	{
		// 32 bytes → bool
		// true: this asset is currently idle — held in the Vault, not deposited into Aave
		// false: deposited into Aave and earning yield
		type: 'function',
		name: 'getAssetStatus',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [{ name: 'isIdle_', type: 'bool' }],
		stateMutability: 'view'
	},
	{
		// 128 bytes = 32×4 → one tuple (4 fields)
		// ┌─ Verified: both WETH and USDT are all 0 → this Vault does not use Aave
		// isSupported:    whether this token is supported by Aave
		// aToken:         aToken address corresponding to this token in Aave (interest-bearing token received on deposit)
		// currentBalance: current balance deposited in Aave
		// targetBalance:  target deposit balance in Aave
		type: 'function',
		name: 'getAaveTokenSupport',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [
			{
				name: 'support_',
				type: 'tuple',
				components: [
					{ name: 'isSupported', type: 'bool' },
					{ name: 'aToken', type: 'address' },
					{ name: 'currentBalance', type: 'uint256' },
					{ name: 'targetBalance', type: 'uint256' }
				]
			}
		],
		stateMutability: 'view'
	},
	{
		// 32 bytes → uint256
		// Cumulative yield value for this token — same as getAssetData's yieldAccumulator
		// Exposed as a separate function in the contract spec, so defined separately here
		type: 'function',
		name: 'getYieldAccumulator',
		inputs: [{ name: 'asset', type: 'address' }],
		outputs: [{ name: 'accumulator_', type: 'uint256' }],
		stateMutability: 'view'
	}
] as const;
