# Architecture

High-level architecture of the Revelcy frontend.

## Overview

The app is an Expo / React Native frontend using:

- Expo Router for routing.
- React Native Paper for Material Design components and theming.
- TypeScript.
- React Context and hooks for state.
- REST API clients for backend communication.
- Phantom/Solana wallet logic for web.
- IPFS upload services for token/community metadata.

The current practical target is web.

## Layers

Typical flow:

1. Route in `app/`
2. Screen container in `screens/`
3. Components in `src/components/`
4. Hooks/providers in `src/hooks/`, `src/providers/`, or `storage/`
5. Services in `src/services/`
6. Backend API, Solana wallet/program, or IPFS provider

## Root Layout

`app/_layout.tsx` composes the application shell:

- font loading,
- browser globals for Solana-related packages,
- network provider,
- auth provider,
- wallet provider,
- content area provider,
- React Native Paper theme,
- notifications,
- login/user modals,
- universal overlay,
- top navigation,
- Expo Router stack.

## Routing

Routes live in `app/`.

Important routes:

- `/`
- `/discover`
- `/me`
- `/resources`
- `/token/create`
- `/token/[premarketId]`
- `/docs/privacy`
- `/docs/risk_disclosure`
- `/docs/terms`

Example routes live under `app/example/` and are not necessarily production behavior.

## Auth

Auth state is owned by `src/providers/AuthContext.tsx`.

The auth provider:

- reads a stored JWT,
- decodes user info,
- updates the shared HTTP auth token,
- clears user state and token on logout.

HTTP auth behavior is centralized in `src/services/api/http.ts`.

## API

API clients live in `src/services/api/`.

`src/services/api/http.ts` owns shared request behavior:

- auth header,
- query params,
- JSON bodies,
- timeouts,
- retries,
- token refresh,
- response parsing,
- error wrapping.

## Wallet And Solana

Wallet support is web-first and centered on Phantom.

Important files:

- `storage/wallet-adapter/*`
- `src/services/blockchain/*`
- `src/services/blockchain/premarket/*`
- `src/utils/phantom.ts`
- `src/utils/solana.ts`

Transaction semantics should not be changed without contract/backend/Solana context.

## IPFS And Metadata

IPFS-related code lives in:

- `src/services/files/ipfs/pumpfun.ts`
- `src/services/files/ipfs/pinata.ts`
- `src/services/premarket/create.ts`
- `src/services/premarket/addCommunityInfo.ts`

Current project notes treat Pump.fun IPFS as the main upload path and Pinata as secondary/legacy support.
