# Web3 And Wallet

Human-facing Web3 documentation placeholder for the Revelcy frontend.

## Status

Detailed Solana, wallet, and transaction contracts are pending.

The complete reference should be produced with access to:

- this frontend repository,
- the backend repository,
- relevant Solana program or transaction specifications.

Do not treat frontend code alone as the authoritative source for transaction semantics.

## Current Assumptions

- The practical target is web.
- Phantom is the expected wallet for web wallet flows.
- Native wallet behavior is scaffolded and should be verified before relying on it.
- Solana-related transaction behavior is high risk.

## Important Files

- `storage/wallet-adapter/*`
- `src/services/blockchain/solana.tsx`
- `src/services/blockchain/signAndSend.ts`
- `src/services/blockchain/premarket/*`
- `src/services/premarket/create.ts`
- `src/utils/phantom.ts`
- `src/utils/solana.ts`
- `src/utils/vesting.ts`

## Development Guidance

- Preserve explicit wallet connection and signature behavior.
- Do not auto-trigger signatures without clear user action.
- Do not change transaction semantics without contract/program context.
- Keep wallet disconnected, wrong network, and transaction failure states user-visible.
- Avoid logging sensitive wallet or transaction data.

## Related Docs

- [Architecture](ARCHITECTURE.md)
- [Development](DEVELOPMENT.md)
- [Security](../SECURITY.md)
