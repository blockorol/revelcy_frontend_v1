# Invariants

Rules AI agents must preserve unless the user explicitly asks to change them.
For known limitations and missing validation/tooling, read `docs/agents/KNOWN_GAPS.md`.

## Auth And Session

- Do not bypass auth/session checks.
- Do not store JWTs in new locations without explicit need.
- Do not log JWTs, bearer tokens, decoded sensitive payloads, or refresh details.
- Keep `AuthContext` and `http.setAuthToken` behavior consistent.
- Preserve logout cleanup: user state, local storage token, and HTTP auth token must be cleared.

## API Contracts

- Do not change route names, API request shapes, response assumptions, or endpoint paths without explicit request and caller audit.
- Keep endpoint-specific API code in `src/services/api/*` where possible.
- Do not replace shared HTTP retry/refresh behavior with local one-off `fetch` calls.
- Preserve error/status propagation expected by callers.

## Wallet, Web3, And Transactions

- Do not bypass wallet connection or signature flow.
- Do not assume native wallet behavior is equivalent to web.
- Do not change Phantom/Solana assumptions without checking wallet adapter code.
- Do not change transaction, claim, finish, join, leave, extend, or vesting semantics without tracing backend and blockchain contracts.
- Do not swallow transaction errors silently; user-facing flows should notify or surface failure.
- Do not log private keys, signatures, full sensitive transaction payloads, or secrets.

## Env And Config

- Do not commit real secrets.
- Do not add required env variables without documenting them in agent docs.
- Do not mix server-only and browser-only code.
- Be careful with `env.ts` imports because required env values throw at module load.
- Keep aliases synchronized across `tsconfig.json` and `babel.config.js` when aliases change.

## Routing And State

- Do not rename routes or dynamic params without updating all links and router pushes.
- Do not reorder root providers in `app/_layout.tsx` without checking dependencies between providers.
- Do not move state from provider/hook layers into low-level UI components when shared behavior is needed.
- Preserve premarket draft restore/clear semantics when changing creation steps.

## UI And Responsive Layout

- Use shared primitives from `src/components/ui/*`, `src/components/base/*`, and `src/theme/*` before local styling hacks.
- Do not break mobile-width layouts while fixing desktop, or desktop while fixing mobile.
- Keep text and controls inside their containers.
- Register SVG icons in `src/components/base/SvgIcon.tsx` before use.

## Domain Behavior

- Do not change whitelist behavior casually.
- Do not change vesting enablement, vesting data shape, or claim assumptions without checking `src/utils/vesting.ts` and related components/services.
- Do not change premarket deadline/goal validation without checking creation flow and backend/blockchain expectations.
- Do not change metadata/IPFS upload path without tracing `src/services/premarket/create.ts` and `src/services/files/ipfs/*`.

## Documentation

- If code changes affect structure, architecture, domain behavior, invariants, or workflows, update `docs/agents/*` in the same task.
- Do not recreate `.github/copilot-instructions.md`; `AGENTS.md` is the current agent entrypoint.
