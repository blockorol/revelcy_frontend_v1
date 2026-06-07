# UI

Human-facing guide to the Revelcy frontend UI system.

## UI Stack

- React Native components.
- React Native Paper.
- Custom project primitives in `src/components/ui/`.
- Lower-level shared components in `src/components/base/`.
- Theme files in `src/theme/`.

## Shared Components

Prefer shared components before adding local one-off UI.

Common primitives:

- `src/components/ui/Button.tsx`
- `src/components/ui/Text.tsx`
- `src/components/ui/TextInput.tsx`
- `src/components/ui/Chip.tsx`
- `src/components/ui/Avatar.tsx`
- `src/components/ui/Switch.tsx`
- `src/components/ui/SegmentedButton.tsx`
- `src/components/ui/MobileBottomSheet.tsx`
- `src/components/ui/Loader.tsx`

Base components include:

- containers,
- SVG icon renderer,
- date/time controls,
- sliders,
- charts,
- loaders,
- expandable text.

## Theme

Theme files:

- `src/theme/colors.ts`
- `src/theme/fonts.ts`
- `src/theme/theme.ts`
- `src/theme/types.ts`

Prefer theme values over hard-coded colors when possible.

## Icons

SVG icons live in `assets/basic_icon/`.

To add an icon:

1. Add the SVG file to `assets/basic_icon/`.
2. Import it in `src/components/base/SvgIcon.tsx`.
3. Register it in the `icons` map.
4. Render it with `<SvgIcon name="..." />`.

## Responsive Behavior

The app is web-first and should work on mobile-width and desktop-width layouts.

Useful files:

- `src/hooks/useIsMobile.ts`
- `src/hooks/useContentArea.tsx`
- `src/components/base/container/*`

Check text fit, button sizing, and layout spacing after UI changes.

## Related Docs

- [Development](DEVELOPMENT.md)
- [Project Structure](PROJECT_STRUCTURE.md)
