# Agent Prompts

Reusable prompts for launching future agents consistently.
Copy and adapt these prompts when delegating work.

## Refresh Agent Docs

```text
Use the repository-shared agent docs.
Read AGENTS.md and docs/agents/README.md first.
Run the full refresh workflow from .agents/skills/revelcy-agent-doc-full-refresh/SKILL.md.
Refresh agent-facing docs only. Do not change application code.
Report changed docs, validation skipped/run, and remaining uncertainty.
```

## Review A Branch

```text
Use AGENTS.md, docs/agents/README.md, and docs/agents/REVIEW_CHECKLIST.md.
Review the current branch in code-review mode.
Prioritize bugs, regressions, missing validation, security issues, wallet/API risks, and stale agent docs.
Do not modify files unless explicitly asked.
```

## Add A UI Component

```text
Read AGENTS.md, docs/agents/UI_SYSTEM.md, docs/agents/WORKFLOWS.md, and nearby components.
Add the requested UI using existing primitives and theme tokens.
Check mobile and desktop layout.
Update agent docs only if ownership, UI rules, workflows, or known gaps changed.
```

## Change A Route

```text
Read AGENTS.md, docs/agents/ROUTING.md, docs/agents/PROJECT_MAP.md, and docs/agents/FLOWS.md.
Make the requested route change using Expo Router conventions.
Preserve dynamic params and navigation callers unless explicitly changing them.
Update routing/project map/flows docs if route structure changes.
```

## Audit Web3 Flow

```text
Read AGENTS.md, docs/agents/WEB3_CONTRACTS.md, docs/agents/FLOWS.md, docs/agents/INVARIANTS.md, and docs/agents/SECURITY_FRONTEND.md.
Audit the requested wallet/web3 flow.
Do not infer final contracts from frontend code alone.
Flag where backend/Solana program context is required.
Do not modify transaction semantics unless explicitly asked.
```

## Sync Frontend Backend Contracts

```text
Use an environment/session with access to both frontend and backend repositories.
Read AGENTS.md, docs/agents/API_CONTRACTS.md, docs/agents/WEB3_CONTRACTS.md, and backend agent docs.
Fill or update contract docs from authoritative backend/program code.
Do not guess contracts from frontend usage alone.
Report mismatches and recommended follow-up changes separately from documentation updates.
```

## Add Tests

```text
Read AGENTS.md, docs/agents/TESTING_STRATEGY.md, docs/agents/VALIDATION.md, and the target code.
Add tests using the repo's existing or newly established test pattern.
Do not make live backend, wallet, Solana, or IPFS calls.
Update validation and project map docs if test scripts or test locations are introduced.
```
