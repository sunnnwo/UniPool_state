# UniPool Parameter Dashboard

A dashboard for reading and editing UniPool protocol parameters across Arbitrum, Base, and BSC. Supports both read-only inspection and Safe-compatible transaction generation for on-chain parameter changes.
Access link : https://internal-tools.infra.real-estate-executive.com/unipool-dashboard/index.html/

---

## What it does

- Reads all **Factory** parameters (default protocol-wide settings)
- Reads all **Pair** parameters for every pool created by each Factory (each pair can override the Factory defaults)
- Reads all **Vault** parameters (asset yield data, Aave integration status)
- Displays everything side by side so differences across chains are immediately visible
- All data is fetched via **multicall** — dozens of contract calls are batched into a single network request
- Lets you **edit parameters** and generates a [Safe](https://app.safe.global) transaction JSON you can import directly into the Gnosis Safe UI

---

## Tech stack

| Tool           | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| **Svelte 5**   | UI framework (runes-based reactivity)                             |
| **TypeScript** | Type safety across the whole codebase                             |
| **viem**       | Ethereum RPC client — handles ABI encoding/decoding and multicall |
| **Vite**       | Build tool and dev server                                         |

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

### Build as a single HTML file

```bash
npm run build:html
```

Outputs a fully self-contained `dashboard.html` with all assets inlined — no server required.

---

## Project structure

```
src/
├── config/
│   ├── chains.ts          # Chain metadata + RPC URLs + Factory addresses
│   ├── editing.ts         # Safe transaction builder — types, validation, JSON export
│   ├── fetchFactory.ts    # Fetches all Factory getters via multicall
│   ├── fetchpairs.ts      # Fetches all Pair getters via multicall
│   └── fetchVault.ts      # Fetches all Vault getters via multicall
├── components/
│   ├── FactoryCard.svelte # Displays Factory parameters with edit buttons
│   ├── PairCard.svelte    # Displays Pair parameters with edit buttons
│   ├── Sidebar.svelte     # Collapsible navigation sidebar (contracts list)
│   ├── Sparkline.svelte   # Compact inline SVG line chart
│   └── VaultCard.svelte   # Displays Vault parameters with edit buttons
├── lib/
│   ├── index.ts           # Re-exports
│   └── sidebar.svelte.ts  # Sidebar shared state (Svelte 5 runes store)
└── routes/
    ├── +layout.svelte     # App shell with sidebar
    ├── +layout.ts         # Static adapter config
    └── +page.svelte       # Main page — orchestrates loading, editing, Safe batch
```

---

## Features

- **Per-chain load** — click Refresh on any chain to reload only that chain
- **Load all** — fetches all three chains in parallel
- **Pair search** — filter pairs by token symbol, name, or address
- **Copy buttons** — copies individual addresses or the full card as human-readable JSON
- **Multicall batching** — Factory (13 calls), Pair (31 calls), Vault (4 calls per token) each resolved in a single RPC round trip
- **Parameter editing** — click any editable field to open a modal; fills in the current on-chain value as the default
- **Safe batch builder** — staged edits are collected per chain; download as a JSON file ready to import into [app.safe.global](https://app.safe.global)
- **Collapsible sidebar** — navigate between Factory, Pair, and Vault cards without scrolling; toggle width with the ‹/› button

---

## Safe transaction workflow

1. Load a chain's data.
2. Click the **edit icon** on any parameter — a modal pre-fills the current value.
3. Enter the new value and click **Add to batch**. The transaction is staged in the sidebar.
4. Repeat for any other parameters you want to change (across any contract on the same chain).
5. Click **Download JSON** next to the chain name. The file is formatted for Gnosis Safe's transaction builder.
6. Go to the Safe URL for that chain, open **Transaction Builder**, and import the file.

Safe addresses per chain:

| Chain        | Safe                                         | URL                        |
| ------------ | -------------------------------------------- | -------------------------- |
| Arbitrum One | `0xc6b1e7F76DfC2eEE534200a0182F136775789142` | [arb1 Safe][safe-arb]      |
| Base         | `0xf0a20057518FAf9cDA82fA82D795a4F4770e1951` | [base Safe][safe-base]     |
| BSC          | `0x44b6A0e4CEB9ded60fEE3AcB6D8405241DE0b325` | [bnb Safe][safe-bnb]       |

[safe-arb]: https://app.safe.global/home?safe=arb1:0xc6b1e7F76DfC2eEE534200a0182F136775789142
[safe-base]: https://app.safe.global/home?safe=base:0xf0a20057518FAf9cDA82fA82D795a4F4770e1951
[safe-bnb]: https://app.safe.global/home?safe=bnb:0x44b6A0e4CEB9ded60fEE3AcB6D8405241DE0b325

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
| **Safe**           | Gnosis Safe — a multisig smart contract wallet used to manage protocol admin transactions                                                                          |
| **Beacon Proxy**   | An upgradeable contract pattern where the implementation address is stored in a separate Beacon contract rather than in the proxy itself                           |
| **LP token**       | Liquidity Provider token — an ERC-20 minted to represent a user's share of a liquidity pool                                                                        |
| **Unix timestamp** | Seconds elapsed since 1 January 1970. Multiply by 1000 to convert to a JavaScript Date                                                                             |
