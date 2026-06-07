# Project Map

Repository map for AI agents. Use this to find the right files before editing.

## Top-Level Directories

- `app/`
  Expo Router entrypoints, layouts, route files, examples, legal docs, and token routes.
- `screens/`
  Route-level screen containers. Routes usually delegate here when logic is larger than a thin wrapper.
- `src/components/`
  Reusable UI, domain components, navigation, login, premarket, and token creation UI.
- `src/hooks/`
  Reusable UI/domain state hooks.
- `src/providers/`
  App-wide React context providers.
- `src/services/`
  Backend API clients, blockchain actions, IPFS upload, fingerprinting, and domain services.
- `src/theme/`
  Theme, colors, fonts, and theme types.
- `src/types/`
  Shared type declarations.
- `src/utils/`
  Formatting, validation, Solana, URL, image, math, vesting, and browser helpers.
- `storage/`
  Persistent storage helpers, overlay/modal contexts, and wallet adapters.
- `assets/`
  Images and SVG icons.
- `public/`
  Static web assets.
- `docs/`
  Human-facing documentation plus `docs/agents/` for agent-facing documentation.
- `.agents/skills/`
  Repo-shared skills for Codex/Cursor/Claude-compatible workflows.
- `.cursor/rules/`
  Cursor adapter rules for shared skills.
- `.github/ISSUE_TEMPLATE/`
  Human-facing GitHub issue templates.
- `.github/pull_request_template.md`
  GitHub PR checklist for validation, docs, and risk checks.

## Application Entrypoints

- `package.json`
  Scripts and dependencies.
- `app/_layout.tsx`
  Root layout, providers, theme, navigation, route stack.
- `app/index.tsx`
  Home route.
- `app/discover.tsx`
  Discover/premarket listing route.
- `app/me.tsx`
  Profile route.
- `app/resources.tsx`
  Resources route.
- `app/token/create.tsx`
  Premarket/token creation route.
- `app/token/[premarketId].tsx`
  Premarket detail route.
- `app/+not-found.tsx`
  Not-found route.
- `env.ts`
  Runtime env exports.
- `app.config.js`
  Expo config and env forwarding.
- `babel.config.js`
  Babel plugins and module aliases.
- `tsconfig.json`
  TypeScript config and path aliases.

## Routes And Pages

Routes live in `app/`.

- `app/docs/*.tsx`
  Terms/privacy/risk disclosure pages.
- `app/example/**`
  UI and feature examples/test stand. Read for component usage examples; do not assume production behavior.
- `app/token/*`
  Token/premarket creation and detail routes.

Before route changes, read:

- `app/_layout.tsx`
- the target route file under `app/`
- related screen in `screens/`
- `docs/agents/ARCHITECTURE.md`
- `docs/agents/WORKFLOWS.md`

## Screens

- `screens/PremarketsPage.tsx`
  Discover/list screen.
- `screens/PremarketCreationFlow.tsx`
  Multi-step premarket creation flow.
- `screens/TokenPremarketPage.tsx`
  Premarket detail screen.
- `screens/MeScreen.tsx`
  Profile screen.

Ownership: screens compose domain components, hooks, providers, and services. Keep low-level UI and API details out of screens when shared abstractions exist.

## Components

- `src/components/ui/`
  Project UI primitives: button, text, input, chip, avatar, switch, segmented button, bottom sheet, loader.
- `src/components/base/`
  Lower-level reusable building blocks: containers, SVG icon, calendar/date/time controls, slider, loader, chart, expandable text.
- `src/components/navigation/`
  Top navigation, menu, profile widget, navigation items.
- `src/components/login/`
  Login/wallet UI and user identity widgets.
- `src/components/premarket/`
  Premarket cards, detail sections, join/action UI, bonding curve, vesting, holders, community, creation overview.
- `src/components/token/create/`
  Token/premarket creation forms and process UI.
- `src/components/modals/`
  Shared modals.
- `src/components/user/`
  User card/modal UI.

Before component changes, read nearby components plus `src/theme/*`.
Prefer `src/components/ui/*` and `src/components/base/*` before local one-off styling.

## API Clients

API clients live in `src/services/api/`.

- `http.ts`
  Shared request wrapper, auth token injection, retry/timeout, refresh handling, response parsing.
- `auth.ts`, `wallet.ts`, `token.ts`, `tx_premarket.ts`, `users.ts`, `files.ts`
  Endpoint-specific clients.
- `apiError.ts`, `retry.ts`, `constant.ts`
  API helpers.

Ownership: components and screens should call domain hooks/services instead of raw `fetch` when possible.

Before API changes, read:

- `src/services/api/http.ts`
- the endpoint-specific client
- caller hooks/screens/components
- `src/providers/AuthContext.tsx` if auth is involved

## Hooks And State

Hooks live in `src/hooks/`.

- `usePremarketDraft.ts`
  Draft persistence for premarket creation.
- `usePremarketInfo.ts`, `useHolderEntryInfo.ts`, `useJoinFlow.tsx`
  Premarket data and action helpers.
- `useWalletLoginFlow.ts`, `connectWallet.ts`
  Wallet login/connect behavior.
- `useContentArea.tsx`, `useIsMobile.ts`, `useImageAspectRatio.tsx`, `useSafeRouter.ts`
  UI/layout/router helpers.

Providers:

- `src/providers/AuthContext.tsx`
- `src/providers/LoginModalContext.tsx`
- `src/providers/NetworkContext.tsx`
- `src/providers/NotificationContext.tsx`
- `storage/UserModalContext.tsx`
- `storage/UniversalOverlayProvider.tsx`

Provider composition is in `app/_layout.tsx`.

## Web3, Wallet, And Blockchain

- `storage/wallet-adapter/`
  Platform-specific wallet providers/hooks.
- `src/services/blockchain/solana.tsx`
  Solana connection/network helpers.
- `src/services/blockchain/signAndSend.ts`
  Signing, sending, and finality helpers.
- `src/services/blockchain/premarket/*`
  Premarket transaction actions.
- `src/utils/solana.ts`, `src/utils/phantom.ts`
  Solana/browser wallet helpers.

Ownership: wallet adapters own wallet state; blockchain services own transaction behavior; UI flows own user feedback and navigation.

## Domain Services

- `src/services/premarket/create.ts`
  High-level premarket creation orchestration.
- `src/services/premarket/addCommunityInfo.ts`
  Community metadata support.
- `src/services/files/ipfs/pumpfun.ts`
  Main IPFS upload path.
- `src/services/files/ipfs/pinata.ts`
  Secondary/legacy IPFS path.
- `src/services/fingerprint/*`
  Fingerprint collection/sending.
- `src/services/pumpfun/*`
  Pump.fun conversion/helpers.

## Styles, Theme, Assets

- `src/theme/colors.ts`
- `src/theme/fonts.ts`
- `src/theme/theme.ts`
- `src/theme/types.ts`
- `assets/basic_icon/`
- `src/components/base/SvgIcon.tsx`

Register new SVG icons in `SvgIcon.tsx` before use.

## Tests

No test directory or `test` script is currently present in `package.json`.
If tests are added, update this file and `WORKFLOWS.md`.

## Config

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `babel.config.js`
- `metro.config.js`
- `app.config.js`
- `app.json`
- `vercel.json`
- `global.d.ts`

Do not change config files casually. Check `ARCHITECTURE.md` and `INVARIANTS.md` first.

## Agent Documentation Files

- `docs/agents/README.md`
  Navigation.
- `docs/agents/PROJECT_MAP.md`
  Repository structure and ownership.
- `docs/agents/ARCHITECTURE.md`
  Frontend layers and runtime structure.
- `docs/agents/DOMAIN.md`
  Business entities and scenarios.
- `docs/agents/INVARIANTS.md`
  Rules agents must preserve.
- `docs/agents/UI_SYSTEM.md`
  UI primitives, theme, icons, and responsive rules.
- `docs/agents/FLOWS.md`
  Important user flow maps.
- `docs/agents/KNOWN_GAPS.md`
  Known limitations and stale areas.
- `docs/agents/VALIDATION.md`
  Validation guidance by change type.
- `docs/agents/API_CONTRACTS.md`
  TODO placeholder for frontend/backend API contracts.
- `docs/agents/WEB3_CONTRACTS.md`
  TODO placeholder for Solana/wallet transaction contracts.
- `docs/agents/ERROR_HANDLING.md`
  Notifications, logs, overlays, API errors, transaction errors.
- `docs/agents/STATE_AND_PERSISTENCE.md`
  Providers, storage, auth persistence, draft persistence, modal/overlay state.
- `docs/agents/FEATURE_FLAGS.md`
  Env flags, hardcoded switches, network-dependent settings.
- `docs/agents/TESTING_STRATEGY.md`
  Future testing standards, mock guidance, high-priority test targets.
- `docs/agents/SECURITY_FRONTEND.md`
  Frontend security rules for auth, env, wallet, links, uploads, user content.
- `docs/agents/PERFORMANCE.md`
  Performance risks and review checklist.
- `docs/agents/ROUTING.md`
  Route map, dynamic params, production vs example routes.
- `docs/agents/ASSET_PIPELINE.md`
  SVG/image assets and upload-related asset rules.
- `docs/agents/LOCALIZATION_COPY.md`
  UI copy rules. No i18n system; simple English.
- `docs/agents/OBSERVABILITY.md`
  Logs, fingerprint events, and error visibility.
- `docs/agents/AGENT_PROMPTS.md`
  Reusable prompts for future agent runs.
- `docs/agents/REVIEW_CHECKLIST.md`
  Review and handoff checklist.
- `docs/agents/WORKFLOWS.md`
  Common change recipes.
- `docs/agents/CHANGE_PROTOCOL.md`
  Post-change doc update rules.

## Human Documentation Files

- `README.md`
  Project overview, quick start, scripts, and documentation links.
- `README_DEV.md`
  Compatibility pointer to the current developer docs.
- `docs/README.md`
  Human documentation index.
- `docs/SETUP.md`
  Local setup and run instructions.
- `docs/DEVELOPMENT.md`
  Developer conventions and common development areas.
- `docs/ARCHITECTURE.md`
  Human-readable architecture overview.
- `docs/ENVIRONMENT.md`
  Environment variable reference.
- `docs/TROUBLESHOOTING.md`
  Common setup/runtime/build issues.
- `docs/DEPLOYMENT.md`
  Web deployment notes.
- `CONTRIBUTING.md`
  Contribution and PR expectations.
- `SECURITY.md`
  Human-facing security guidance.
- `.github/ISSUE_TEMPLATE/*`
  Bug report and feature request templates.
- `.github/pull_request_template.md`
  Pull request checklist.
