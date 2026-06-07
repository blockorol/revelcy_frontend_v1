# Review Checklist

Use this when asked to review changes or before handing a branch to another agent.
Lead with risks and concrete file references in review responses.

## Scope Check

- Does the change match the user request?
- Did it avoid unrelated refactors?
- Did it avoid app-code changes for docs-only tasks?
- Are unrelated working-tree changes preserved?

## Routing And Navigation

- Route names and dynamic params are unchanged unless requested.
- Router pushes/links match `app/` structure.
- Example routes are not confused with production routes.
- Navigation works for mobile and desktop layouts.

## Auth And API

- Auth/session checks are not bypassed.
- JWT/token handling remains centralized.
- API clients preserve request/response assumptions.
- HTTP retry/refresh/error behavior is not replaced by local ad hoc fetch logic.
- Sensitive values are not logged.

## State And Persistence

- Provider order in `app/_layout.tsx` still supports consumers.
- Shared state remains in hooks/providers.
- Premarket draft shape/version/restore behavior is preserved.
- Logout and clear flows still remove relevant state.

## Wallet, Web3, And Transactions

- Wallet disconnected and unsupported network states are handled.
- Signature flow is not bypassed.
- Transaction errors are user-visible.
- Claim/vesting/join/finish semantics are not changed without contract context.
- Frontend-only assumptions are not treated as authoritative contracts.

## UI And Responsive

- Shared primitives/theme are used where appropriate.
- No unnecessary local design-system fork.
- Text fits containers.
- Mobile and desktop layouts remain coherent.
- Loading, empty, and error states are handled.

## Env And Config

- No real secrets are committed.
- Required env changes are documented.
- Browser-only and server-only assumptions are not mixed.
- Aliases remain synchronized if changed.

## Validation

- Relevant checks from `VALIDATION.md` were run or clearly skipped.
- Missing scripts are called out.
- UI changes received visual/responsive inspection when feasible.
- High-risk wallet/API/env changes disclose unverified paths.

## Agent Docs

- `CHANGE_PROTOCOL.md` was applied.
- Agent docs were updated when structure, architecture, domain behavior, invariants, flows, UI system, feature flags, validation, or known gaps changed.
- Shared skills/adapters still point to the current docs.

## Review Output Shape

For code review:

1. Findings first, ordered by severity.
2. File/line references where possible.
3. Open questions or assumptions.
4. Brief summary only after findings.

If no issues are found, say so and mention remaining validation gaps.
