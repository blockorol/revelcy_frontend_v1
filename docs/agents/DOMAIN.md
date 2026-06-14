# Domain

Business/domain model for AI agents working on the Revelcy frontend.
For sequence-level maps of these scenarios, read `docs/agents/FLOWS.md`.

## Core Entities

- User
  Authenticated app user represented by decoded JWT data in `src/providers/AuthContext.tsx`.
- Auth session
  JWT-backed session stored locally and attached to API requests through `src/services/api/http.ts`.
- Wallet
  Phantom/Solana wallet state exposed through `storage/wallet-adapter/*`.
- Network
  Selected Solana network from `src/providers/NetworkContext.tsx`.
- Premarket
  Token premarket campaign shown in discovery/detail screens and created through the creation flow.
- Token info
  Token name, ticker, avatar, description, links, tokenomics, and customization data.
- Community info
  Banner, description, and external/social links attached to token/community metadata.
- Holder / entry
  User participation and holder-related premarket state.
- Whitelist
  Optional participant allowlist configured during premarket creation.
- Vesting
  Optional vesting configuration for token allocation/claim semantics.
- Transaction
  Solana transaction created/signed/sent/finalized during premarket actions.
- Claim
  Token claim flow after eligible premarket/vesting state.

## Main User Scenarios

### Browse Premarkets

User views discover/list page and premarket cards/details.

Likely files:

- `app/discover.tsx`
- `screens/PremarketsPage.tsx`
- `src/components/premarket/PremarketList.tsx`
- `src/components/premarket/PremarketCard.tsx`
- `src/hooks/usePremarketInfo.ts`
- `src/services/api/token.ts`
- `src/services/api/tx_premarket.ts`

### View Premarket Detail

User opens a dynamic premarket page and sees base info, dynamic info, holders, timeline, bonding curve, vesting, and actions.

Likely files:

- `app/token/[premarketId].tsx`
- `screens/TokenPremarketPage.tsx`
- `src/components/premarket/*`
- `src/hooks/usePremarketInfo.ts`
- `src/hooks/useHolderEntryInfo.ts`
- `src/hooks/useJoinFlow.tsx`

### Authenticate / Login

User signs in through login/wallet-related flow and receives/stores JWT session.

Likely files:

- `src/components/login/*`
- `src/hooks/useWalletLoginFlow.ts`
- `src/providers/AuthContext.tsx`
- `src/providers/LoginModalContext.tsx`
- `src/services/api/auth.ts`
- `src/services/api/wallet.ts`
- `src/services/fingerprint/*`

### Connect Wallet

User connects Phantom wallet for authenticated or transaction flows.

Likely files:

- `storage/wallet-adapter/*`
- `src/hooks/connectWallet.ts`
- `src/hooks/useWalletLoginFlow.ts`
- `src/components/login/WalletButton.tsx`
- `src/utils/phantom.ts`
- `src/utils/solana.ts`

### Create Premarket

User completes multi-step token/premarket creation, uploads metadata, signs Solana transaction, and navigates to the created premarket.

Likely files:

- `app/token/create.tsx`
- `screens/PremarketCreationFlow.tsx`
- `src/components/token/create/*`
- `src/components/premarket/creationFlow/OverviewPremarketCreation.tsx`
- `src/hooks/usePremarketDraft.ts`
- `src/services/premarket/create.ts`
- `src/services/premarket/addCommunityInfo.ts`
- `src/services/files/ipfs/pumpfun.ts`
- `src/services/files/ipfs/pinata.ts`
- `src/services/blockchain/premarket/createPremarket.ts`
- `src/services/blockchain/signAndSend.ts`

### Join / Leave / Finish / Extend Premarket

User performs premarket actions that may require wallet state, backend state, and Solana transactions.

Likely files:

- `src/components/premarket/PremarketAction.tsx`
- `src/components/premarket/PremarketJoin.tsx`
- `src/hooks/useJoinFlow.tsx`
- `src/services/blockchain/premarket/joinPremarket.ts`
- `src/services/blockchain/premarket/outOfPremarket.ts`
- `src/services/blockchain/premarket/finishPremarket.ts`
- `src/services/blockchain/premarket/extendPremarket.ts`
- `src/services/api/tx_premarket.ts`

### Claim Tokens

User claims tokens after premarket/vesting conditions are satisfied.

Likely files:

- `src/components/premarket/PremarketAction.tsx`
- `src/components/premarket/YourEntry.tsx`
- `src/components/premarket/VestingCard.tsx`
- `src/services/blockchain/premarket/claimTokens.ts`
- `src/utils/vesting.ts`

## API Client Links

- Auth/session: `src/services/api/auth.ts`, `src/services/api/wallet.ts`
- User profile/info: `src/services/api/users.ts`
- Token/premarket data: `src/services/api/token.ts`, `src/services/api/tx_premarket.ts`
- Files: `src/services/api/files.ts`
- Shared HTTP/auth refresh: `src/services/api/http.ts`

Before changing a scenario, trace both the frontend state and the related backend/API client contract.
