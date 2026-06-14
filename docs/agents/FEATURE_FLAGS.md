# Feature Flags

Agent-facing guide for feature flags, env-driven switches, and network-dependent behavior.

## Source File

Feature/env exports live in `env.ts`.

Related config:

- `app.config.js`
- `babel.config.js`
- `tsconfig.json`

## Current Flags And Switches

### `IsVestingEnable`

Exported from `env.ts`.

Current code:

- Hardcoded to `true`.
- Previous env-driven logic is commented out.

Used by:

- `screens/PremarketCreationFlow.tsx`

Behavior:

- Controls whether the vesting step is included in premarket creation.
- Affects total step count and next-step behavior.

High risk:

- Do not assume `IS_VESTING_ENABLE` env currently controls this flag.
- If re-enabling env control, update creation flow docs and validation expectations.

### `IS_DISCOVERY_FILTER_ENABLED`

Exported from `env.ts`.

Current code:

- Defaults to `false`.
- Reads `ENV.IS_DISCOVERY_FILTER_ENABLED`, but web `getEnv` currently does not populate it.

High risk:

- Verify actual env loading before relying on this flag.
- Update this file if wiring changes.

### `NETWORK`

Exported from `env.ts`.

Current code:

- Type allows `"devnet" | "mainnet-beta"`.
- Defaults to `"devnet"`.
- Used to select `TOKEN_CONVERTOR_SETTINGS`.

High risk:

- Network behavior affects Solana assumptions and token conversion settings.
- Do not change defaults without checking wallet/web3 and backend expectations.

### `TOKEN_CONVERTOR_SETTINGS`

Exported from `env.ts`.

Behavior:

- Selects different numeric settings for `devnet` vs non-`devnet`.

High risk:

- Treat these values as domain/contract-sensitive.
- Do not adjust without backend/web3 context.

## Required Env Values

These currently throw through `getRequired` when missing:

- `PINATA_JWT`
- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`
- `HOST_BACKEND`
- `HELIUS_KEY`
- `TRITON_URL`

Because required values throw at import time, be careful importing env-dependent modules into tests, examples, or unsupported platform paths.

## Feature Flag Change Checklist

- Confirm where the flag is loaded.
- Confirm whether the flag is truly env-driven or hardcoded.
- Trace all callers.
- Check default behavior.
- Check web/native behavior separately.
- Update `KNOWN_GAPS.md` if a flag is partially wired.
- Update `DOMAIN.md`, `FLOWS.md`, or `WEB3_CONTRACTS.md` when the flag changes business or transaction semantics.
