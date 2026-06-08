# Brief Part 2 — Multicall audit + on-chain settings editor (Safe JSON export)

> Follow-up to **Brief — Frontend for visualizing UniPool parameters**.
> This part assumes the read-only viewer (Factory / Pairs / Vault cards) is already working.

## Goal

Two things, in order:

1. **Audit & guarantee that RPC reads go through `multicall`.** Before adding anything new, verify that every batch of on-chain reads (Factory getters, per-pair getters, Vault getters) is actually batched with viem's `client.multicall(...)` and not fired as N individual `readContract` calls.
2. **Add an "edit" capability for the parameters that can be changed on-chain.** A small **edit icon** next to each editable setting opens a popup (or inline input) where the user types the new desired value. The frontend then **generates a Safe-compatible transaction JSON**. Editing a second (third, …) value **appends to the same JSON batch**. A **Download** button exports the finished JSON, which the user uploads into the **Safe** of the matching chain.

The frontend **never sends a transaction itself** — it only produces the JSON that goes into the Safe Transaction Builder.

---

### Target Safes (where the JSON is uploaded)

Each chain's JSON is loaded into the corresponding Safe via the Transaction Builder app:

| Chain    | chainId | Safe address                                 | Link                                                                              |
| -------- | ------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| BNB      | 56      | `0x44b6A0e4CEB9ded60fEE3AcB6D8405241DE0b325` | https://app.safe.global/home?safe=bnb:0x44b6A0e4CEB9ded60fEE3AcB6D8405241DE0b325  |
| Base     | 8453    | `0xf0a20057518FAf9cDA82fA82D795a4F4770e1951` | https://app.safe.global/home?safe=base:0xf0a20057518FAf9cDA82fA82D795a4F4770e1951 |
| Arbitrum | 42161   | `0xc6b1e7F76DfC2eEE534200a0182F136775789142` | https://app.safe.global/home?safe=arb1:0xc6b1e7F76DfC2eEE534200a0182F136775789142 |

---

## Quality points

- **Per-chain isolation**: never put transactions for two chains in the same JSON.
- **Read-only stays read-only**: no edit icon on constants or pure getters without a setter.
- **Input validation**: enforce bps / int / address ranges before encoding; surface errors in the popup.
- **`allowFailure: true`** on multicall so one revert doesn't blank a card.
- **No extra deps**: building the JSON and the download are a few lines — no library needed for either.
- **The frontend never broadcasts**: it only generates JSON. All execution happens in the Safe (multisig signing flow).

---

## Deliverable (in addition to Part 1)

- Editable settings with the edit-icon → popup → batch → download flow.

## Bonus

- One-click **"Open in Safe"** per chain.
