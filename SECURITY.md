# Security

Security guidance for the Revelcy frontend.

## Reporting Security Issues

Do not open public issues for vulnerabilities, leaked secrets, exploit paths, or wallet/security-sensitive bugs.

Report security issues privately to the project maintainers.

If you are unsure whether something is security-sensitive, treat it as sensitive.

## Secrets

- Do not commit real `.env` values.
- Do not commit private keys.
- Do not commit backend-only secrets.
- Treat frontend env values as browser-exposed unless proven otherwise.

## Wallet Safety

Revelcy uses wallet flows for web.

- Do not bypass explicit wallet connection or signing.
- Do not auto-trigger signatures without clear user action.
- Do not log signatures or sensitive transaction payloads.

## Auth Safety

- Do not log JWTs or bearer tokens.
- Do not place auth tokens in URLs.
- Keep logout and token cleanup behavior intact.

## User Content

User-controlled token/community content can include names, descriptions, images, and external links.

- Do not render untrusted HTML.
- Treat external links as untrusted.
- Preserve image/file validation behavior.

## Related Docs

- [Environment](docs/ENVIRONMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
