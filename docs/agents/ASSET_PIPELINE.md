# Asset Pipeline

Agent-facing guide for images, SVG icons, and visual assets.

## Asset Locations

- `assets/basic_icon/`
  SVG icons.
- `assets/default_avatars/`
  Default avatar images.
- `assets/*.png`
  Static images and brand assets.
- `public/`
  Static web assets such as favicon.
- `src/components/base/SvgIcon.tsx`
  Central SVG icon registry and renderer.
- `src/utils/imageValidation.ts`
  Image validation helper.
- `src/hooks/useImageAspectRatio.tsx`
  Image aspect ratio helper.

## SVG Icons

To add an icon:

1. Add SVG to `assets/basic_icon/`.
2. Use a stable kebab-case filename when possible.
3. Import it in `src/components/base/SvgIcon.tsx`.
4. Register it in the `icons` map.
5. Use `<SvgIcon name="..." />`.

Do not duplicate SVG markup inside domain components when `SvgIcon` can own it.

## Images

Common image use cases:

- token avatar,
- community banner,
- default avatars,
- not-found/brand images,
- static web assets.

Rules:

- Preserve image validation behavior.
- Avoid processing large images in render paths.
- Keep mobile web constraints in mind.
- Do not commit generated or temporary image outputs unless the user asks.

## Upload-Related Assets

Relevant files:

- `src/services/files/ipfs/pumpfun.ts`
- `src/services/files/ipfs/pinata.ts`
- `src/services/api/files.ts`
- `src/services/premarket/create.ts`
- `src/services/premarket/addCommunityInfo.ts`

Treat upload behavior as domain-sensitive.
Do not change upload provider assumptions without tracing premarket creation.

## Before Asset Changes

Read:

- target component,
- `src/components/base/SvgIcon.tsx` for icons,
- `src/utils/imageValidation.ts` for uploads,
- `docs/agents/UI_SYSTEM.md`,
- `docs/agents/PERFORMANCE.md`,
- `docs/agents/SECURITY_FRONTEND.md`.

## After Asset Changes

Check:

- asset path/import resolves,
- SVG is registered when needed,
- image validation still applies to user-provided images,
- mobile and desktop layouts still hold,
- no secrets or private files were added.
