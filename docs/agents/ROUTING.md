# Routing

Agent-facing routing guide for Expo Router.

## Routing Model

- Routes live in `app/`.
- Root layout is `app/_layout.tsx`.
- Route-level logic usually delegates to `screens/*` when the screen is more than a thin wrapper.
- Dynamic params use Expo Router file naming, such as `app/token/[premarketId].tsx`.

## Production Routes

- `app/index.tsx`
  Home route.
- `app/discover.tsx`
  Discover/premarket listing route.
- `app/me.tsx`
  Profile route.
- `app/resources.tsx`
  Resources route.
- `app/token/index.tsx`
  Token area index.
- `app/token/create.tsx`
  Premarket/token creation route.
- `app/token/[premarketId].tsx`
  Premarket detail route.
- `app/docs/privacy.tsx`
- `app/docs/risk_disclosure.tsx`
- `app/docs/terms.tsx`
- `app/+not-found.tsx`

## Example Routes

- `app/example/**`

Use example routes to inspect components and UI behavior.
Do not treat example routes as production routes unless the user explicitly asks.

## Route To Screen Map

- `app/discover.tsx` -> `screens/PremarketsPage.tsx`
- `app/me.tsx` -> `screens/MeScreen.tsx`
- `app/token/create.tsx` -> `screens/PremarketCreationFlow.tsx`
- `app/token/[premarketId].tsx` -> `screens/TokenPremarketPage.tsx`

Verify the actual route file before editing; this map should be refreshed if route files change.

## Navigation Rules

- Prefer existing routing helpers where nearby code uses them, especially `src/hooks/useSafeRouter.ts`.
- Keep dynamic param names stable unless all callers and links are updated.
- Check router pushes after route renames.
- Do not mix production route names with example route names.
- Keep not-found behavior intact.

## Before Route Changes

Read:

- `app/_layout.tsx`
- target route file in `app/`
- related screen in `screens/`
- `docs/agents/PROJECT_MAP.md`
- `docs/agents/FLOWS.md`

## After Route Changes

Update:

- `docs/agents/PROJECT_MAP.md`
- `docs/agents/ROUTING.md`
- `docs/agents/FLOWS.md` if user flow sequence changed
- `docs/agents/CHANGE_PROTOCOL.md` if routing update rules changed

Check:

- route exists,
- links/router pushes still match,
- dynamic params still match consumers,
- mobile and desktop layout still render through `app/_layout.tsx`.
