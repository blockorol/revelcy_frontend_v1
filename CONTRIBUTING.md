# Contributing

Thanks for contributing to Revelcy Frontend.

## Before You Start

- Read [README.md](README.md).
- Set up the project with [docs/SETUP.md](docs/SETUP.md).
- Review development conventions in [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Branches And Scope

- Branch from `dev` for normal work.
- Open pull requests into `dev` first.
- Merge `dev` into `main` only as a promotion/release step.
- Do not merge feature branches directly into `main`.
- Keep changes focused.
- Avoid unrelated refactors.
- Do not commit real secrets.
- Do not change wallet, transaction, auth, env, or API behavior casually.

## Validation

Run checks that apply to your change.

Currently available:

```bash
npm run build
```

For interactive web checks:

```bash
npm run web
```

The project currently does not define `lint`, `test`, `typecheck`, or `format` scripts.

## Pull Requests

Use the PR template.

Include:

- summary of the change,
- validation performed,
- screenshots or notes for UI changes,
- docs updated or not needed,
- API/web3 contract impact, if any.

## Documentation Updates

Update human-facing docs when behavior changes:

- setup/scripts/env -> `README.md`, `docs/SETUP.md`, `docs/ENVIRONMENT.md`
- architecture/routing/state/API/wallet/IPFS -> `docs/ARCHITECTURE.md`, `docs/DEVELOPMENT.md`
- development workflow/validation/PR expectations -> `CONTRIBUTING.md`
- deployment/build/env hosting -> `docs/DEPLOYMENT.md`
- common issues -> `docs/TROUBLESHOOTING.md`
- security-sensitive behavior -> `SECURITY.md`

Agent-facing docs live in `docs/agents/` and should be updated when agent instructions need to change.
