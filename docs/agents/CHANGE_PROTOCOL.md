# Change Protocol

Post-change checklist for AI agents.

## Mandatory Review After Changes

After code changes, inspect:

- `git diff --name-only`
- changed routes/screens/components/hooks/providers/services/config
- changed package scripts or validation commands
- whether agent docs need updates

Use `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md` for the decision process.

## Update Agent Docs When

- Routes/pages changed -> update `PROJECT_MAP.md`.
- Directory ownership changed -> update `PROJECT_MAP.md`.
- Architecture/state/provider/API ownership changed -> update `ARCHITECTURE.md`.
- Auth/session/API behavior changed -> update `ARCHITECTURE.md` and possibly `INVARIANTS.md`.
- Business behavior changed -> update `DOMAIN.md`.
- User flow sequence changed -> update `FLOWS.md`.
- UI primitives, theme, icons, or responsive rules changed -> update `UI_SYSTEM.md`.
- Known limitations changed -> update `KNOWN_GAPS.md`.
- Validation commands or expected checks changed -> update `VALIDATION.md`.
- Non-breaking or breaking rules changed -> update `INVARIANTS.md`.
- A repeated edit recipe changed or emerged -> update `WORKFLOWS.md`.
- Commands, high-risk zones, or top-level rules changed -> update `AGENTS.md`.
- Shared agent skill behavior changed -> update `.agents/skills/*`, and adapters if needed.

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
- `docs/agents/WORKFLOWS.md`
- `docs/agents/CHANGE_PROTOCOL.md`
