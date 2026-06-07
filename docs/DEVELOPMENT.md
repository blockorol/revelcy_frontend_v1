# Development

Developer guide for working in the Revelcy frontend.

## Platform Target

The app is web-first.
Native platform files exist, especially for wallet adapters, but Android/iOS behavior should not be assumed complete without verification.

## Project Structure

- `app/` - Expo Router routes and root layout.
- `screens/` - screen containers used by routes.
- `src/components/` - shared and domain UI.
- `src/hooks/` - reusable hooks.
- `src/providers/` - React context providers.
- `src/services/` - API, blockchain, IPFS, fingerprint, and domain services.
- `src/theme/` - theme, colors, fonts, and theme types.
- `src/utils/` - formatting, validation, Solana, URL, math, image, and domain helpers.
- `storage/` - storage helpers, modal/overlay contexts, and wallet adapters.
- `assets/` - images and SVG icons.

## Aliases

Configured in `tsconfig.json`:

| Alias | Path |
| --- | --- |
| `@api/*` | `src/services/api/*` |
| `@assets/*` | `assets/*` |
| `@components/*` | `src/components/*` |
| `@hooks/*` | `src/hooks/*` |
| `@providers/*` | `src/providers/*` |
| `@screens/*` | `screens/*` |
| `@services/*` | `src/services/*` |
| `@storage/*` | `storage/*` |
| `@theme/*` | `src/theme/*` |
| `@utils/*` | `src/utils/*` |

Prefer aliases over long relative imports.

## Routing

Routes live in `app/` and use Expo Router.

Screen-level logic usually lives in `screens/`.

Examples:

- `app/token/create.tsx` uses the premarket creation screen.
- `app/token/[premarketId].tsx` uses the premarket detail screen.

## UI

Prefer shared UI primitives before adding one-off components:

- `src/components/ui/*`
- `src/components/base/*`
- `src/theme/*`

SVG icons live in `assets/basic_icon/` and are registered through `src/components/base/SvgIcon.tsx`.

## State

Global providers are composed in `app/_layout.tsx`.

Common provider areas:

- auth session
- network
- wallet
- notifications
- login modal
- user modal
- universal overlay
- content area layout

Use local state for local UI only. Use hooks/providers for shared behavior.

## API Clients

API clients live in `src/services/api/`.

Use `src/services/api/http.ts` for shared HTTP behavior.
Avoid raw `fetch` in components when an API client belongs in `src/services/api/*`.

## Wallet And Solana

Wallet adapters live in `storage/wallet-adapter/`.

Solana helpers live in `src/services/blockchain/` and `src/utils/solana.ts`.

Wallet and transaction flows are high risk. Preserve explicit wallet connection/signature behavior.

## Adding A Feature

1. Add or update route in `app/` if needed.
2. Put screen composition in `screens/` when logic is substantial.
3. Put reusable UI in `src/components/`.
4. Put reusable state in `src/hooks/` or `src/providers/`.
5. Put API/blockchain/IPFS behavior in `src/services/`.
6. Update documentation when setup, architecture, env, or workflows change.
