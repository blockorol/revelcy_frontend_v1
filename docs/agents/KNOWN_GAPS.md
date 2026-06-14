# Known Gaps

Known limitations and stale areas agents should account for.

## Platform Support

- The app is web-first.
- Android/iOS scripts exist, but native behavior is not guaranteed complete.
- Wallet behavior is split by platform; do not assume native support mirrors web.

## Validation Scripts

`package.json` currently lacks:

- `lint`
- `test`
- `typecheck`
- `format`

Available validation is limited to existing scripts such as `npm run build` and `npm run web`.
State validation gaps clearly in final responses.

## Documentation Drift

- Older README files may contain stale aliases, encoding artifacts, or broader platform claims.
- `AGENTS.md` and `docs/agents/*` are the preferred agent docs.
- `.github/copilot-instructions.md` is retired and should not be recreated unless explicitly requested.

## Examples Area

- `app/example/**` is a UI/feature example stand.
- Use it to inspect component behavior.
- Do not assume example routes are production behavior.

## IPFS Paths

- `src/services/files/ipfs/pumpfun.ts` is the main path according to current project notes.
- `src/services/files/ipfs/pinata.ts` exists as secondary/legacy support.
- Do not remove or swap these assumptions without tracing creation flow.

## Backend/Web3 Contracts

- `docs/agents/API_CONTRACTS.md` is currently a TODO placeholder.
- `docs/agents/WEB3_CONTRACTS.md` is currently a TODO placeholder.
- For contract-level changes, use an agent/session with access to both frontend and backend or explicit contract context.

## UI Checks

- No automated visual regression setup is documented.
- UI changes require manual mobile/desktop inspection when feasible.
- Responsive behavior depends on hooks and local styles rather than a single layout framework.

## Env Behavior

- `env.ts` required values can throw at import time.
- Be careful when importing env-dependent code into examples, tests, or unsupported platform paths.
- Do not document or commit real secret values.
- `docs/agents/FEATURE_FLAGS.md` tracks known hardcoded or partially wired flags.

## Tests

- No test directory or test workflow is currently documented.
- If tests are added, update `PROJECT_MAP.md`, `WORKFLOWS.md`, `VALIDATION.md`, and `CHANGE_PROTOCOL.md`.
- `docs/agents/TESTING_STRATEGY.md` defines the future testing standard until real tests exist.
