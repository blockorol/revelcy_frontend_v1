# Deployment

Deployment notes for the Revelcy frontend web target.

## Build

Create a web export:

```bash
npm run build
```

Output directory:

```text
web-build
```

Serve locally:

```bash
npm run serve
```

## Hosting

The repository includes `vercel.json`, so Vercel/static web deployment is expected.

Verify deployment settings match:

- build command: `npm run build`
- output directory: `web-build`
- required environment variables from [ENVIRONMENT.md](ENVIRONMENT.md)

## Environment

Deployment must provide required env values:

- `HOST_BACKEND`
- `PINATA_JWT`
- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`
- `HELIUS_KEY`
- `TRITON_URL`

Optional:

- `NETWORK`
- `IS_DISCOVERY_FILTER_ENABLED`
- `IS_VESTING_ENABLE`, if env-based vesting is re-enabled in code

## Pre-Deploy Checks

- `npm install`
- `npm run build`
- verify expected `NETWORK`
- verify backend API target
- verify wallet flow on deployed domain
- verify premarket discovery/detail pages
- verify token creation flow only when using the intended environment/network

## Native Targets

Android/iOS scripts are not deployment targets documented here.
This deployment doc is for the web export.
