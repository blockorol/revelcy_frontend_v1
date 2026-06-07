# Frontend Security

Agent-facing security guide for the Revelcy frontend.

## High-Risk Security Areas

- Auth/session: `src/providers/AuthContext.tsx`, `src/services/api/http.ts`
- Env/config: `env.ts`, `app.config.js`, `babel.config.js`
- Wallet/web3: `storage/wallet-adapter/*`, `src/services/blockchain/*`
- File/IPFS upload: `src/services/files/ipfs/*`, `src/services/api/files.ts`
- External links/social links: `src/utils/openLinks.ts`, `src/utils/url.ts`, community/token link UI
- User-controlled images/text: token/community forms and premarket display components

## Secrets And Env

- Never commit real secrets.
- Treat web env values as client-exposed unless proven otherwise.
- Do not add private keys or backend-only secrets to frontend runtime code.
- Do not log env values.
- Be careful with `env.ts`: required values throw at import time.

## Auth And Tokens

- Do not log JWTs or bearer tokens.
- Keep auth token setup/cleanup centralized through `AuthContext` and `http.setAuthToken`.
- Do not store JWTs in new places without explicit need.
- Preserve logout cleanup.
- Avoid adding token data to URLs or route params.

## Wallet And Web3 Safety

- Do not bypass wallet signature flow.
- Do not auto-trigger signing without clear user action.
- Do not trust frontend-only checks for transaction authority.
- Do not log signatures, private material, or sensitive transaction payloads.
- Preserve disconnected-wallet and unsupported-network handling.

## User Content And Links

User-controlled fields can include token names, descriptions, avatars, banners, and social/community links.

Rules:

- Validate URLs with existing utilities where possible.
- Do not render untrusted HTML.
- Do not add dangerous link behavior such as implicit script execution.
- Keep image validation in place for uploaded/selected images.
- Treat external links as untrusted.

## File And IPFS Uploads

Relevant files:

- `src/services/files/ipfs/pumpfun.ts`
- `src/services/files/ipfs/pinata.ts`
- `src/services/api/files.ts`
- `src/utils/imageValidation.ts`

Rules:

- Do not upload secrets or auth tokens.
- Keep image/file validation behavior unless explicitly changing it.
- Do not swap upload providers without tracing premarket creation.

## Security Review Checklist

- No secrets in tracked files.
- No sensitive logs.
- Auth/session cleanup still works.
- Wallet signing remains explicit.
- External links and user content remain constrained.
- Env changes do not expose backend-only values.
- API/web3 contract changes are verified with authoritative context.
