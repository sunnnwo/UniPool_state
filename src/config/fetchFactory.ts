// ═══════════════════════════════════════════════════════════════════════════════
// fetchFactory.ts — Factory smart contract data fetching module
//
// ■ What is a Smart Contract?
//   A program deployed on a blockchain. Identified by an address starting with 0x.
//   Once deployed, the code cannot be changed. You read or write data by "calling" its functions.
//
// ■ What is RPC (Remote Procedure Call)?
//   A way to send function call requests to a blockchain node (server).
//   e.g. "What does getFeeCollector() return for the contract at this address?"
//
// ■ What is Multicall?
//   An optimisation technique that batches multiple function calls into a single HTTP request.
//   Calling 13 functions individually = 13 round-trips → Multicall = 1 round-trip.
//
// ■ What is blockNumber?
//   The blockchain produces a new "block" roughly every 2–12 seconds and assigns it a number.
//   Specifying a blockNumber lets you query the historical state at that point in time.
//   - Omitted → current latest state
//   - Specified → state at that block (requires an archive node)
//
// ■ What is an Archive Node?
//   A special node that stores the complete state of every past block.
//   A standard node only keeps ~128 recent blocks → cannot query old blocks.
//   The "date comparison" feature in this app requires an archive node.
// ═══════════════════════════════════════════════════════════════════════════════

import { createPublicClient, http } from 'viem';
// viem: TypeScript library for communicating with Ethereum/EVM chains.
// createPublicClient: read-only client (data queries only, no signing).
// http: transport that connects to an RPC node over HTTPS.

import type { CHAINS } from './chains';
import { FACTORY_ABI } from './factory';
// What is an ABI (Application Binary Interface)?
// A specification describing what functions a contract has, what parameters they accept, and what they return.
// viem uses the ABI to automatically infer types and handle encoding/decoding during function calls.

// ─── What are BPS (Basis Points)? ────────────────────────────────────────────
// A unit used in finance to express small ratios as integers.
//   1 bps = 0.01% = 1 / 10,000
//   e.g. 30 bps = 0.30%,  300 bps = 3.00%,  10000 bps = 100%
// Widely used in blockchain to avoid floating-point errors (0.1 + 0.2 ≠ 0.3 problem).

// ─── Interest Rate Model (Kinked IRM) ────────────────────────────────────────
// How lending protocols (Aave, Compound, etc.) determine the interest rate.
// The rate varies with "utilization" = borrowed amount / total deposited.
//
//  Rate (%)
//   │                              ╱  (above optimal: utilization too high → rate spikes)
//   │                         ╱
//   interestRateOptimal  ───●  ← Optimal Point (kink)
//   │                  ╱
//   interestRateBase  ╱
//   └──────────────────┬───────── Utilization (0% ~ 100%)
//                 optimalPoint
//
// Below the kink (e.g. 80%): interest rate rises gradually.
// Above the kink: rises sharply → discourages excessive borrowing.

type InterestParams = {
	// Share of interest revenue taken by the protocol (team), in bps.
	// e.g. 1000 bps = 10% → if interest earned is 100, the protocol takes 10.
	protocolFeeBps: number;

	// The "kink point" of the interest rate curve — above this utilization the rate spikes (bps).
	// e.g. 8000 bps = 80% → borrowing more than 80% of the pool causes the rate to spike.
	optimalPointBps: number;

	// Annual base interest rate at 0% utilization (bps).
	interestRateBaseBps: number;

	// Target annual interest rate when utilization is exactly at optimalPoint (bps).
	interestRateOptimalBps: number;

	// Additional rate applied when utilization exceeds optimalPoint (bps).
	// A higher value penalises excess borrowing more aggressively.
	interestRateAddBps: number;
};

// Full config data structure read from the Factory contract.
// The Factory acts as the "default settings store" for all Pair pools.
export type FactoryData = {
	// Wallet or contract address that receives accumulated protocol fees.
	feeCollector: `0x${string}`;

	// Beacon contract address for the Beacon Proxy pattern.
	// Beacon Proxy: even with hundreds of Pair pools, there is only one implementation contract.
	// Updating the Beacon address upgrades all Pair pools simultaneously.
	// (No need to upgrade each Pair individually → saves gas)
	beaconAddress: `0x${string}`;

	// Vault contract address that deposits idle (unused) funds into Aave to earn yield.
	// Aave: a separate DeFi lending protocol. Depositing tokens earns interest.
	vault: `0x${string}`;

	// Aave lending pool contract address.
	aavePool: `0x${string}`;

	// Total number of Pair (liquidity pool) contracts deployed by this Factory so far.
	// bigint because Solidity uint256 → JS number is only safe up to 2^53 → use bigint.
	allPairsLength: bigint;

	fees: {
		// Swap fee paid to LPs (Liquidity Providers), in bps.
		feeLp: number;
		// Portion of the swap fee sent to feeCollector for protocol operations, in bps.
		feePool: number;
		// Swap fee that burns (destroys) a portion of LP tokens, in bps.
		// Burning reduces total token supply → increases value of remaining tokens.
		burnFee: number;
	};

	// Interest rate model parameters (see InterestParams above).
	// Factory values are applied as defaults when creating each Pair. Pairs can override individually.
	interestParams: InterestParams;

	// Maximum loan-to-value ratio (LTV).
	// e.g. 8000 bps = 80% → with $100 of collateral, you can borrow at most $80.
	borrowLimitBps: number;

	// Additional penalty ratio applied on liquidation, in bps.
	// Liquidation: when collateral value falls below the borrowed amount, the position is forcibly closed.
	// e.g. 500 bps = 5% → an extra 5% is deducted from collateral at liquidation.
	liquidationPenaltyBps: number;

	// Maximum borrow ratio allowed within a single tick range, in bps.
	// Tick: a discrete price-range unit (Uniswap v3 style).
	// Acts as a cap to prevent borrow concentration at a specific price level.
	maxBorrowPerTick: number;

	// Maximum borrow ratio allowed across an entire range of consecutive ticks, in bps.
	maxBorrowPerRange: number;

	// Speed at which the virtual price converges toward the real market price.
	// Virtual Price: the asymmetric price base used for buy vs. sell directions.
	// Without trades, the virtual price approaches the market price at this rate over time.
	priceDecay: bigint;

	// Maximum allowed price slippage during a swap, in bps.
	// Slippage: the difference between the expected execution price and the actual execution price.
	// If the slippage exceeds this limit, the transaction reverts automatically.
	swapPriceToleranceBps: number;

	// Extra ticks added as a buffer during liquidation calculations.
	// Acts as a safety margin so positions are not immediately liquidated on sudden price swings.
	tickBuffer: number;
};

type ChainConfig = (typeof CHAINS)[keyof typeof CHAINS];

// Reads all Factory contract settings in a single RPC request (Multicall).
// config: which chain to use (includes rpc URL + Factory contract address)
// blockNumber: specify to query a historical block; omit for the current state
export async function fetchFactoryData(config: ChainConfig, blockNumber?: bigint): Promise<FactoryData> {
	const client = createPublicClient({
		chain: config.chain,        // chain info (Arbitrum / Base / BSC)
		transport: http(config.rpc) // RPC endpoint URL (Alchemy, Infura, etc.)
	});

	const results = await client.multicall({
		allowFailure: true, // if some calls fail, still return the rest. Failed calls → { status: 'failure' }.
		...(blockNumber !== undefined ? { blockNumber } : {}),
		// if blockNumber is given, spread { blockNumber: ... }; otherwise spread empty object.
		// spreading an empty object adds nothing → queries the latest block.
		contracts: [
			// each item = spec for which function to call on which contract
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getFeeCollector' },          // [0]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getBeaconAddress' },          // [1]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getVault' },                  // [2]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getAavePool' },               // [3]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getAllPairsLength' },         // [4]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getFeesBps' },               // [5] → returns: [feeLp, feePool, burnFee]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getInterestParamsBps' },     // [6] → returns: single tuple object
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getBorrowLimitBps' },        // [7]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getLiquidationPenaltyBps' }, // [8]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getMaxBorrowPerTickAndRange' }, // [9] → returns: [maxTick, maxRange]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getPriceDecay' },            // [10]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getSwapPriceToleranceBps' }, // [11]
			{ address: config.factory, abi: FACTORY_ABI, functionName: 'getTickBuffer' }             // [12]
		]
	});

	// Helper function for parsing results.
	// i: index in the contracts array
	// fallback: default value returned on call failure
	// T: TypeScript generic — return type is specified at call site
	function get<T>(i: number, fallback: T): T {
		const r = results[i];
		return r.status === 'success' ? (r.result as T) : fallback;
	}

	// [5] getFeesBps → Solidity returns (uint16 feeLp, uint16 feePool, uint16 burnFee).
	//     viem multicall returns multiple values as an array: [feeLp, feePool, burnFee]
	const fees = get<readonly [number, number, number]>(5, [0, 0, 0]);

	// [6] getInterestParamsBps → Factory returns a single tuple → viem converts to an object.
	//     (Unlike Pair, Factory has one parameter set — no token0/token1 distinction)
	const INTEREST_FALLBACK: InterestParams = {
		protocolFeeBps: 0,
		optimalPointBps: 0,
		interestRateBaseBps: 0,
		interestRateOptimalBps: 0,
		interestRateAddBps: 0
	};
	const interest = get<InterestParams>(6, INTEREST_FALLBACK);

	// [9] getMaxBorrowPerTickAndRange → returns array [maxPerTick, maxPerRange]
	const maxBorrow = get<readonly [number, number]>(9, [0, 0]);

	// ZERO address: a non-existent address used to indicate an unset or unsupported contract.
	const ZERO = '0x0000000000000000000000000000000000000000' as const;

	return {
		feeCollector: get<`0x${string}`>(0, ZERO),
		beaconAddress: get<`0x${string}`>(1, ZERO),
		vault: get<`0x${string}`>(2, ZERO),
		aavePool: get<`0x${string}`>(3, ZERO),
		allPairsLength: get<bigint>(4, 0n), // 0n: BigInt literal (different type from the number 0)
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

// Display utility: converts bps (basis points) to a percentage string.
// e.g. bpsToPercent(30) → "0.30%",  bpsToPercent(8000) → "80.00%"
export function bpsToPercent(bps: number): string {
	return `${(bps / 100).toFixed(2)}%`;
}
