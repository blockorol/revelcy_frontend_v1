---
name: revelcy-agent-doc-full-refresh
description: Fully rescan the Revelcy frontend repository and rebuild or correct the shared agent documentation. Use when asked to refresh/update the project map or agent docs, when another contributor or agent may have changed code without updating docs, when docs conflict with code, before major handoff, or before relying on stale agent documentation.
---

# Revelcy Agent Doc Full Refresh

Use this skill to do a full agent-documentation audit.
It is broader than normal maintenance and should verify docs against the current repository state.

## Files To Refresh

Primary docs:

- `AGENTS.md`
- `docs/agents/README.md`
- `docs/agents/PROJECT_MAP.md`
- `docs/agents/ARCHITECTURE.md`
- `docs/agents/DOMAIN.md`
- `docs/agents/INVARIANTS.md`
- `docs/agents/UI_SYSTEM.md`
- `docs/agents/FLOWS.md`
- `docs/agents/KNOWN_GAPS.md`
- `docs/agents/VALIDATION.md`
- `docs/agents/API_CONTRACTS.md`
- `docs/agents/WEB3_CONTRACTS.md`
- `docs/agents/ERROR_HANDLING.md`
- `docs/agents/STATE_AND_PERSISTENCE.md`
- `docs/agents/FEATURE_FLAGS.md`
- `docs/agents/REVIEW_CHECKLIST.md`
- `docs/agents/WORKFLOWS.md`
- `docs/agents/CHANGE_PROTOCOL.md`

Shared skills and adapters:

- `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md`
- `.agents/skills/revelcy-agent-doc-full-refresh/SKILL.md`
- `.cursor/rules/revelcy-agent-docs.mdc`
- `CLAUDE.md`

## Full Refresh Workflow

1. Check repository state:
   - `git status --short --branch`
   - `git diff --name-only`
2. Inventory key files:
   - `rg --files app src screens storage assets public .agents docs .cursor`
   - `Get-Content package.json`
   - `Get-Content tsconfig.json`
   - `Get-Content babel.config.js`
   - `Get-Content app/_layout.tsx`
   - `Get-Content env.ts`
3. Inspect important runtime areas:
   - routes in `app/`
   - screens in `screens/`
   - providers in `src/providers/`
   - wallet adapters in `storage/wallet-adapter/`
   - API services in `src/services/api/`
   - blockchain services in `src/services/blockchain/`
   - premarket services and creation flow
   - UI primitives and theme
   - important flow maps
   - validation commands and known gaps
   - error handling and state persistence docs
   - feature flags and review checklist
4. Compare findings with all primary docs.
5. Patch docs so they describe current code, not intended future code.
6. Verify no old agent instruction file competes with `AGENTS.md`.
7. Finish with `git status --short` and summarize changed docs.

## What To Look For

- New, moved, or deleted routes.
- New, moved, or deleted domains under `src/components/`, `src/hooks/`, `src/services/`, `storage/`, or `screens/`.
- Changed provider order or root layout behavior.
- Changed auth, HTTP retry/refresh, or token handling.
- Changed API contract notes or TODO status.
- Changed env variables or platform loading behavior.
- Changed wallet, Phantom, Solana network, or transaction assumptions.
- Changed web3 contract notes or TODO status.
- Changed domain entities or scenarios: user, auth session, wallet, premarket, holder, whitelist, vesting, community/token info, claims, transactions.
- Changed user flow sequence or ownership.
- Changed UI primitives, theme, icons, or responsive expectations.
- Changed IPFS upload path or metadata flow.
- Changed error handling, notifications, logs, overlays, or recovery behavior.
- Changed state ownership, persistence, providers, drafts, modal, or overlay behavior.
- Changed feature flags, env switches, or network-dependent settings.
- Changed package scripts, validation commands, or aliases.
- Changed web/native support assumptions.
- Changed invariants that agents must preserve.
- Changed known limitations or validation guidance.
- Changed review or handoff expectations.
- Stale references to deleted files or old paths.

## Output Requirements

Make documentation edits directly.
Do not stop after listing recommendations unless the user explicitly asks for analysis only.

In the final response, include:

- which docs were refreshed,
- any significant code/doc drift found,
- any validation command run,
- any remaining uncertainty.

## Style Rules

Keep docs concise and useful for agents.
Prefer concrete path maps and workflows over prose.
Do not include real secrets.
Do not create human-facing open-source docs as part of this skill unless explicitly asked.
