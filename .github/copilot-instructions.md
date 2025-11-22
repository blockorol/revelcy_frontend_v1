# Copilot Instructions for Revelcy Frontend

## Project Overview
- **Revelcy Frontend** is a cross-platform (Web, Android, iOS) app built with **React Native** and **Expo SDK 52**.
- Integrates with the **Solana blockchain** (web only) and decentralized storage via **IPFS** (Pinata).
- Uses **TypeScript** and leverages modern React patterns (hooks, context, modular UI components).
- Project prepared ONLY for web. Android/iOS support is scaffolded but not fully functional.

## Key Architecture & Patterns
- **Navigation**: Uses [Expo Router](https://expo.github.io/router/docs) for file-based routing in `app/`.
- **UI Components**: Modularized in `src/components/`. Use these for consistent design.
- **UI Test Stand**: 
 `app/example/ui/`. Use these for consistent design.
- **State & Context**: App-wide state via React Contexts in `src/providers/` (e.g., `AuthContext`, `NetworkContext`, `NotificationContext`).
- **Hooks**: Custom hooks in `src/hooks/` for wallet, content area, premarket logic, etc.
- **API & Blockchain**: API calls in `src/services/api/`, blockchain logic in `src/services/blockchain/` and wallet adapters in `src/storage/wallet-adapter/`.
- **Token & Premarket**: Token and premarket flows are in `app/token/` and `app/example/premarket/`.
- **Theming**: Centralized in `src/theme/` for colors, fonts, and theme config.
- **Utilities**: Shared helpers in `src/utils/` (e.g., address formatting, color conversion, openLinks).

## Developer Workflows
- **Install**: `npm install`
- **Run (Web)**: `expo start --web`
- **Run (Android/iOS)**: `npm run android` / `npm run ios`
- **Env Setup**: Copy `.env` template from README. Required for backend, Pinata, and Solana integration.
- **Aliases**: Use project aliases (e.g., `@components`, `@hooks`) as defined in README for imports.

## Project-Specific Conventions
- **Expo Router**: Place new screens/pages in `app/` using file-based routing. Use `[param].tsx` for dynamic routes.
- **UI**: Project works with Material Design with implementation by ReactNativeParer. Missed or overrided components are in  `src/components/ui/`. Prefer using shared UI components from `src/components/`.
- **Context**: Add new providers to `src/providers/` and wrap in `_layout.tsx` if global.
- **Blockchain**: Use wallet adapters in `src/storage/wallet-adapter/` for Solana wallet logic.
- **API**: Centralize API logic in `src/services/api/`.
- **Premarket/Token**: Follow patterns in `app/token/` for new flows.

## Integration Points
- **Backend**: Communicate with [blockorol/revelcy-backend-v1](https://github.com/blockorol/revelcy-backend-v1) via REST API (see `HOST_BACKEND` in `.env`).
- **Solana**: Use `@solana/web3.js` and wallet adapters for blockchain features (web only). For wallet integration we work ONLY with Phantom.
- **IPFS**: We have 2 methods to upload data to IPFS. The main method - Pumpfun IPFS. Second options - Pinanta. It's alos in the code, but we do not use it (see `PINATA_*` in `.env`).

## Examples
- **Add a new screen**: Create `app/feature/newScreen.tsx` and it will be routed automatically.
- **Add a new context**: Create in `src/providers/`, wrap in `_layout.tsx`.
- **Use a custom hook**: Import from `src/hooks/` (e.g., `useWalletLoginFlow`).

## References
- See `README.md` for setup, env, and alias details.
- See `src/`, `app/`, and `app/example/` for main code structure and patterns.

---

*Update this file if you introduce new architectural patterns, workflows, or conventions.*
