---
name: revelcy-agent-doc-maintenance
description: Keep Revelcy's repository-shared agent documentation current after code changes. Use after any change to routes, project structure, providers, API, auth, wallet, Solana, IPFS, environment variables, package scripts, aliases, common workflows, or platform assumptions; also use before finishing a task when uncertain whether agent docs need an update.
---

# Revelcy Agent Doc Maintenance

Use this skill after making code changes in this repository.
Its job is to prevent agent-facing docs from drifting away from the code.

## Source Of Truth

Prefer current code over docs.
Then update these files as needed:

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
- `docs/agents/TESTING_STRATEGY.md`
- `docs/agents/SECURITY_FRONTEND.md`
- `docs/agents/PERFORMANCE.md`
- `docs/agents/REVIEW_CHECKLIST.md`
- `docs/agents/WORKFLOWS.md`
- `docs/agents/CHANGE_PROTOCOL.md`
- repo-shared skills in `.agents/skills/`
- agent adapters: `.cursor/rules/revelcy-agent-docs.mdc`, `CLAUDE.md`

## Decision Checklist

After a change, inspect the diff and answer:

- Did routes under `app/` change?
- Did top-level screens under `screens/` change?
- Did domain folders, services, hooks, providers, or storage responsibilities move?
- Did `app/_layout.tsx` provider composition change?
- Did API/auth/refresh/retry behavior change?
- Did frontend/backend API contract documentation change?
- Did wallet adapter behavior or platform assumptions change?
- Did Solana transaction behavior change?
- Did Solana/web3 contract documentation change?
- Did premarket creation/join/claim/finish behavior change?
- Did user, wallet, premarket, holder, whitelist, vesting, claim, or token/community domain behavior change?
- Did a user flow sequence or ownership path change?
- Did UI primitives, theme, icons, layout, or responsive rules change?
- Did IPFS upload or metadata behavior change?
- Did error handling, notifications, logs, overlays, or failure recovery change?
- Did state ownership, persistence, providers, drafts, modal, or overlay behavior change?
- Did feature flags, env switches, or network-dependent settings change?
- Did testing strategy, test locations, mocks, or test commands change?
- Did frontend security expectations change?
- Did performance-sensitive behavior or expectations change?
- Did `env.ts`, `app.config.js`, `babel.config.js`, or env requirements change?
- Did `package.json` commands or dependency-driven workflows change?
- Did available validation commands or expected checks change?
- Did a known limitation become outdated or newly important?
- Did `tsconfig.json` or Babel aliases change?
- Did an invariant change or become newly important?
- Did a new common workflow emerge that future agents should follow?

If yes to any item, update the relevant agent docs before final response.

## Update Targets

- Structure, routes, domains, file ownership:
  update `docs/agents/PROJECT_MAP.md`.
- Runtime architecture, provider composition, auth, HTTP, wallet, blockchain, IPFS, premarket flow:
  update `docs/agents/ARCHITECTURE.md`.
- Business entities, scenarios, or API-client links:
  update `docs/agents/DOMAIN.md`.
- Rules agents must preserve:
  update `docs/agents/INVARIANTS.md`.
- UI primitives, theme, icon, layout, or responsive rules:
  update `docs/agents/UI_SYSTEM.md`.
- Important user flow sequence or ownership:
  update `docs/agents/FLOWS.md`.
- Known limitations, missing scripts, stale docs, or unsupported areas:
  update `docs/agents/KNOWN_GAPS.md`.
- Validation command availability or check expectations:
  update `docs/agents/VALIDATION.md`.
- Frontend/backend API contract notes:
  update `docs/agents/API_CONTRACTS.md`.
- Solana/wallet transaction contract notes:
  update `docs/agents/WEB3_CONTRACTS.md`.
- Error handling, notifications, logs, overlays, and recovery:
  update `docs/agents/ERROR_HANDLING.md`.
- State ownership, persistence, providers, drafts, modal, and overlay state:
  update `docs/agents/STATE_AND_PERSISTENCE.md`.
- Feature flags, env switches, hardcoded flags, and network-dependent settings:
  update `docs/agents/FEATURE_FLAGS.md`.
- Testing approach, test locations, mocks, and test commands:
  update `docs/agents/TESTING_STRATEGY.md`.
- Frontend security expectations:
  update `docs/agents/SECURITY_FRONTEND.md`.
- Performance-sensitive behavior and expectations:
  update `docs/agents/PERFORMANCE.md`.
- Review and handoff expectations:
  update `docs/agents/REVIEW_CHECKLIST.md`.
- How to perform recurring tasks:
  update `docs/agents/WORKFLOWS.md`.
- Rules for keeping docs fresh:
  update `docs/agents/CHANGE_PROTOCOL.md`.
- Top-level commands, aliases, platform stance, sensitive areas, required skills:
  update `AGENTS.md`.
- Skill invocation or shared-agent behavior:
  update `.agents/skills/*`, `.cursor/rules/revelcy-agent-docs.mdc`, and `CLAUDE.md` as needed.

## Minimal Process

1. Run or inspect `git diff --name-only`.
2. Compare changed files with the checklist.
3. Update the smallest relevant documentation set.
4. Run `git status --short`.
5. In the final response, mention whether agent docs were updated or explicitly say no update was needed.

## Style Rules

Keep agent docs operational.
Use paths, commands, and decision rules.
Avoid product marketing, broad React explanations, and secrets.
Do not copy stale README content without verifying it against code.
