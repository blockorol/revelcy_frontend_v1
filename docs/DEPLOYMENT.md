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
- optional live-mode environment variables from [ENVIRONMENT.md](ENVIRONMENT.md)

## Environment

The default web export runs on static hosting. Serve existing files as-is and route app URLs such as `/discover` and `/token/lilpups` to the Expo app entry point.

Live web deployments must set `REVELCY_WEB_MODE=live` and provide:

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
- In snapshot mode, check About, Explore and all three token pages with the backend blocked. Confirm the Pump.fun covers fall back to their local copies when the image CDN is blocked. Check that write actions show the paused notice and View and community links still open.
- In live mode, verify the intended network, API target, wallet flow and token creation.

## Native Targets

Android/iOS scripts are not deployment targets documented here.
This deployment doc is for the web export.
