# Flows

Agent-facing map of important frontend user flows.
This file describes sequence and ownership. It does not define backend or web3 contracts.

## Login / Auth Session

Purpose: authenticate user, store JWT, attach token to API calls.

Read:

- `src/components/login/*`
- `src/hooks/useWalletLoginFlow.ts`
- `src/providers/AuthContext.tsx`
- `src/providers/LoginModalContext.tsx`
- `src/services/api/auth.ts`
- `src/services/api/wallet.ts`
- `src/services/api/http.ts`
- `src/services/fingerprint/*`

Flow shape:

1. User opens login UI.
2. Wallet/login hook coordinates auth.
3. Backend returns JWT.
4. `AuthContext` decodes and stores JWT.
5. `http.setAuthToken` attaches token to API requests.

High risk: token storage, token clearing, refresh behavior, wallet login assumptions.

## Wallet Connect

Purpose: connect Phantom/Solana wallet for auth and transactions.

Read:

- `storage/wallet-adapter/*`
- `src/hooks/connectWallet.ts`
- `src/hooks/useWalletLoginFlow.ts`
- `src/components/login/WalletButton.tsx`
- `src/utils/phantom.ts`
- `src/utils/solana.ts`

Flow shape:

1. UI asks wallet adapter to connect.
2. Web path uses Phantom-oriented wallet logic.
3. Connected wallet state is consumed by auth and transaction flows.

High risk: web/native split, disconnected wallet behavior, unsupported wallet/network handling.

## Browse Premarkets

Purpose: show premarket list/discovery UI.

Read:

- `app/discover.tsx`
- `screens/PremarketsPage.tsx`
- `src/components/premarket/PremarketList.tsx`
- `src/components/premarket/PremarketCard.tsx`
- `src/hooks/usePremarketInfo.ts`
- `src/services/api/token.ts`
- `src/services/api/tx_premarket.ts`

Flow shape:

1. Route renders list screen.
2. Screen/hooks fetch or prepare premarket data.
3. Premarket components render list/cards.
4. User navigates to detail route.

High risk: route names, API assumptions, card/detail consistency.

## View Premarket Detail

Purpose: show full premarket state and available actions.

Read:

- `app/token/[premarketId].tsx`
- `screens/TokenPremarketPage.tsx`
- `src/components/premarket/*`
- `src/hooks/usePremarketInfo.ts`
- `src/hooks/useHolderEntryInfo.ts`
- `src/hooks/useJoinFlow.tsx`

Flow shape:

1. Dynamic route receives `premarketId`.
2. Detail screen loads premarket and holder state.
3. Domain components render info, timeline, vesting, community, and actions.
4. Action components trigger join/leave/claim/finish paths when eligible.

High risk: dynamic route params, eligibility display, action availability.

## Create Premarket

Purpose: collect token/premarket data, persist draft, upload metadata, create transaction, navigate to created page.

Read:

- `app/token/create.tsx`
- `screens/PremarketCreationFlow.tsx`
- `src/components/token/create/*`
- `src/components/premarket/creationFlow/OverviewPremarketCreation.tsx`
- `src/hooks/usePremarketDraft.ts`
- `src/services/premarket/create.ts`
- `src/services/premarket/addCommunityInfo.ts`
- `src/services/files/ipfs/*`
- `src/services/blockchain/premarket/createPremarket.ts`
- `src/services/blockchain/signAndSend.ts`
- `storage/UniversalOverlayProvider.tsx`
- `src/providers/NotificationContext.tsx`

Flow shape:

1. User fills token base info.
2. User fills tokenomics.
3. User fills premarket settings.
4. User configures whitelist.
5. User configures vesting when enabled.
6. User customizes token/community info.
7. Overview validates final data.
8. Launch checks wallet/network/data.
9. Metadata and blockchain creation flow runs.
10. Processing confirms finality.
11. User navigates to created premarket.

High risk: draft persistence, step order, validation, wallet disconnected state, transaction finality, final route.

## Join / Leave Premarket

Purpose: user participates in or exits a premarket.

Read:

- `src/components/premarket/PremarketAction.tsx`
- `src/components/premarket/PremarketJoin.tsx`
- `src/hooks/useJoinFlow.tsx`
- `src/services/blockchain/premarket/joinPremarket.ts`
- `src/services/blockchain/premarket/outOfPremarket.ts`
- `src/services/api/tx_premarket.ts`

High risk: amount conversion, wallet state, eligibility, backend/blockchain consistency.

## Claim / Finish / Extend

Purpose: user or creator performs lifecycle actions after premarket state changes.

Read:

- `src/components/premarket/PremarketAction.tsx`
- `src/components/premarket/YourEntry.tsx`
- `src/components/premarket/VestingCard.tsx`
- `src/services/blockchain/premarket/claimTokens.ts`
- `src/services/blockchain/premarket/finishPremarket.ts`
- `src/services/blockchain/premarket/extendPremarket.ts`
- `src/utils/vesting.ts`

High risk: claim eligibility, vesting timing, transaction finality, creator-only actions.

## Draft Restore / Clear

Purpose: keep premarket creation data recoverable during the flow.

Read:

- `src/hooks/usePremarketDraft.ts`
- `screens/PremarketCreationFlow.tsx`
- `src/components/token/create/interface.tsx`

High risk: changing saved shape without restore compatibility, clearing draft too early, restoring processing step incorrectly.
