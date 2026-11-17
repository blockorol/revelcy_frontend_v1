# API

Human-facing API documentation placeholder for the Revelcy frontend.

## Status

Detailed API contracts are pending.

The complete API reference should be produced with access to both:

- this frontend repository,
- the Revelcy backend repository.

Do not treat frontend usage alone as the authoritative backend contract.

## Frontend API Clients

Frontend API clients live in `src/services/api/`.

Current client areas:

- `http.ts` - shared HTTP wrapper, auth token attachment, refresh, retry, timeout, response parsing.
- `auth.ts` - authentication API calls.
- `wallet.ts` - wallet-related API calls.
- `users.ts` - user API calls.
- `token.ts` - token/premarket API calls.
- `tx_premarket.ts` - premarket transaction API calls.
- `files.ts` - file API calls.
- `apiError.ts`, `retry.ts`, `constant.ts` - API helpers.

## Development Guidance

- Add endpoint-specific calls under `src/services/api/*`.
- Prefer the shared `http` wrapper over raw `fetch`.
- Keep auth token behavior centralized.
- Verify backend request/response contracts before changing API behavior.
- Update [ENVIRONMENT.md](ENVIRONMENT.md) if API configuration changes.

## Related Docs

- [Architecture](ARCHITECTURE.md)
- [Development](DEVELOPMENT.md)
- [Environment](ENVIRONMENT.md)
