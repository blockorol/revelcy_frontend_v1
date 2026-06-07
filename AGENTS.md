# AGENTS.md

Primary entry point for Codex and other AI agents working in this frontend repo.
Keep this file short and operational. For detail, read `docs/agents/README.md`.

## First Step

Before non-trivial changes, read:

1. `docs/agents/README.md`
2. The specific agent doc it points to for the area you are touching.

Do not change application code when the user asks only for a plan, analysis, review, or documentation.

## Project Snapshot

Revelcy Frontend is a web-first Expo / React Native app for token premarket flows.
It uses Expo Router, TypeScript, React Native Paper, backend REST APIs, Solana/Phantom wallet logic, and IPFS upload services.

Current practical target: **web**.
Native Android/iOS scaffolding exists, but do not assume native behavior is complete unless code and the user request prove it.

## Commands

Available scripts from `package.json`:

- Install: `npm install`
- Dev: `npm run web` or `npm start`
- Build: `npm run build`
- Serve build: `npm run serve`
- Android target: `npm run android`
- iOS target: `npm run ios`

Not currently defined:

- Lint: no `lint` script
- Test: no `test` script
- Typecheck: no `typecheck` script

If validation is needed, run the narrowest available command and state any validation gap.

## High-Risk Areas

Treat these areas as high risk:

- Auth/session: `src/providers/AuthContext.tsx`, `src/services/api/http.ts`
- API clients: `src/services/api/*`
- State/providers: `app/_layout.tsx`, `src/providers/*`, `storage/*`
- Routing/layouts: `app/*`, `screens/*`
- Env/config: `env.ts`, `app.config.js`, `babel.config.js`, `tsconfig.json`
- Wallet/web3/Solana: `storage/wallet-adapter/*`, `src/services/blockchain/*`, `src/utils/solana.ts`, `src/utils/phantom.ts`
- Premarket transactions and creation: `screens/PremarketCreationFlow.tsx`, `src/services/premarket/*`, `src/services/blockchain/premarket/*`
- IPFS/metadata upload: `src/services/files/ipfs/*`

Never log or commit secrets. Never bypass wallet signature, auth/session, transaction, claim, or vesting semantics without explicit user direction and contract verification.

## Agent Docs

- `docs/agents/README.md` - navigation for all agent docs.
- `docs/agents/PROJECT_MAP.md` - where files live and what owns what.
- `docs/agents/ARCHITECTURE.md` - frontend layers and runtime structure.
- `docs/agents/DOMAIN.md` - business entities and user scenarios.
- `docs/agents/INVARIANTS.md` - rules agents must preserve.
- `docs/agents/UI_SYSTEM.md` - UI primitives, theme, icons, and responsive rules.
- `docs/agents/FLOWS.md` - important user flow maps.
- `docs/agents/KNOWN_GAPS.md` - known limitations and stale areas.
- `docs/agents/VALIDATION.md` - validation guidance by change type.
- `docs/agents/API_CONTRACTS.md` - TODO placeholder for frontend/backend API contracts.
- `docs/agents/WEB3_CONTRACTS.md` - TODO placeholder for Solana/wallet transaction contracts.
- `docs/agents/ERROR_HANDLING.md` - notifications, logs, overlays, API and transaction error handling.
- `docs/agents/STATE_AND_PERSISTENCE.md` - providers, storage, draft persistence, modal/overlay state.
- `docs/agents/FEATURE_FLAGS.md` - env flags, hardcoded switches, network-dependent settings.
- `docs/agents/TESTING_STRATEGY.md` - future testing standards and high-priority test targets.
- `docs/agents/SECURITY_FRONTEND.md` - frontend security rules for auth, env, wallet, links, uploads.
- `docs/agents/PERFORMANCE.md` - performance risks for lists, images, hooks, async flows.
- `docs/agents/REVIEW_CHECKLIST.md` - review and handoff checklist.
- `docs/agents/WORKFLOWS.md` - recipes for common changes.
- `docs/agents/CHANGE_PROTOCOL.md` - post-change checks and doc update rules.

Shared repo skills:

- `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md`
- `.agents/skills/revelcy-agent-doc-full-refresh/SKILL.md`

Adapters:

- Cursor: `.cursor/rules/revelcy-agent-docs.mdc`
- Claude: `CLAUDE.md`

`.github/copilot-instructions.md` is retired. Do not recreate it unless explicitly requested.
