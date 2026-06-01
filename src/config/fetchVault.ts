// ═══════════════════════════════════════════════════════════════════════════════
// fetchvault.ts — Vault contract data fetching module
//
// ■ What is the Vault?
//   A smart contract that collects "idle funds" from Pair pools —
//   funds not currently needed for lending or swapping —
//   and deposits them into Aave to earn additional yield.
//
//   Flow:
//   [User → provides liquidity to Pair pool]
//     ↓ unused portion
//   [Vault] → [deposited into Aave] → interest accrues
//                                    ↓
//                    distributed to LPs (via Yield Accumulator)
//
// ■ What is Aave?
//   A separate DeFi (decentralised finance) lending protocol.
//   Depositing tokens earns interest.
//   On deposit you receive an "aToken" that automatically accumulates interest.
//   e.g. deposit USDC → receive aUSDC. Over time, the aUSDC ↔ USDC exchange rate rises.
//
// ■ What is isIdle?
//   true  = token is simply held in the Vault (not deposited to Aave, no interest accruing)
//   false = token is deposited into Aave and earning yield ("In Aave")
//
// ■ What is a Yield Accumulator?
//   A cumulative multiplier used to fairly distribute Aave-earned interest to LPs.
//   Conceptually similar to a "compound index" in a bank savings account.
//   - yieldAccumulator: current cumulative multiplier
//   - lastYieldAccumulator: multiplier at the time of the last on-chain update
//   Difference between the two = additional Aave interest accrued since the last update
// ═══════════════════════════════════════════════════════════════════════════════

import { createPublicClient, http } from 'viem';
import type { CHAINS } from './chains';
import { VAULT_ABI } from './vault';

// ─── Types ────────────────────────────────────────────────────────────────────

// Return structure of getAssetData
// Returned from Solidity as a 128-byte struct (4 fields × 32 bytes each).
type AssetData = {
	// Internal interest accumulation tracker inside the Vault.
	// NOTE: scale varies per token — may not be in RAY (10^27) units.
	//   e.g. EV token ≈ 10^27, USDT ≈ 10^10, WETH ≈ 10^18
	// For the externally exposed RAY-normalised value use getYieldAccumulator() (VaultTokenData.yieldAccumulator).
	// This value is used to calculate "additional interest since the last update" by comparing with lastYieldAccumulator.
	yieldAccumulator: bigint;

	// Internal accumulator value at the time of the last on-chain update (same scale as assetData.yieldAccumulator).
	// Difference from the current yieldAccumulator = Aave interest not yet reflected.
	lastYieldAccumulator: bigint;

	// Whether this token is activated in the Vault.
	// If false, Vault operations (deposit/withdraw) are not available for this token.
	isActive: boolean;

	// Whether this token is configured to receive Aave interest.
	// false = Aave interest not supported. Vault can still track/hold the token (operates as isIdle=true).
	// NOTE: does NOT mean "completely unsupported by the Vault" — it just means Aave integration is disabled.
	isSupported: boolean;
};

// Return structure of getAaveTokenSupport
// Describes how this token is integrated with Aave.
// Verified: some Vaults do not use Aave, so all values may be 0/false.
type AaveTokenSupport = {
	// Whether this token is configured for Aave integration.
	// false = this Vault operates without Aave (token is simply held in the Vault).
	isSupported: boolean;

	// Address of the aToken (interest-bearing token) received when depositing this token into Aave.
	// e.g. deposit USDC → aUSDC address is stored here.
	// Zero address (0x000...000) if Aave is not used.
	aToken: `0x${string}`;

	// Amount the Vault currently has deposited in Aave.
	currentBalance: bigint;

	// Target amount the Vault intends to deposit into Aave.
	// targetBalance > currentBalance → deposit still in progress.
	targetBalance: bigint;
};

// All Vault-related data bundled for a single token
export type VaultTokenData = {
	token: `0x${string}`; // Contract address of the queried token

	assetData: AssetData;

	// Result of getAssetStatus: true = Idle (held in Vault, not deposited in Aave), false = deposited in Aave
	isIdle: boolean;

	aaveSupport: AaveTokenSupport;

	// Result of getYieldAccumulator(). Always a RAY (10^27) normalised Yield Accumulator.
	// Initial value is 1 RAY (= 10^27). Increases as interest accumulates.
	// e.g. 1.001 × 10^27 → 0.1% interest accumulated.
	// NOTE: different from assetData.yieldAccumulator — assetData uses per-token internal scale,
	//       this value is RAY-normalised. Use this value for display purposes.
	yieldAccumulator: bigint;
};

// Full Vault state
export type VaultData = {
	address: `0x${string}`;  // Address of the Vault contract itself
	factory: `0x${string}`; // Address of the Factory that owns/manages this Vault
	aavePool: `0x${string}`; // Address of the connected Aave pool. Zero address means Aave is not used.
	// tokens: array holding the Vault state for each token (token0, token1).
	// Matches the order of the token address array collected in fetchAllPairs.
	tokens: VaultTokenData[];
};

type ChainConfig = (typeof CHAINS)[keyof typeof CHAINS];

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`;

// ─── Main function ────────────────────────────────────────────────────────────
// vaultAddress: data.vault obtained from fetchFactoryData
// tokenAddresses: array of token0/token1 addresses collected per Pair in fetchAllPairs (deduped)
// blockNumber: specify for historical block queries (requires archive node); omit for current state
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

	// If blockNumber is provided, spread { blockNumber: ... } into multicall; otherwise spread {}
	const blockOpt = blockNumber !== undefined ? { blockNumber } : {};

	// ── Step 1: Query Vault base info ─────────────────────────────────────────
	// Only fetch the Factory address and Aave pool address, which are token-independent (2 functions)
	const baseResults = await client.multicall({
		allowFailure: true,
		...blockOpt,
		contracts: [
			{ address: vaultAddress, abi: VAULT_ABI, functionName: 'getFactory' },  // [0] Factory address
			{ address: vaultAddress, abi: VAULT_ABI, functionName: 'getAavePool' }  // [1] Aave pool address
		]
	});

	function getBase<T>(i: number, fallback: T): T {
		const r = baseResults[i];
		return r.status === 'success' ? (r.result as T) : fallback;
	}

	// ── Step 2: Per-token functions ───────────────────────────────────────────
	// Call 4 functions per token → batch (number of tokens × 4) into a single multicall
	// e.g. 2 tokens → 8 calls in 1 RPC request
	//
	// contracts array layout (assuming n tokens):
	//   token0: [getAssetData, getAssetStatus, getAaveTokenSupport, getYieldAccumulator]  indices 0~3
	//   token1: [getAssetData, getAssetStatus, getAaveTokenSupport, getYieldAccumulator]  indices 4~7
	//   ...
	// Index formula: function j of token i → i * 4 + j
	const tokenContracts = tokenAddresses.flatMap((token) => [
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getAssetData' as const,
			args: [token] as const
		}, // i*4+0: activation status, yield accumulator, and other base state
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getAssetStatus' as const,
			args: [token] as const
		}, // i*4+1: true = idle (held in Vault), false = deposited in Aave
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getAaveTokenSupport' as const,
			args: [token] as const
		}, // i*4+2: Aave aToken address, deposited balance, etc.
		{
			address: vaultAddress,
			abi: VAULT_ABI,
			functionName: 'getYieldAccumulator' as const,
			args: [token] as const
		} // i*4+3: current Yield Accumulator value (same value as assetData, exposed separately)
	]);

	const tokenResults = await client.multicall({
		allowFailure: true,
		...blockOpt,
		contracts: tokenContracts
	});

	// ── Step 3: Parse results ─────────────────────────────────────────────────
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
		const base = i * 4; // Starting index in the tokenResults array for this token's results

		// Helper to extract the result at a specific offset (base + offset) from tokenResults
		function getToken<T>(offset: number, fallback: T): T {
			const r = tokenResults[base + offset];
			return r.status === 'success' ? (r.result as T) : fallback;
		}

		return {
			token,
			assetData: getToken<AssetData>(0, ASSET_FALLBACK),        // getAssetData result
			isIdle: getToken<boolean>(1, false),                       // getAssetStatus result
			aaveSupport: getToken<AaveTokenSupport>(2, AAVE_FALLBACK), // getAaveTokenSupport result
			yieldAccumulator: getToken<bigint>(3, 0n)                  // getYieldAccumulator result
		};
	});

	return {
		address: vaultAddress,
		factory: getBase<`0x${string}`>(0, ZERO),
		aavePool: getBase<`0x${string}`>(1, ZERO),
		tokens
	};
}
