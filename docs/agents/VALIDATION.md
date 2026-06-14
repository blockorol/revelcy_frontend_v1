# Validation

Validation guide for AI agents. Use this after changes and before final response.
For review mode and handoff checks, read `docs/agents/REVIEW_CHECKLIST.md`.
For future test standards, read `docs/agents/TESTING_STRATEGY.md`.

## Current Commands

Available:

- Install: `npm install`
- Dev web: `npm run web`
- Dev generic: `npm start`
- Build web: `npm run build`
- Serve build: `npm run serve`
- Android target: `npm run android`
- iOS target: `npm run ios`

Not currently available:

- Format: no `format` script
- Lint: no `lint` script
- Typecheck: no `typecheck` script
- Tests: no `test` script

If a test script or test directory is added, update `TESTING_STRATEGY.md`.

## Docs-Only Changes

For changes limited to `AGENTS.md`, `docs/agents/*`, `.agents/skills/*`, `.cursor/rules/*`, or `CLAUDE.md`:

- Do not run app validation unless the user asks.
- Run `git status --short --untracked-files=all`.
- Confirm no application files changed.

## UI Changes

Preferred checks:

- `npm run build` when build impact is plausible.
- `npm run web` for interactive/manual inspection when needed.
- Manual mobile and desktop responsive check when feasible.

Also inspect:

- text overflow,
- button/control sizing,
- loading/empty/error states,
- route-level layout with top navigation.

## API Client Changes

Preferred checks:

- Build if imports/types may be affected: `npm run build`.
- Manual runtime check if endpoint behavior is user-visible.

Also inspect:

- `src/services/api/http.ts` behavior,
- auth token attachment,
- refresh/retry/error handling,
- callers of changed client functions.

## Auth / Session Changes

Preferred checks:

- Login state.
- Logout state.
- Refresh/error handling if touched.
- `npm run build` if imports/types changed.

Also inspect:

- `src/providers/AuthContext.tsx`,
- `src/services/api/http.ts`,
- `src/components/login/*`.

## Wallet / Web3 Changes

Preferred checks:

- Wallet disconnected path.
- Wallet connected path.
- Unsupported/wrong network path.
- Transaction failure path.
- `npm run build` if imports/types changed.

Manual verification is usually required.
State any unverified transaction paths in final response.

## Env / Config Changes

Preferred checks:

- `npm run build` when config affects bundling.
- `npm run web` when runtime env behavior changed.

Also inspect:

- import-time env failures,
- Expo extra/process env path,
- native `@env` path if touched,
- alias sync between `tsconfig.json` and `babel.config.js`.

## Dependency Changes

Preferred checks:

- `npm install` only when dependency state needs updating.
- `npm run build` after dependency changes.

Do not run dependency installs casually for docs-only tasks.

## Final Response Format

Mention:

- validation commands run,
- checks skipped and why,
- remaining risk,
- whether app code changed.
