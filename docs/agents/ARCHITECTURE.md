# Architecture

Frontend architecture notes for AI agents.

## Platform Model

The app is a web-first Expo / React Native application.
Expo Router provides file-based routing through `app/`.
React Native Paper and project UI primitives provide the visual system.

Native files exist, especially for wallet adapters, but current practical support is web-first.

## Layers

Typical data/action flow:

1. Route in `app/`
2. Screen container in `screens/`
3. Domain/shared components in `src/components/`
4. Hooks/providers in `src/hooks/`, `src/providers/`, or `storage/`
5. Domain services in `src/services/premarket/`, `src/services/files/`, or similar
6. API clients in `src/services/api/` or blockchain services in `src/services/blockchain/`
7. Backend REST API, wallet, Solana, or IPFS service

Keep data fetching, transactions, and persistence out of low-level UI components when a service/hook layer exists.

## Routing And Layouts

- Root layout: `app/_layout.tsx`
- Route files: `app/**/*.tsx`
- Screen containers: `screens/*.tsx`

`app/_layout.tsx` currently:

- loads Inter fonts,
- registers date translations,
- installs browser globals for `Buffer` and `process`,
- composes providers,
- applies `darkTheme`,
- renders top navigation,
- renders the Expo Router stack,
- renders global modal/portal infrastructure.

Use Expo Router conventions for new routes.
Keep route files thin when the screen has meaningful logic.

## State Management

State is mostly React Context + hooks.

Provider composition in `app/_layout.tsx` includes:

- `NetworkProvider`
- `AuthProvider`
- `WalletProvider`
- `ContentAreaProvider`
- `PaperProvider`
- `NotificationProvider`
- `LoginModalProvider`
- `UserModalProvider`
- `UniversalOverlayProvider`
- `Portal.Host`

Local UI state should stay local.
Shared cross-route state should use an existing provider or a narrowly scoped new provider.
Draft persistence for premarket creation is handled by `src/hooks/usePremarketDraft.ts`.

## Auth And Session

Auth lives in `src/providers/AuthContext.tsx`.

Key behavior:

- JWT is stored through `@react-native-async-storage/async-storage`.
- JWT is decoded with `jwt-decode`.
- `setAuthToken` from `src/services/api/http.ts` updates the shared API auth header.
- Logout clears user state, storage, and API token.

Session-sensitive flows must preserve token setup/cleanup.
Do not bypass auth checks or store JWTs in new places without explicit need.

## API Clients

Shared HTTP behavior is in `src/services/api/http.ts`.

Responsibilities:

- build URLs and query params,
- attach bearer token,
- serialize JSON,
- apply timeout/retry,
- refresh token on `401`,
- parse JSON/text/blob responses,
- wrap HTTP errors with status/details.

Endpoint-specific API logic belongs in `src/services/api/*`.
Avoid direct `fetch` from screens/components unless there is a clear local precedent and no client layer exists.

## Env And Config

Runtime env exports live in `env.ts`.

Web loading:

- `Constants.expoConfig?.extra`
- fallback to `process.env`

Native loading:

- `@env` through `babel-plugin-dotenv-import`

Related config:

- `app.config.js`
- `babel.config.js`
- `tsconfig.json`
- `metro.config.js`
- `app.json`
- `vercel.json`

Required values throw at import time through `getRequired`.
Be careful importing `env` into examples, tests, or unsupported platform paths.

## Shared Components And Design System

Design primitives:

- `src/components/ui/*`
- `src/components/base/*`
- `src/theme/*`
- `assets/basic_icon/*`
- `src/components/base/SvgIcon.tsx`

Prefer project primitives before adding local ad hoc controls.
Use theme tokens where possible.
Check responsive behavior when layout changes.
For detailed UI rules, read `docs/agents/UI_SYSTEM.md`.

## Wallet, Web3, And Solana

High-risk area.

Files:

- `storage/wallet-adapter/WalletProvider.web.tsx`
- `storage/wallet-adapter/WalletProvider.native.tsx`
- `storage/wallet-adapter/useWallet.web.ts`
- `storage/wallet-adapter/useWallet.native.ts`
- `src/services/blockchain/solana.tsx`
- `src/services/blockchain/signAndSend.ts`
- `src/services/blockchain/premarket/*`
- `src/utils/phantom.ts`
- `src/utils/solana.ts`

Assumptions:

- Web is primary.
- Phantom is the expected wallet.
- Native wallet behavior is scaffolded, not automatically equivalent.

Transaction changes must trace UI -> domain service -> blockchain service -> wallet/sign/send/finality -> backend/IPFS side effects.

## Premarket Creation Flow

Main file: `screens/PremarketCreationFlow.tsx`.

Flow:

1. Token base info
2. Tokenomics
3. Premarket settings
4. Whitelist
5. Vesting, when enabled
6. Token customization
7. Overview
8. Processing

Important collaborators:

- `src/components/token/create/*`
- `src/components/premarket/creationFlow/OverviewPremarketCreation.tsx`
- `src/hooks/usePremarketDraft.ts`
- `src/services/premarket/create.ts`
- `src/services/premarket/addCommunityInfo.ts`
- `src/services/blockchain/signAndSend.ts`
- `storage/UniversalOverlayProvider.tsx`
- `src/providers/NotificationContext.tsx`

Changing step order, persisted draft shape, transaction creation, or final navigation is high risk.
For scenario-level flow maps, read `docs/agents/FLOWS.md`.
