# Claude Instructions For Revelcy Frontend

Read `AGENTS.md` before non-trivial work, then read `docs/agents/README.md`.

This repository stores shared agent procedures in `.agents/skills/` so Codex, Cursor, Claude, and other agents can follow the same maintenance rules through git.

Use these skills:

- `.agents/skills/revelcy-agent-doc-maintenance/SKILL.md`
  Use after code changes to decide whether agent documentation must be updated.
- `.agents/skills/revelcy-agent-doc-full-refresh/SKILL.md`
  Use when asked to fully refresh the project map/docs, when docs may be stale, or before a major handoff.

Primary agent documentation:

- `AGENTS.md`
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

Prefer current code over older docs.
Do not recreate `.github/copilot-instructions.md`; `AGENTS.md` is the shared source of truth.
