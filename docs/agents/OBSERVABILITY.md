# Observability

Agent-facing guide for logs, telemetry-like behavior, and fingerprint events.

## Current Status

No formal analytics or observability platform is documented in this frontend.
Existing observable behavior is mostly:

- console logs,
- user notifications,
- fingerprint events,
- backend/API error details,
- wallet/transaction failure handling.

## Relevant Files

- `src/services/fingerprint/collector.ts`
- `src/services/fingerprint/sender.ts`
- `src/services/fingerprint/dto.ts`
- `src/services/fingerprint/types.ts`
- `src/providers/NotificationContext.tsx`
- `src/providers/AuthContext.tsx`
- `src/services/api/http.ts`
- `src/services/blockchain/signAndSend.ts`

## Logging Rules

- Do not log JWTs, bearer tokens, private keys, secrets, or sensitive transaction payloads.
- Use console logs for developer diagnostics only.
- Pair user-affecting failures with user-visible notifications.
- Avoid noisy logs in render loops or frequently called hooks.

## Fingerprint Events

Fingerprint code exists under `src/services/fingerprint/*`.
`AuthContext` sends additional info on logout.

Rules:

- Do not add new fingerprint/user events casually.
- Do not include secrets or sensitive wallet/auth payloads.
- If adding events, document event intent and data shape in this file.

## Error Visibility

For user-facing error behavior, read `docs/agents/ERROR_HANDLING.md`.

Rules:

- User-visible failures should not be only console logs.
- Developer-only details should not be shown to users if sensitive or confusing.
- Preserve useful HTTP status/details for debugging where callers expect them.

## Before Observability Changes

Read:

- `docs/agents/SECURITY_FRONTEND.md`
- `docs/agents/ERROR_HANDLING.md`
- target fingerprint/logging/API/wallet files.

## After Observability Changes

Check:

- no sensitive data is logged or sent,
- logs are not noisy,
- user-facing failures remain visible,
- any new event shape is documented here.
