# Revelcy Frontend

Frontend application for Revelcy, built with Expo, React Native, TypeScript, React Native Paper, Expo Router, Solana wallet integration, and IPFS upload support.

The current practical target is **web**. Android and iOS scripts exist, but native support should be treated as scaffolded unless verified for a specific feature.

## Quick Start

```bash
npm install
npm run web
```

For a production-style web export:

```bash
npm run build
npm run serve
```

## Requirements

- Node.js 18 or newer
- npm
- A browser for the supported web target
- Backend/API and Solana/IPFS-related environment values
- Phantom wallet for wallet flows on web

## Environment

Create a local `.env` file in the project root. Do not commit real secrets.

Required runtime values are documented in [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md).

Common variables include:

- `HOST_BACKEND`
- `PINATA_JWT`
- `PINATA_API_KEY`
- `PINATA_SECRET_KEY`
- `HELIUS_KEY`
- `TRITON_URL`
- `NETWORK`

## Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm start` | Start Expo. |
| `npm run web` | Start Expo for web. |
| `npm run build` | Export the web build to `web-build`. |
| `npm run serve` | Serve `web-build`. |
| `npm run android` | Start Expo Android target. |
| `npm run ios` | Start Expo iOS target. |

No `lint`, `test`, `typecheck`, or `format` script is currently defined.

## Documentation

- [Documentation Index](docs/README.md)
- [Setup](docs/SETUP.md)
- [Development](docs/DEVELOPMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [UI](docs/UI.md)
- [API](docs/API.md)
- [Web3 And Wallet](docs/WEB3.md)
- [Environment](docs/ENVIRONMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

Agent-facing documentation lives in [docs/agents/README.md](docs/agents/README.md).

## Project Shape

- `app/` - Expo Router routes and root layout.
- `screens/` - route-level screen containers.
- `src/components/` - shared and domain UI.
- `src/hooks/` - reusable hooks.
- `src/providers/` - app-wide providers.
- `src/services/` - API, blockchain, IPFS, fingerprint, and domain services.
- `src/theme/` - theme, colors, fonts, and theme types.
- `storage/` - storage helpers, modal/overlay contexts, wallet adapters.
- `assets/` - images and SVG icons.

## Related Repositories

- Backend API: `blockorol/revelcy-backend-v1`
- Solana program: `blockorol/solana-program`
