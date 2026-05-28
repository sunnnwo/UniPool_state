bash

cat > /home/claude/unipool/README.md << 'README'

# UniPool Parameter Dashboard

A read-only dashboard that fetches and displays all contract parameters from the UniPool protocol across Arbitrum, Base, and BSC in real time. Designed to compare parameters across chains and across individual trading pairs at a glance.

---

## What it does

- Reads all **Factory** parameters (default protocol-wide settings)
- Reads all **Pair** parameters for every pool created by each Factory (each pair can override the Factory defaults)
- Reads all **Vault** parameters (asset yield data, Aave integration status)
- Displays everything side by side so differences across chains are immediately visible
- All data is fetched via **multicall** — dozens of contract calls are batched into a single network request

---

## Tech stack

| Tool           | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| **Svelte 5**   | UI framework (runes-based reactivity)                             |
| **TypeScript** | Type safety across the whole codebase                             |
| **viem**       | Ethereum RPC client — handles ABI encoding/decoding and multicall |
| **Vite**       | Build tool and dev server                                         |

---

## Prerequisites

- Node.js 18+
- A free [Alchemy](https://www.alchemy.com) account for Arbitrum and Base RPC endpoints
- BSC uses a public RPC — no account needed

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Alchemy API key:

```bash
VITE_RPC_ARBITRUM=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_RPC_BASE=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
VITE_RPC_BSC=https://bsc-dataseed.binance.org

VITE_FACTORY_ARBITRUM=0xa88216E6Cf409a25c719234C4817628Ae406b6A7
VITE_FACTORY_BASE=0xC264944E9E7073F8F98fEf7338Cda973914FcA44
VITE_FACTORY_BSC=0xabD8DC06559634e59F6698c33A5E65e90e917b91
```

> **Never commit `.env` to git.** It is already listed in `.gitignore`.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Build for production

```bash
npm run build
```

---

## Project structure

```
src/
├── config/
│   ├── chains.ts          # Chain metadata + RPC URLs + Factory addresses
│   ├── fetchFactory.ts    # Fetches all Factory getters via multicall
│   ├── fetchpairs.ts      # Fetches all Pair getters via multicall
│   ├── fetchVault.ts      # Fetches all Vault getters via multicall
│   └── abis/
│       ├── factory.ts     # Factory contract ABI
│       ├── pair.ts        # Pair contract ABI
│       └── vault.ts       # Vault contract ABI
├── components/
│   ├── FactoryCard.svelte # Displays Factory parameters
│   ├── PairCard.svelte    # Displays Pair parameters
│   └── VaultCard.svelte   # Displays Vault parameters
└── routes/
    └── +page.svelte       # Main page — orchestrates loading and layout
```

---

## Features

- **Per-chain load** — click Refresh on any chain to reload only that chain
- **Load all** — fetches all three chains in parallel
- **Pair search** — filter pairs by token symbol, name, or address
- **Copy buttons** — copies individual addresses or the full card as human-readable JSON
- **Multicall batching** — Factory (13 calls), Pair (31 calls), Vault (4 calls per token) each resolved in a single RPC round trip

---

## Contract addresses

| Chain        | Factory                                      |
| ------------ | -------------------------------------------- |
| Arbitrum One | `0xa88216E6Cf409a25c719234C4817628Ae406b6A7` |
| Base         | `0xC264944E9E7073F8F98fEf7338Cda973914FcA44` |
| BSC          | `0xabD8DC06559634e59F6698c33A5E65e90e917b91` |

Source: https://app.everything.inc/developers

---

## Glossary

| Term               | Meaning                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RPC**            | Remote Procedure Call — the HTTP endpoint used to send queries to a blockchain node                                                                                |
| **ABI**            | Application Binary Interface — a JSON description of a contract's functions and their input/output types. Without it, viem cannot encode calls or decode responses |
| **multicall**      | A technique that bundles multiple contract calls into one RPC request using the on-chain Multicall3 contract                                                       |
| **bps**            | Basis points — 1 bps = 0.01%, 100 bps = 1%, 10000 bps = 100%. Used in smart contracts to express percentages as integers                                           |
| **bigint**         | JavaScript's arbitrary-precision integer type. Used for uint128/uint256 values from the blockchain, which exceed JS Number's safe range (2⁵³)                      |
| **RAY**            | A unit used in Aave-style protocols. 1 RAY = 10²⁷. Interest rates stored in RAY are divided by 10²⁷ to get the human-readable decimal                              |
| **tuple**          | How Solidity structs appear in ABI JSON. viem decodes them as plain objects                                                                                        |
| **Factory**        | The master contract that deploys and tracks all Pairs. Named after the Factory design pattern                                                                      |
| **Pair**           | A liquidity pool contract for two tokens. Also an ERC-20 token itself (the LP token)                                                                               |
| **Vault**          | Holds idle token reserves and optionally deposits them into Aave to earn yield                                                                                     |
| **Beacon Proxy**   | An upgradeable contract pattern where the implementation address is stored in a separate Beacon contract rather than in the proxy itself                           |
| **LP token**       | Liquidity Provider token — an ERC-20 minted to represent a user's share of a liquidity pool                                                                        |
| **Unix timestamp** | Seconds elapsed since 1 January 1970. Multiply by 1000 to convert to a JavaScript Date                                                                             |

README
출력

exit code 0
