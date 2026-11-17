# Project Structure

Human-facing project structure guide.

## Top-Level

| Path | Purpose |
| --- | --- |
| `app/` | Expo Router routes, layouts, docs routes, examples, token routes. |
| `screens/` | Route-level screen containers. |
| `src/components/` | Shared and domain UI components. |
| `src/hooks/` | Reusable hooks and domain UI logic. |
| `src/providers/` | App-wide React context providers. |
| `src/services/` | API, blockchain, IPFS, fingerprint, and domain services. |
| `src/theme/` | Theme, colors, fonts, and theme types. |
| `src/types/` | Shared type declarations. |
| `src/utils/` | Formatting, validation, URL, image, math, vesting, and Solana helpers. |
| `storage/` | Storage helpers, modal/overlay contexts, wallet adapters. |
| `assets/` | Static images and SVG icons. |
| `public/` | Static web assets. |
| `docs/` | Human-facing documentation and agent docs. |

## App Routes

Routes live in `app/`.

Important routes:

- `app/_layout.tsx`
- `app/index.tsx`
- `app/discover.tsx`
- `app/me.tsx`
- `app/resources.tsx`
- `app/token/create.tsx`
- `app/token/[premarketId].tsx`
- `app/docs/*`

`app/example/**` is an example/test stand area, not necessarily production behavior.

## UI Areas

- `src/components/ui/` - project UI primitives.
- `src/components/base/` - lower-level reusable components.
- `src/components/navigation/` - navigation.
- `src/components/login/` - login and wallet UI.
- `src/components/premarket/` - premarket display and actions.
- `src/components/token/create/` - token/premarket creation forms.

## Service Areas

- `src/services/api/` - backend API clients.
- `src/services/blockchain/` - Solana helpers and premarket transaction actions.
- `src/services/files/ipfs/` - IPFS upload helpers.
- `src/services/premarket/` - premarket orchestration.
- `src/services/fingerprint/` - fingerprint collection/sending.

## Config Files

- `package.json`
- `tsconfig.json`
- `babel.config.js`
- `metro.config.js`
- `app.config.js`
- `app.json`
- `vercel.json`
