# Testing Strategy

Agent-facing testing strategy for future tests.
Current repo state: no `test` script and no documented test directory.

## Current Status

- No `npm test` script exists.
- No dedicated test folder is documented.
- No standard mocking setup is documented.
- `VALIDATION.md` is the current source for available checks.

Do not claim automated test coverage exists unless current code proves it.

## When Adding Tests

Update these files in the same task:

- `package.json` if a test script is added.
- `docs/agents/PROJECT_MAP.md` with test locations.
- `docs/agents/VALIDATION.md` with test commands.
- `docs/agents/WORKFLOWS.md` with the test workflow.
- `docs/agents/CHANGE_PROTOCOL.md` if the required checks change.

## Suggested Test Ownership

Use this as a future standard unless the repo adopts another one:

- Component tests
  For shared primitives and domain UI with meaningful branching.
- Hook tests
  For reusable state logic such as drafts, wallet login helpers, and data normalization.
- Service tests
  For API clients, data conversion, and pure domain services.
- Utility tests
  For formatting, validators, math, vesting, URL, image, and Solana helpers.
- Flow/integration tests
  For login, wallet connect, premarket creation, premarket actions, and claim flows.

## High-Priority Test Targets

Add tests first around:

- `src/hooks/usePremarketDraft.ts`
- `src/services/api/http.ts`
- `src/utils/vesting.ts`
- `src/utils/premarket.ts`
- `src/utils/imageValidation.ts`
- premarket creation form data transitions,
- auth token setup/cleanup,
- wallet disconnected and unsupported-network branches.

## Mocking Guidance

Future tests will likely need mocks for:

- `@react-native-async-storage/async-storage`
- `window.localStorage`
- Expo Router navigation
- `env.ts`
- backend API responses
- Phantom wallet / wallet adapter
- Solana connection and transaction finality
- IPFS upload services

Do not make real backend, wallet, Solana, or IPFS calls in tests.

## Test Change Checklist

- Tests do not depend on real secrets.
- Tests do not depend on a real wallet.
- Tests do not depend on live backend/Solana/IPFS services.
- Test commands are documented in `VALIDATION.md`.
- New test locations are documented in `PROJECT_MAP.md`.
