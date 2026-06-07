# Setup

How to run the Revelcy frontend locally.

## Requirements

- Node.js 18 or newer
- npm
- A browser for the supported web target
- Access to a Revelcy backend API
- Required environment variables
- Phantom wallet for wallet flows on web

Android and iOS scripts exist, but current practical support is web-first.

## Install Dependencies

```bash
npm install
```

## Configure Environment

Create a local `.env` file in the project root.

Do not commit real secrets.

See [ENVIRONMENT.md](ENVIRONMENT.md) for the environment variable list.

## Run Web Locally

```bash
npm run web
```

You can also start generic Expo mode:

```bash
npm start
```

## Build Web

```bash
npm run build
```

The export output is written to `web-build`.

To serve the exported build:

```bash
npm run serve
```

## Native Targets

The package includes:

```bash
npm run android
npm run ios
```

Treat native behavior as scaffolded unless the specific feature has been verified.

## Validation Scripts

The project currently does not define:

- `lint`
- `test`
- `typecheck`
- `format`

Use `npm run build` for build-sensitive changes until dedicated validation scripts are added.
