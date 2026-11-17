# Localization And Copy

Agent-facing guide for UI copy.

## Current Status

- No localization/i18n system is currently documented.
- UI copy is simple English text in components.
- Do not introduce a localization framework unless the user explicitly asks.
- Do not create translation files unless the user explicitly asks.

## Copy Rules

- Use clear, short English.
- Keep notification messages actionable.
- Prefer `suggest` in `NotificationContext` options when the user needs a next step.
- Avoid long explanatory copy inside compact UI.
- Keep button labels short.
- Match existing project tone in nearby components.

## Where Copy Appears

- Login UI: `src/components/login/*`
- Premarket UI: `src/components/premarket/*`
- Token creation forms: `src/components/token/create/*`
- Notifications: `src/providers/NotificationContext.tsx` callers
- Legal docs: `app/docs/*`

## Error Copy

Read `docs/agents/ERROR_HANDLING.md` before changing error text.

Rules:

- Tell the user what failed.
- Add a next step when useful.
- Do not expose internal details, secrets, tokens, or raw sensitive payloads.
- Keep wallet/transaction errors honest about uncertainty.

## Before Copy Changes

Read:

- nearby component copy,
- `docs/agents/UI_SYSTEM.md`,
- `docs/agents/ERROR_HANDLING.md` for failure messages.

## After Copy Changes

Check:

- text fits mobile and desktop layouts,
- button labels fit,
- error messages do not expose sensitive details,
- no localization assumptions were introduced accidentally.
