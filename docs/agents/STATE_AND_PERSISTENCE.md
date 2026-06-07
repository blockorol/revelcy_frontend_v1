# State And Persistence

Agent-facing guide for state ownership, persistence, and storage boundaries.

## State Ownership

- Local component state
  Use for temporary UI state that does not need to survive route changes.
- Hooks in `src/hooks/`
  Use for reusable stateful behavior and domain UI logic.
- Providers in `src/providers/`
  Use for app-wide state shared across routes.
- Providers in `storage/`
  Current project also keeps overlay/user modal contexts and wallet storage-facing helpers here.
- Services in `src/services/`
  Use for backend, blockchain, IPFS, fingerprint, and domain side effects.

Do not move shared state into low-level UI components when hooks/providers already own the behavior.

## Root Provider Composition

Provider order is in `app/_layout.tsx`.

Current important providers:

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

Changing provider order is high risk. Check dependencies before moving providers.

## Auth Persistence

File: `src/providers/AuthContext.tsx`.

Current behavior:

- JWT storage key: `auth-token`.
- Storage backend: `@react-native-async-storage/async-storage`.
- JWT decoded with `jwt-decode`.
- `setAuthToken` updates shared HTTP Authorization behavior.
- Logout clears user state, stored token, and HTTP auth token.

Do not store auth tokens in new places without explicit need.

## Generic KV Storage

File: `storage/kvStorage.ts`.

Behavior:

- Web uses `window.localStorage`.
- Native uses `AsyncStorage`.
- Storage calls catch unavailable web storage and fail softly.

Use this abstraction when platform-neutral key-value persistence is desired.

## Premarket Draft Persistence

File: `src/hooks/usePremarketDraft.ts`.

Current behavior:

- Draft key: `premarket_draft:<VERSION>`.
- Current version constant: `4`.
- Stores step and step data.
- Supports `patch`, `saveNow`, `clear`, `reset`.
- Initial load has timeout/retry options.
- Restore callback is owned by the caller.

Caller: `screens/PremarketCreationFlow.tsx`.

High-risk changes:

- changing draft shape,
- changing step numbering,
- changing version,
- clearing draft on failure,
- restoring processing state,
- changing close/back/done behavior.

## Modal And Overlay State

- `src/providers/LoginModalContext.tsx`
  Login modal state.
- `storage/UserModalContext.tsx`
  User modal state.
- `storage/UniversalOverlayProvider.tsx`
  Blocking overlay state.
- `src/providers/NotificationContext.tsx`
  Snackbar queue.

Do not add duplicate modal/overlay systems for one-off flows.

## State Change Checklist

- State ownership is clear.
- Shared state uses existing provider/hook patterns.
- Persistence keys and versions are intentional.
- Logout/draft clear behavior remains correct.
- Provider order still supports consumers.
- `ARCHITECTURE.md`, `FLOWS.md`, and `INVARIANTS.md` are updated if behavior changed.
