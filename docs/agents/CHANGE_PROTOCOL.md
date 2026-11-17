# Change Protocol

Post-change checklist for AI agents.

## Mandatory Review After Changes

After code changes, inspect:

- `git diff --name-only`
- changed routes/screens/components/hooks/providers/services/config
- changed package scripts or validation commands
- whether agent docs need updates
- whether PR/merge guidance still targets `dev` before `main`

Use `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md` for the decision process.

## Update Agent Docs When

- Routes/pages changed -> update `PROJECT_MAP.md`.
- Directory ownership changed -> update `PROJECT_MAP.md`.
- Architecture/state/provider/API ownership changed -> update `ARCHITECTURE.md`.
- Auth/session/API behavior changed -> update `ARCHITECTURE.md` and possibly `INVARIANTS.md`.
- API contract documentation changed -> update `API_CONTRACTS.md` and backend-sync references.
- Web3 contract documentation changed -> update `WEB3_CONTRACTS.md`.
- Business behavior changed -> update `DOMAIN.md`.
- User flow sequence changed -> update `FLOWS.md`.
- UI primitives, theme, icons, or responsive rules changed -> update `UI_SYSTEM.md`.
- Known limitations changed -> update `KNOWN_GAPS.md`.
- Validation commands or expected checks changed -> update `VALIDATION.md`.
- Error handling, notifications, logs, overlays, or failure recovery changed -> update `ERROR_HANDLING.md`.
- State ownership, persistence, providers, drafts, modal, or overlay behavior changed -> update `STATE_AND_PERSISTENCE.md`.
- Feature flags, env switches, or network-dependent settings changed -> update `FEATURE_FLAGS.md`.
- Testing approach, test locations, mocks, or test commands changed -> update `TESTING_STRATEGY.md`.
- Frontend security expectations changed -> update `SECURITY_FRONTEND.md`.
- Performance-sensitive behavior or expectations changed -> update `PERFORMANCE.md`.
- Routes, dynamic params, navigation, or route-to-screen mapping changed -> update `ROUTING.md`.
- Assets, icons, images, banners, avatars, or asset upload assumptions changed -> update `ASSET_PIPELINE.md`.
- UI copy, notification wording, or localization assumptions changed -> update `LOCALIZATION_COPY.md`.
- Logging, fingerprint events, telemetry-like behavior, or error visibility changed -> update `OBSERVABILITY.md`.
- Repeat agent prompt patterns changed -> update `AGENT_PROMPTS.md`.
- Review/handoff expectations changed -> update `REVIEW_CHECKLIST.md`.
- Non-breaking or breaking rules changed -> update `INVARIANTS.md`.
- A repeated edit recipe changed or emerged -> update `WORKFLOWS.md`.
- Commands, high-risk zones, or top-level rules changed -> update `AGENTS.md`.
- Shared agent skill behavior changed -> update `.agents/skills/*`, and adapters if needed.

## Update Human Docs When

- Project overview, quick start, scripts, platform status, or doc links changed -> update `README.md`.
- Human doc navigation changed -> update `docs/README.md`.
- Install, local run, setup requirements, or local env setup changed -> update `docs/SETUP.md`.
- Developer conventions, aliases, routing, UI, state, API, or feature workflow changed -> update `docs/DEVELOPMENT.md`.
- Human-readable architecture, routing, auth, API, wallet, or IPFS overview changed -> update `docs/ARCHITECTURE.md`.
- Human project structure changed -> update `docs/PROJECT_STRUCTURE.md`.
- Human UI guidance changed -> update `docs/UI.md`.
- Human API overview or API contract placeholder changed -> update `docs/API.md`.
- Human Web3/wallet overview or contract placeholder changed -> update `docs/WEB3.md`.
- Env variables, required/optional status, defaults, or exposure notes changed -> update `docs/ENVIRONMENT.md`.
- Common setup/runtime/build/wallet/backend issues changed -> update `docs/TROUBLESHOOTING.md`.
- Build/export/hosting/deployment env or pre-deploy checks changed -> update `docs/DEPLOYMENT.md`.
- Contribution, validation, PR, branch, or docs expectations changed -> update `CONTRIBUTING.md`.
- Security reporting, secret handling, auth, wallet, user content, or upload safety changed -> update `SECURITY.md`.
- Issue reporting fields changed -> update `.github/ISSUE_TEMPLATE/*`.
- PR expectations changed -> update `.github/pull_request_template.md`.

## Validation Checklist

Run what exists and is relevant:

Use `VALIDATION.md` for detailed guidance.

- Format: no format script is currently defined.
- Lint: no `lint` script is currently defined.
- Typecheck: no `typecheck` script is currently defined.
- Tests: no `test` script is currently defined.
- Build: `npm run build` when build impact is plausible.
- Dev/runtime: `npm run web` when interactive verification is needed.
- Visual/responsive: check mobile and desktop when UI changed.

If a check cannot be run because no script exists or the task is docs-only, state that clearly.

## Final Response Requirements

Include:

- changed agent docs,
- validation run or skipped,
- remaining risk or uncertainty,
- whether app code was untouched if the task was docs-only.

Keep the final response concise.

## Full Refresh

Use `.agents/skills/revelcy-agent-doc-full-refresh/SKILL.md` when:

- the user asks to refresh agent docs/project map,
- docs and code appear to disagree,
- another contributor or agent may have skipped doc updates,
- preparing a branch for handoff.

Full refresh must compare current code against:

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
- `docs/agents/ROUTING.md`
- `docs/agents/ASSET_PIPELINE.md`
- `docs/agents/LOCALIZATION_COPY.md`
- `docs/agents/OBSERVABILITY.md`
- `docs/agents/AGENT_PROMPTS.md`
- `docs/agents/REVIEW_CHECKLIST.md`
- `docs/agents/WORKFLOWS.md`
- `docs/agents/CHANGE_PROTOCOL.md`

When the task includes human-facing documentation, also compare:

- `README.md`
- `docs/README.md`
- `docs/SETUP.md`
- `docs/DEVELOPMENT.md`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STRUCTURE.md`
- `docs/UI.md`
- `docs/API.md`
- `docs/WEB3.md`
- `docs/ENVIRONMENT.md`
- `docs/TROUBLESHOOTING.md`
- `docs/DEPLOYMENT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/pull_request_template.md`
