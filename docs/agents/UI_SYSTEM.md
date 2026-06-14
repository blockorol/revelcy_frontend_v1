# UI System

Agent-facing guide for UI changes. Use this before changing components, layout, theme, icons, or responsive behavior.

## UI Ownership

- `src/components/ui/`
  Project UI primitives. Prefer these for app controls and text.
- `src/components/base/`
  Lower-level reusable controls, containers, SVG icon rendering, date/time controls, charts, loaders.
- `src/components/navigation/`
  App navigation surfaces.
- `src/components/login/`, `src/components/premarket/`, `src/components/token/create/`, `src/components/user/`
  Domain UI.
- `src/theme/`
  Theme, colors, fonts, and React Native Paper theme config.
- `assets/basic_icon/`
  SVG icons registered through `src/components/base/SvgIcon.tsx`.

## Preferred Primitives

Use these before creating local replacements:

- Text: `src/components/ui/Text.tsx`
- Buttons: `src/components/ui/Button.tsx`
- Inputs: `src/components/ui/TextInput.tsx`
- Chips: `src/components/ui/Chip.tsx`
- Avatar: `src/components/ui/Avatar.tsx`
- Switch: `src/components/ui/Switch.tsx`
- Segmented controls: `src/components/ui/SegmentedButton.tsx`
- Mobile bottom sheet: `src/components/ui/MobileBottomSheet.tsx`
- Loading states: `src/components/ui/Loader.tsx` or `src/components/base/Loader.tsx`
- Icons: `src/components/base/SvgIcon.tsx`
- Containers: `src/components/base/container/*`

If nearby code uses a different local primitive, follow the local pattern unless it conflicts with shared UI ownership.

## Theme Rules

Read before theme changes:

- `src/theme/colors.ts`
- `src/theme/fonts.ts`
- `src/theme/theme.ts`
- `src/theme/types.ts`

Rules:

- Prefer theme tokens over hard-coded colors.
- Do not introduce a second design system.
- Keep React Native Paper theme compatibility.
- Check components that depend on `darkTheme` in `app/_layout.tsx`.

## Icons

To add an icon:

1. Add SVG to `assets/basic_icon/`.
2. Import it in `src/components/base/SvgIcon.tsx`.
3. Register it in the `icons` map.
4. Use `<SvgIcon name="..." />`.

Do not inline duplicate SVG code in domain components when `SvgIcon` can own it.
For detailed asset rules, read `docs/agents/ASSET_PIPELINE.md`.

## Responsive Rules

Relevant files:

- `src/hooks/useIsMobile.ts`
- `src/hooks/useContentArea.tsx`
- `src/components/base/container/*`
- affected screen/component styles.

Rules:

- Check mobile-width and desktop-width layouts for UI changes.
- Keep text inside containers.
- Avoid changing layout dimensions in hover/active/loading states.
- Preserve the web-first target.
- Do not assume native layout behavior matches web.

## UI Change Checklist

Before editing:

- Read nearby components.
- Check `src/components/ui/*` and `src/components/base/*`.
- Check theme files if changing colors, fonts, spacing, or component variants.

After editing:

- Check visual layout on mobile and desktop if feasible.
- Update `PROJECT_MAP.md` if UI ownership changed.
- Update `WORKFLOWS.md` if a reusable UI recipe changed.
- Update `KNOWN_GAPS.md` if the change reveals a recurring UI limitation.
