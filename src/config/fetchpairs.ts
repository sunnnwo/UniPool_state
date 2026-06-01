// ═══════════════════════════════════════════════════════════════════════════════
// fetchpairs.ts — Pair (liquidity pool) contract data fetching module
//
// ■ What is an AMM (Automated Market Maker)?
//   A trading mechanism that determines prices algorithmically without an order book.
//   Uniswap is the canonical example. Prices are determined by "Reserve" balances.
//   e.g. pool holds 10 ETH and 20,000 USDC → ETH price = 2,000 USDC
//        if someone buys ETH, ETH decreases and USDC increases → ETH price rises (slippage)
//
// ■ What is a Reserve?
//   The actual token quantity held by the pool.
//   In the x * y = k formula (Uniswap v2), x and y are the reserves.
//   Reserves increase when users deposit tokens, and decrease when they withdraw.
//
// ■ What is a Virtual Reserve?
//   A UniPool-specific feature. A "virtual" quantity used only for price calculation, separate from actual reserves.
//   In (buy) and Out (sell) are managed separately to create an asymmetric price (spread).
//   e.g. vReserve0In < vReserve0Out → token0 buy price > sell price → spread exists
//   → Price Decay causes the virtual price to converge to the real price over time.
//
// ■ What is a Tick?
//   A discrete price-range unit (Uniswap v3 style).
//   e.g. Tick 0 = price 1.0000, Tick 1 = price 1.0001, Tick -1 = price 0.9999...
//   Used to concentrate liquidity within specific price ranges.
//
// ■ What is RAY = 10^27?
//   Solidity has no floating-point, so ratios must be stored as integers.
//   1 RAY = 10^27 = the reference value representing 100%.
//   e.g. interest rate 5% = 0.05 = 5 * 10^25 (in RAY units)
//   Convert to percent in JavaScript: Number(value) / 1e27 * 100
//
// ■ What is a Yield Accumulator?
//   A value that stores the cumulative interest multiplier (in RAY units).
//   Starts at 1 RAY (= 1.0) and increases as interest accrues.
//   e.g. 1.05 * 10^27 → 5% interest has accumulated.
//   Current value of 1 LP token = initial value * (current accumulator / accumulator at deposit)
// ═══════════════════════════════════════════════════════════════════════════════

import { createPublicClient, http, formatUnits } from 'viem';
// formatUnits: viem utility that converts a raw BigInt value to a human-readable decimal string.
// e.g. formatUnits(1000000n, 6) → "1.000000"  (1 USDC: 6 decimals)
//      formatUnits(1000000000000000000n, 18) → "1.000000000000000000"  (1 ETH: 18 decimals)

import type { CHAINS } from './chains';
import { PAIR_ABI } from './pair';
import { FACTORY_ABI } from './factory';

// Minimal ERC-20 ABI needed only for token symbol/decimals lookups.
// Defines only the 2 required functions instead of the full ERC-20 ABI to reduce bundle size.
const ERC20_META_ABI = [
	{ name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' as const },
	{ name: 'decimals', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' as const }
] as const;

// ─── Interest rate parameters ─────────────────────────────────────────────────
// Same structure as InterestParams in fetchFactory.ts.
// However, in a Pair each of token0 and token1 has its own independent interest rate model.
// (Factory stores one set of defaults; each Pair can override per-token)
type InterestParams = {
	protocolFeeBps: number;         // protocol fee share of interest revenue (bps)
	optimalPointBps: number;        // interest rate curve kink point — utilization based (bps)
	interestRateBaseBps: number;    // base annual rate below the kink (bps)
	interestRateOptimalBps: number; // annual rate at the kink point (bps)
	interestRateAddBps: number;     // additional rate above the kink (bps)
};

// Full data structure read from a single Pair contract.
// A Pair is the core of the UniPool protocol — a single smart contract combining AMM swap + lending.
export type PairData = {
	address: `0x${string}`;  // address of this Pair contract itself

	// The Pair itself is also an ERC-20 token (LP token).
	// ERC-20: the Ethereum standard token interface — name, symbol, balance, transfer, etc.
	// LP Token (Liquidity Provider Token): a receipt token proving liquidity was supplied.
	// Burning the LP token returns the originally deposited tokens.
	name: string;     // ERC-20 token name (e.g. "UniPool ETH/USDC LP")
	symbol: string;   // ERC-20 symbol (e.g. "ULP")
	decimals: number; // decimal places of the LP token (usually 18)
	totalSupply: bigint; // total circulating LP token supply (minted minus burned)

	token0: `0x${string}`; // contract address of the first token held by the pool
	token1: `0x${string}`; // contract address of the second token held by the pool
	factory: `0x${string}`; // Factory contract address that created this Pair

	reserve0: bigint; // actual token0 quantity currently held by the pool
	reserve1: bigint; // actual token1 quantity currently held by the pool

	virtualReserves: {
		// Separate virtual reserves for buy (In) and sell (Out) → implements asymmetric pricing (spread)
		// "In": depositing this token into the pool (= buying the other token with this one)
		// "Out": withdrawing this token from the pool (= selling the other token to receive this one)
		virtualReserve0In: bigint;  // virtual reserve for token0 on the buy side
		virtualReserve0Out: bigint; // virtual reserve for token0 on the sell side
		virtualReserve1In: bigint;  // virtual reserve for token1 on the buy side
		virtualReserve1Out: bigint; // virtual reserve for token1 on the sell side
	};

	fees: {
		feeLp: number;   // LP (liquidity provider) fee ratio (bps)
		feePool: number; // protocol operations fee ratio (bps)
		burnFee: number; // LP token burn fee ratio (bps)
	};
	loanFees: {
		// Fee ratio charged when a loan is executed (bps).
		// The same fee applies to flash loans (same-transaction repayment loans).
		loanFee0: number; // token0 loan fee (bps)
		loanFee1: number; // token1 loan fee (bps)
	};
	feeCollector: `0x${string}`; // address that collects fees for this Pair

	// Separate interest rate model parameters for token0 and token1 (see InterestParams above)
	interestParams: { token0: InterestParams; token1: InterestParams };

	// Current interest multiplier (in RAY = 10^27 units).
	// Amount a borrower actually owes = principal * (current multiplier / multiplier at borrow time)
	interestMultiplier0: bigint; // current interest multiplier for token0
	interestMultiplier1: bigint; // current interest multiplier for token1

	// Current variable interest rate (in RAY, annualised).
	// Convert to %: Number(value) / 1e27 * 100
	// e.g. 3 * 10^25 RAY → 3% annual rate
	variableInterestRate0: bigint; // current annual interest rate for token0 (RAY)
	variableInterestRate1: bigint; // current annual interest rate for token1 (RAY)

	// Yield accumulator value at the time of the last on-chain update.
	// Compare with current interestMultiplier to find "unrecorded interest since last update".
	lastYieldAccumulator: { yieldAcc0: bigint; yieldAcc1: bigint };

	totalBorrowed0: bigint; // total outstanding token0 borrow (not yet repaid)
	totalBorrowed1: bigint; // total outstanding token1 borrow (not yet repaid)

	// Accumulated pool fees — unpaid fees not yet transferred to feeCollector.
	accumulatedPoolFees: { fee0: bigint; fee1: bigint };

	// Unix timestamp (in seconds) of the last interest rate / accumulator update.
	// Unix timestamp: seconds elapsed since 1970-01-01 00:00:00 UTC.
	lastUpdateTimestamp: bigint;

	// ID that will be assigned to the next loan created.
	// (total loans created so far) + 1 = how many loans have been issued from this pool.
	nextLoanId: bigint;

	borrowLimitBps: number;        // max loan-to-value ratio for this Pair (bps)
	liquidationPenaltyBps: number; // liquidation penalty ratio (bps)
	maxBorrowPerTick: number;      // max borrow ratio per single tick (bps)
	maxBorrowPerRange: number;     // max borrow ratio across an entire tick range (bps)
	priceDecay: bigint;            // speed at which virtual price converges to real market price
	swapPriceToleranceBps: number; // max allowed swap slippage (bps)
	tickBuffer: number;            // extra tick buffer for liquidation calculations

	// Minimum LP token quantity permanently locked at pool creation.
	// Called "dead shares" — prevents division-by-zero math errors.
	minimumLiquidity: bigint;

	// Decimal precision constant for interestMultiplier values (= RAY_DECIMALS = 27).
	interestMultiplierDecimals: number;

	// Decimal precision constant for RAY units (= 27).
	// 10^rayDecimals = 10^27 = 1 RAY
	rayDecimals: number;

	// ERC-20 symbol for token0 (e.g. "WETH", "USDC").
	// Used for labelling reserve0, totalBorrowed0, etc.
	// Empty string ("") if the lookup fails.
	token0Symbol: string;

	// Decimal places for token0.
	// e.g. WETH=18, USDT=6, cbBTC=8
	// Required to convert raw bigint values (reserve0, etc.) to human-readable decimals.
	token0Decimals: number;

	// ERC-20 symbol for token1 (e.g. "USDT", "cbBTC")
	token1Symbol: string;

	// Decimal places for token1
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

// ─── viem multicall return value rules ──────────────────────────────────────
// Solidity return value → viem conversion rules:
//   1 return value  → value directly  e.g. getFeeCollector() → "0x..."
//   multiple values → array           e.g. getTokens()       → ["0x...", "0x..."]
//   tuple return    → object (named)  e.g. getVirtualReserves() → { virtualReserve0In: ... }

// Internal function that reads all data from a single Pair contract.
// client is passed in from outside so fetchAllPairs can reuse one client instance across multiple Pairs.
// (Creating a new client per Pair adds object-creation overhead)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchOnePair(client: any, pairAddress: `0x${string}`, blockNumber?: bigint): Promise<PairData> {
	const results = await client.multicall({
		allowFailure: true,
		...(blockNumber !== undefined ? { blockNumber } : {}),
		contracts: [
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'name' },                        // [0]  ERC-20 name
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'symbol' },                      // [1]  ERC-20 symbol
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'decimals' },                    // [2]  decimal places (uint8, usually 18)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'totalSupply' },                 // [3]  total LP token supply
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTokens' },                   // [4]  [token0, token1] address array
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getFactory' },                  // [5]  Factory address
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getReserves' },                 // [6]  [reserve0, reserve1]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getVirtualReserves' },          // [7]  {virtualReserve0In, ...} object
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getFeesBps' },                  // [8]  [feeLp, feePool, burnFee]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLoanFeesBps' },              // [9]  [loanFee0, loanFee1]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getFeeCollector' },             // [10] fee recipient address
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getInterestParamsBps' },        // [11] [token0Params, token1Params] — array of tuples
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getInterestMultiplier0' },      // [12] token0 interest multiplier (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getInterestMultiplier1' },      // [13] token1 interest multiplier (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'calcVariableInterestRate0' },   // [14] token0 current variable rate (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'calcVariableInterestRate1' },   // [15] token1 current variable rate (RAY)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLastYieldAccumulator' },     // [16] [yieldAcc0, yieldAcc1]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTotalBorrowed0' },           // [17] total outstanding token0 borrow
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTotalBorrowed1' },           // [18] total outstanding token1 borrow
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getAccumulatedPoolFees' },      // [19] [fee0, fee1] undistributed fees
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLastUpdateTimestamp' },      // [20] Unix timestamp (seconds)
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getNextLoanId' },               // [21] next loan ID
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getBorrowLimitBps' },           // [22]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getLiquidationPenaltyBps' },    // [23]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getMaxBorrowPerTickAndRange' }, // [24] [maxTick, maxRange]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getPriceDecay' },               // [25]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getSwapPriceToleranceBps' },    // [26]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'getTickBuffer' },               // [27]
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'MINIMUM_LIQUIDITY' },           // [28] constant: minimum LP
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'INTEREST_MULTIPLIER_DECIMALS' }, // [29] constant: interest multiplier decimals
			{ address: pairAddress, abi: PAIR_ABI, functionName: 'RAY_DECIMALS' }                 // [30] constant: 27
		]
	});

	// helper: returns result if results[i] succeeded, otherwise returns fallback
	function get<T>(i: number, fallback: T): T {
		const r = results[i];
		return r.status === 'success' ? (r.result as T) : fallback;
	}

	// parse array-return functions
	const tokens = get<readonly [`0x${string}`, `0x${string}`]>(4, [ZERO, ZERO]);
	const reserves = get<readonly [bigint, bigint]>(6, [0n, 0n]);
	const fees = get<readonly [number, number, number]>(8, [0, 0, 0]);
	const loanFees = get<readonly [number, number]>(9, [0, 0]);

	// [11] getInterestParamsBps → Pair has separate tuples for token0/token1 → returns [tuple0, tuple1] array.
	//      Differs from Factory: Factory returns one tuple; Pair returns an array of two tuples.
	const interest = get<readonly [InterestParams, InterestParams]>(11, [
		INTEREST_FALLBACK,
		INTEREST_FALLBACK
	]);

	const yieldAcc = get<readonly [bigint, bigint]>(16, [0n, 0n]);
	const poolFees = get<readonly [bigint, bigint]>(19, [0n, 0n]);
	const maxBorrow = get<readonly [number, number]>(24, [0, 0]);

	// [7] getVirtualReserves → Solidity named tuple → viem converts to an object with named fields
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
		// The 4 fields below are populated by the second multicall in fetchAllPairs.
		// When fetchOnePair is called standalone, they are returned as empty/default values.
		token0Symbol: '',
		token0Decimals: 18,
		token1Symbol: '',
		token1Decimals: 18
	};
}

// Fetches all Pair addresses from the Factory, then reads each Pair's data in parallel.
// allPairsLength: data.allPairsLength obtained from fetchFactoryData
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

	// Step 1: Batch-fetch Pair addresses at indices 0~(length-1) from the Factory.
	// allowFailure: false → failing to fetch a Pair address is a fatal error → throws.
	const indexResults = await client.multicall({
		allowFailure: false,
		...(blockNumber !== undefined ? { blockNumber } : {}),
		contracts: Array.from({ length }, (_, i) => ({
			address: factoryAddress,
			abi: FACTORY_ABI,
			functionName: 'getPairAtIndex' as const,
			args: [BigInt(i)] as const // convert index to BigInt (Solidity uint256 parameter)
		}))
	});

	const pairAddresses = indexResults as `0x${string}`[];

	// Step 2: Read data from each Pair address in parallel.
	// Promise.all: runs multiple async tasks concurrently → waits for the slowest one.
	// Serial execution would take (number of Pairs × round-trip time) → very slow.
	const pairs = await Promise.all(pairAddresses.map((addr) => fetchOnePair(client, addr, blockNumber)));

	// Step 3: Collect unique token addresses across all Pairs and batch-fetch their symbols/decimals.
	// Use Set to deduplicate → even if the same token appears in multiple Pairs, it is queried only once.
	// flatMap: flattens the pairs array into [token0, token1, token0, token1, ...] then deduplicates.
	const uniqueTokens = [...new Set(pairs.flatMap((p) => [p.token0, p.token1]))];

	// 2 functions per token (symbol, decimals) → uniqueTokens.length × 2 calls in 1 RPC request.
	// Index for token i: symbol = i*2, decimals = i*2+1
	const metaResults = await client.multicall({
		allowFailure: true,
		...(blockNumber !== undefined ? { blockNumber } : {}),
		contracts: uniqueTokens.flatMap((token) => [
			{ address: token, abi: ERC20_META_ABI, functionName: 'symbol' as const },   // i*2+0: ERC-20 symbol
			{ address: token, abi: ERC20_META_ABI, functionName: 'decimals' as const }  // i*2+1: decimal places
		])
	});

	// Map from token address → { symbol, decimals }.
	// Map is a JavaScript data structure that stores key-value pairs.
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

	// Step 4: Inject token metadata into each Pair and return.
	// Spread operator (...p): copies the existing Pair data, then overwrites only the 4 new fields.
	return pairs.map((p) => ({
		...p,
		token0Symbol: tokenMeta.get(p.token0)?.symbol ?? '',
		token0Decimals: tokenMeta.get(p.token0)?.decimals ?? 18,
		token1Symbol: tokenMeta.get(p.token1)?.symbol ?? '',
		token1Decimals: tokenMeta.get(p.token1)?.decimals ?? 18
	}));
}

// ─── Display utility functions ───────────────────────────────────────────────

// Converts bps (basis points) to a percentage string.
// e.g. bpsToPercent(30) → "0.30%",  bpsToPercent(8000) → "80.00%"
export function bpsToPercent(bps: number): string {
	return `${(bps / 100).toFixed(2)}%`;
}

// Converts a Unix timestamp (in seconds) to a local date-time string.
// Returns "—" if the value is 0, indicating no data.
export function formatTimestamp(ts: bigint): string {
	if (ts === 0n) return '—';
	return new Date(Number(ts) * 1000).toLocaleString();
	// * 1000: JavaScript Date uses milliseconds but blockchain timestamps are in seconds → conversion required.
}

// Converts a raw BigInt value to a decimal string.
// e.g. formatAmount(1000000n, 6)  → "1.000000"  (1 USDC: 6 decimals)
//      formatAmount(1000000000000000000n, 18) → "1.000000000000000000"  (1 ETH)
export function formatAmount(value: bigint, decimals: number): string {
	return formatUnits(value, decimals);
}
