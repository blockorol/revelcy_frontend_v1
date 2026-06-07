# Error Handling

Agent-facing guide for user-visible errors, logs, loading states, and recovery paths.

## Main Error Surfaces

- `src/providers/NotificationContext.tsx`
  Snackbar queue with `info`, `success`, `warning`, and `error` helpers.
- `storage/UniversalOverlayProvider.tsx`
  Global overlay for blocking progress states such as premarket launch.
- `src/services/api/http.ts`
  HTTP timeout/retry/refresh/error wrapping.
- `src/services/blockchain/signAndSend.ts`
  Transaction signing/sending/finality helpers.
- `screens/PremarketCreationFlow.tsx`
  Creation-flow user feedback, launch overlay, wallet/network/data validation errors.

## Notification Rules

Use `useNotification()` for user-visible operational errors.

Preferred patterns:

- `notify.error("message", { suggest: "next step" })` for failures the user can act on.
- `notify.warning(...)` for risky but non-blocking states.
- `notify.success(...)` for completed actions when the UI does not already make success obvious.
- Add `action` when the recovery action is clear, such as connecting a wallet.

Do not replace project notifications with browser `alert` or ad hoc modal errors.

## Console Logging

Use console logging sparingly:

- `console.error` is acceptable for developer diagnostics in failure branches.
- User-facing flows should also notify the user when the error affects them.
- Never log JWTs, bearer tokens, private keys, secrets, full sensitive transaction payloads, or wallet-sensitive material.

## API Errors

`src/services/api/http.ts` wraps failed responses with:

- `Error.message`
- optional `status`
- optional `details`

When changing API callers:

- Preserve status/detail handling expected by callers.
- Do not swallow errors unless the UI has a deliberate fallback.
- Keep auth refresh behavior centralized in `http.ts`.

## Wallet And Transaction Errors

Wallet/web3 errors are high risk.

Rules:

- Keep disconnected wallet paths user-visible.
- Keep unsupported network paths user-visible.
- Do not hide transaction signing/sending/finality failures.
- Prefer notification plus recovery suggestion.
- Preserve overlay cleanup in `finally` blocks when blocking UI is used.

## Loading And Blocking States

Use local loading states for component-level data.
Use `UniversalOverlayProvider` for blocking multi-step operations that should not be interrupted visually.

For premarket launch, `screens/PremarketCreationFlow.tsx` owns:

- `launchState`
- overlay open/replace/close
- progress text
- cleanup after failure/success

Do not leave overlays open after failed async paths.

## Error Handling Checklist

Before finishing an error-handling change:

- User can see actionable failure feedback.
- Sensitive values are not logged.
- Async cleanup runs on success and failure.
- API errors still preserve useful status/details.
- Wallet/transaction failures are not silently swallowed.
- `INVARIANTS.md` still holds.
