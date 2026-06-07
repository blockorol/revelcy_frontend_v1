# Agent Docs README

Navigation for AI agents working in the Revelcy frontend repo.
Read this after `AGENTS.md`.

## Which File To Read

- `PROJECT_MAP.md`
  Read when you need to know where routes, screens, components, hooks, API clients, state, styles, assets, config, or agent docs live.
- `ARCHITECTURE.md`
  Read before changing app layers, routing/layouts, state/providers, auth/session, API clients, env/config, design system, or wallet/web3 logic.
- `DOMAIN.md`
  Read before changing business behavior: user/auth, wallet, premarket, holder, whitelist, vesting, token/community metadata, claim, or transaction flows.
- `INVARIANTS.md`
  Read before high-risk changes. Preserve these rules unless the user explicitly asks to change them.
- `UI_SYSTEM.md`
  Read before changing shared UI primitives, domain UI, theme, icons, layout, or responsive behavior.
- `FLOWS.md`
  Read before changing login, wallet connect, browse/detail premarket, create premarket, join/leave, claim/finish/extend, or draft restore flows.
- `KNOWN_GAPS.md`
  Read when evaluating uncertainty, stale docs, missing scripts, platform support, example code, IPFS assumptions, or unavailable contracts.
- `VALIDATION.md`
  Read before deciding which checks to run after docs-only, UI, API, auth, wallet, env/config, or dependency changes.
- `API_CONTRACTS.md`
  Placeholder for frontend/backend API contracts. Read before API contract changes, but do not treat it as complete until filled by an agent with backend access.
- `WEB3_CONTRACTS.md`
  Placeholder for Solana/wallet transaction contracts. Read before web3 contract changes, but do not treat it as complete until filled with authoritative contract context.
- `ERROR_HANDLING.md`
  Read before changing notifications, API error handling, logs, loading overlays, or wallet/transaction failure paths.
- `STATE_AND_PERSISTENCE.md`
  Read before changing providers, persistent storage, auth token storage, draft persistence, modal state, or overlay state.
- `FEATURE_FLAGS.md`
  Read before changing env flags, hardcoded feature switches, network defaults, or token conversion settings.
- `TESTING_STRATEGY.md`
  Read before adding tests, test scripts, mocks, or test directory structure.
- `SECURITY_FRONTEND.md`
  Read before changing auth/session, env exposure, wallet signing, external links, user content, image/file upload, or security-sensitive behavior.
- `PERFORMANCE.md`
  Read before changing large lists, image-heavy UI, expensive hooks, blocking async flows, or adding dependencies/assets.
- `REVIEW_CHECKLIST.md`
  Read when asked to review changes or prepare a handoff.
- `WORKFLOWS.md`
  Read when implementing a typical change: route, component, API client, form, auth flow, wallet transaction, env config, test, or styling.
- `CHANGE_PROTOCOL.md`
  Read after changes to decide what to validate and which agent docs must be updated.

## Shared Agent Skills

- `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md`
  Use after code changes to prevent agent docs drift.
- `.agents/skills/revelcy-agent-doc-full-refresh/SKILL.md`
  Use when asked to fully refresh project map/docs or when docs may be stale.

## Source Of Truth Order

1. Current code.
2. `AGENTS.md`.
3. `docs/agents/*`.
4. Repo-shared skills/adapters.
5. Older README files.

Do not copy older docs into agent docs without verifying against code.
