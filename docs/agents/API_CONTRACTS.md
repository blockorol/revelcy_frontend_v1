# API Contracts

Placeholder for frontend/backend API contract notes.

## Status

TODO: Fill this file in a session/agent that has access to both:

- this frontend repository,
- the Revelcy backend repository,
- current backend API routes/schemas/contracts.

Do not infer final API contracts from frontend code alone.

## Intended Scope

When completed, this file should document:

- frontend API client ownership in `src/services/api/*`,
- backend endpoint groups used by each client,
- request and response shapes that frontend depends on,
- auth/session requirements per endpoint group,
- error/status assumptions,
- pagination/filter/sort assumptions,
- file upload assumptions,
- premarket/token/user/wallet API dependencies,
- which frontend flows depend on which backend contracts.

## Current Frontend Client Map

Use this as a starting inventory only:

- `src/services/api/http.ts`
  Shared HTTP wrapper, auth token attachment, refresh, retry, timeout, response parsing.
- `src/services/api/auth.ts`
  Auth API client.
- `src/services/api/wallet.ts`
  Wallet-related API client.
- `src/services/api/users.ts`
  User API client.
- `src/services/api/token.ts`
  Token/premarket API client.
- `src/services/api/tx_premarket.ts`
  Premarket transaction API client.
- `src/services/api/files.ts`
  File API client.
- `src/services/api/apiError.ts`, `src/services/api/retry.ts`, `src/services/api/constant.ts`
  API helpers.

## Rules Until Completed

- Do not change backend-facing request/response assumptions without backend contract context.
- Do not treat this placeholder as contract authority.
- For API contract changes, ask for backend context or use an agent with access to both repos.
- If frontend code and backend docs disagree, current backend implementation wins only after direct verification.
