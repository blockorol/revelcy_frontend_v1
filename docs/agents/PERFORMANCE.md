# Performance

Agent-facing performance guide for frontend changes.

## Current Performance Risk Areas

- Premarket list/card rendering.
- Premarket detail page with many domain sections.
- Image-heavy token/community UI.
- Draft persistence and repeated form updates.
- Wallet/web3 transaction flows with blocking overlays.
- Hooks that fetch or derive premarket/holder state.

## Lists And Cards

Relevant files:

- `screens/PremarketsPage.tsx`
- `src/components/premarket/PremarketList.tsx`
- `src/components/premarket/PremarketCard.tsx`

Rules:

- Avoid expensive work inside render loops.
- Memoize derived data only when it removes real repeated work.
- Keep card props focused.
- Avoid adding network calls inside repeated card components.

## Images

Relevant files:

- `src/hooks/useImageAspectRatio.tsx`
- `src/utils/imageValidation.ts`
- token/community creation components,
- premarket display components.

Rules:

- Avoid unnecessary full-resolution image processing in render.
- Preserve validation before upload/display.
- Be careful with large avatars/banners on mobile web.

## Hooks And State

Rules:

- Avoid effects that refetch on every render.
- Keep dependency arrays intentional.
- Avoid broad provider state updates that rerender the whole app.
- Keep draft persistence patch calls tied to real form transitions, not every keystroke unless intentional.

## Web3 And Blocking Flows

Rules:

- Use overlay/progress text for long blocking operations.
- Keep cleanup in `finally`.
- Do not hide long-running transaction finality checks without feedback.
- Do not add polling loops without clear exit conditions.

## Bundle And Dependencies

- Do not add heavy dependencies for small utilities.
- Do not update Expo/React Native/Solana package groups casually.
- Prefer existing utilities/components before introducing new libraries.

## Performance Review Checklist

- No new repeated network calls in render paths.
- No expensive derived work in large lists without need.
- UI remains responsive during async operations.
- Mobile web layout and image behavior are considered.
- Build impact is considered when adding dependencies or large assets.
