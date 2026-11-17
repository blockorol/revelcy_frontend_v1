# Environment

Environment variable reference for the Revelcy frontend.

Do not commit real secrets.

## Loading Model

Runtime env exports live in `env.ts`.

On web, values are read from:

1. `Constants.expoConfig?.extra`
2. `process.env`

On native, values are loaded from `@env` through `babel-plugin-dotenv-import`.

The default web snapshot needs no environment variables. Set `REVELCY_WEB_MODE=live` to use the live web app. Live-only required values throw at import time if missing.

## Variables

| Name | Required | Used For | Notes |
| --- | --- | --- | --- |
| `REVELCY_WEB_MODE` | Optional | Web runtime mode | Set to `live` for the live backend. The default is the public snapshot. |
| `HOST_BACKEND` | Live only | Backend API base URL | Exported as `API_HOST`. |
| `PINATA_JWT` | Live only | Pinata/IPFS support | Treat as sensitive. |
| `PINATA_API_KEY` | Live only | Pinata/IPFS support | Treat as sensitive. |
| `PINATA_SECRET_KEY` | Live only | Pinata/IPFS support | Treat as sensitive. |
| `HELIUS_KEY` | Live only | Solana/RPC support | Treat as sensitive. |
| `TRITON_URL` | Live only | Solana/RPC support | Required by current code. |
| `NETWORK` | Optional | Network selection | Defaults to `devnet`. Expected values: `devnet`, `mainnet-beta`. |
| `IS_VESTING_ENABLE` | Not currently effective | Vesting flag | `IsVestingEnable` is currently hardcoded to `true` in `env.ts`. |
| `IS_DISCOVERY_FILTER_ENABLED` | Optional | Discovery filter flag | Defaults to `false`; verify wiring before relying on it. |

## Live Web Example

```env
REVELCY_WEB_MODE=live
HOST_BACKEND=https://api.example.com
PINATA_JWT=replace-me
PINATA_API_KEY=replace-me
PINATA_SECRET_KEY=replace-me
HELIUS_KEY=replace-me
TRITON_URL=https://example-rpc
NETWORK=devnet
```

Use real values only in local/deployment environments.

## Web Exposure Note

Frontend environment values can be exposed to browser code.
Do not put backend-only secrets or private keys in frontend env.
