# Troubleshooting

Common issues when running the Revelcy frontend.

## Missing Environment Value

Symptoms:

- app fails during startup,
- error like `<NAME> is required`.

Check:

- `.env` exists locally,
- required variables in [ENVIRONMENT.md](ENVIRONMENT.md) are set,
- deployment env contains the same required values.

## Backend Unavailable

Symptoms:

- API requests fail,
- auth/login does not complete,
- premarket data is missing.

Check:

- `HOST_BACKEND`,
- backend server availability,
- browser network tab,
- API client caller in `src/services/api/*`.

## Wallet Not Connected

Symptoms:

- wallet-dependent flows fail,
- premarket launch or join cannot proceed.

Check:

- Phantom is installed,
- wallet is connected,
- selected network is supported,
- browser wallet permissions.

## Build Fails

Run:

```bash
npm run build
```

Check:

- missing env values,
- invalid imports,
- alias mismatches,
- package install state.

## Premarket Draft Looks Stale

Premarket creation draft data is persisted through `src/hooks/usePremarketDraft.ts`.

Try:

- use the flow's clear/remove draft UI when available,
- clear browser local storage for the site in development.

## Example Route Confusion

`app/example/**` is an example/test stand area.
Do not assume every example route is production behavior.

## No Lint/Test/Typecheck Script

This repo currently does not define:

- `lint`
- `test`
- `typecheck`
- `format`

Use `npm run build` for build-sensitive validation until dedicated scripts are added.
