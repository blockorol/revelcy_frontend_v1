# Workflows

Recipes for common frontend changes. Read `INVARIANTS.md` before high-risk changes.

## Add A Page Or Route

Read:

- `app/_layout.tsx`
- nearby files in `app/`
- related screen in `screens/`
- `docs/agents/ARCHITECTURE.md`

Change:

- Add route under `app/`.
- Put substantial screen logic in `screens/`.
- Use Expo Router conventions.
- Use `useSafeRouter` if nearby code does.

Check:

- Route links/router pushes.
- Mobile and desktop layout.
- `PROJECT_MAP.md` if route structure changed.

## Add Or Change A Component

Read:

- nearby domain components,
- `src/components/ui/*`,
- `src/components/base/*`,
- `src/theme/*`,
- `docs/agents/UI_SYSTEM.md`.

Change:

- Use existing primitives first.
- Put domain-specific UI under its domain folder.
- Keep props typed and narrow.
- Register icons in `src/components/base/SvgIcon.tsx` when needed.

Check:

- Responsive layout.
- Theme consistency.
- `PROJECT_MAP.md` if component ownership changed.
- `UI_SYSTEM.md` if shared UI rules changed.

## Change An API Client

Read:

- `src/services/api/http.ts`
- target file in `src/services/api/*`
- caller hooks/screens/components
- `src/providers/AuthContext.tsx` if auth is involved
- `docs/agents/ERROR_HANDLING.md`.

Change:

- Keep endpoint logic in `src/services/api/*`.
- Use shared `http` wrapper unless there is a strong reason not to.
- Preserve retry/refresh/error behavior expected by callers.

Check:

- Request/response shape.
- Auth token behavior.
- Error handling.
- `ARCHITECTURE.md` and `DOMAIN.md` if behavior changed.

## Change A Form

Read:

- target form in `src/components/token/create/*` or nearby domain folder,
- shared types such as `src/components/token/create/interface.tsx`,
- parent screen/flow,
- relevant validation utilities in `src/utils/*`.

Change:

- Keep form data shape aligned with parent flow and services.
- Update preset/restore behavior if draft data is involved.
- Keep validation close to existing patterns.

Check:

- Back/next/close behavior.
- Draft restore/clear behavior.
- Mobile/desktop layout.
- `DOMAIN.md` if scenario behavior changed.

## Change An Auth-Protected Flow

Read:

- `src/providers/AuthContext.tsx`
- `src/services/api/http.ts`
- `src/components/login/*`
- `src/hooks/useWalletLoginFlow.ts`
- target screen/component
- `docs/agents/STATE_AND_PERSISTENCE.md`
- `docs/agents/ERROR_HANDLING.md`.

Change:

- Preserve login/logout/token setup.
- Keep session-sensitive UI guarded.
- Do not log tokens or sensitive decoded payloads.

Check:

- Logged out state.
- Logged in state.
- Token refresh/error handling.
- `INVARIANTS.md` if auth rules changed.

## Change Wallet/Web3 Transaction Flow

Read:

- `storage/wallet-adapter/*`
- `src/services/blockchain/solana.tsx`
- `src/services/blockchain/signAndSend.ts`
- target file under `src/services/blockchain/premarket/*`
- caller flow/component.

Change:

- Keep wallet connection and signature requirements intact.
- Keep transaction construction/sending in blockchain services.
- Keep user notifications/overlays in UI-facing flow code.
- Treat native and web wallet paths separately.

Check:

- Wallet disconnected state.
- Wrong/unsupported network state.
- Transaction failure state.
- Finality/navigation behavior.
- `ARCHITECTURE.md`, `DOMAIN.md`, and `INVARIANTS.md` if semantics changed.

## Add Env Config

Read:

- `env.ts`
- `app.config.js`
- `babel.config.js`
- `docs/agents/INVARIANTS.md`
- `docs/agents/FEATURE_FLAGS.md`

Change:

- Add variable type in `EnvVars`.
- Add web loading from Expo extra/process env.
- Add native loading only if needed.
- Decide required vs optional explicitly.

Check:

- No real secret values in tracked files.
- Import-time failure behavior.
- `AGENTS.md`, `PROJECT_MAP.md`, and `ARCHITECTURE.md` if env behavior changed.

## Add A Test

Current state:

- No `test` script.
- No documented test directory.

When adding tests:

- Add or document the test command in `package.json`.
- Keep tests near the tested code or in a clear test folder.
- Update `PROJECT_MAP.md`, `WORKFLOWS.md`, and `CHANGE_PROTOCOL.md`.

Check:

- Test command runs.
- TypeScript compatibility.

## Change Styling Or Design System

Read:

- `src/theme/*`
- `src/components/ui/*`
- `src/components/base/*`
- nearby components
- `docs/agents/UI_SYSTEM.md`

Change:

- Prefer theme or shared primitive changes when behavior is shared.
- Prefer local style only for local layout details.
- Avoid duplicating colors/tokens that already exist.

Check:

- Mobile and desktop.
- Text overflow.
- Button/control sizing.
- `PROJECT_MAP.md` if design-system ownership changed.
- `UI_SYSTEM.md` if UI rules changed.

## Premarket Creation Flow

Read:

- `screens/PremarketCreationFlow.tsx`
- `src/components/token/create/*`
- `src/components/premarket/creationFlow/OverviewPremarketCreation.tsx`
- `src/hooks/usePremarketDraft.ts`
- `src/services/premarket/create.ts`
- `src/services/blockchain/premarket/createPremarket.ts`

Change:

- Keep step order, data shape, draft behavior, launch state, overlay, and navigation aligned.
- Update shared types when step data changes.

Check:

- Restore from draft.
- Close/back/next behavior.
- Launch failure and success paths.
- Wallet disconnected path.
- `DOMAIN.md` and `INVARIANTS.md` if business behavior changed.

## After Any Code Change

1. Use `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md`.
2. Use `docs/agents/VALIDATION.md` to choose checks.
3. Update `docs/agents/*` if structure, architecture, domain behavior, invariants, or workflows changed.
4. Run `git status --short`.
5. In the final response, state validation and whether agent docs were updated.
