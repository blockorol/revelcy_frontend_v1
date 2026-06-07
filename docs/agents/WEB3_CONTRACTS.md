# Web3 Contracts

Placeholder for Solana/wallet/transaction contract notes.

## Status

TODO: Fill this file in a session/agent that has access to:

- this frontend repository,
- relevant backend repository code,
- Solana program/contracts or authoritative transaction specs,
- current wallet/network assumptions.

Do not infer final transaction contracts from frontend code alone.

## Intended Scope

When completed, this file should document:

- supported networks and network switching assumptions,
- Phantom wallet assumptions,
- wallet connect/signature requirements,
- premarket transaction semantics,
- create/join/leave/finish/extend/claim transaction flows,
- vesting and claim semantics,
- PDA/account assumptions,
- metadata/IPFS dependencies that affect transactions,
- backend synchronization after transactions,
- finality/confirmation requirements,
- failure states and user-facing recovery expectations.

## Current Frontend Inventory

Use this as a starting inventory only:

- `storage/wallet-adapter/*`
  Platform-specific wallet provider/hook behavior.
- `src/services/blockchain/solana.tsx`
  Solana connection/network helpers.
- `src/services/blockchain/signAndSend.ts`
  Transaction signing/sending/finality helpers.
- `src/services/blockchain/premarket/createPremarket.ts`
- `src/services/blockchain/premarket/joinPremarket.ts`
- `src/services/blockchain/premarket/outOfPremarket.ts`
- `src/services/blockchain/premarket/finishPremarket.ts`
- `src/services/blockchain/premarket/extendPremarket.ts`
- `src/services/blockchain/premarket/claimTokens.ts`
- `src/services/blockchain/premarket/updateUriPremarket.ts`
- `src/services/premarket/create.ts`
  High-level creation orchestration that bridges UI data, metadata upload, blockchain, and backend-related behavior.
- `src/utils/solana.ts`, `src/utils/phantom.ts`, `src/utils/vesting.ts`
  Utility assumptions.

## Rules Until Completed

- Do not change transaction semantics without authoritative contract/program context.
- Do not treat this placeholder as web3 contract authority.
- Preserve wallet signature flow and user-visible failure handling.
- For contract-level changes, use an agent/session with access to both repos and relevant Solana program context.
