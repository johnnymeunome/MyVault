# Contributing to MyVault

Thanks for helping improve MyVault. M0 is complete and M1 is specified but not implemented. The project is **not safe for real credentials**.

## Development

1. Fork the repository and create a focused branch.
2. Install dependencies with `npm ci`.
3. Make a small, reviewable change.
4. Run the complete validation suite:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Security-sensitive changes

Do not add cryptography, KDBX write support, secret persistence or new Tauri permissions without an explicit architectural decision, threat analysis and compatibility tests. Never include real credentials in issues, fixtures, screenshots or logs.

KDBX read work must follow [`docs/M1-SPEC.md`](docs/M1-SPEC.md), [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md), the [compatibility matrix](docs/KDBX-COMPATIBILITY.md) and the [fixture policy](src-tauri/tests/fixtures/kdbx/README.md). A compatibility claim requires a versioned fixture, automated test and unchanged source hash.

M1 pull requests must not enable KDBX writing or serialize passwords, TOTP, notes, custom fields, history or attachments to the frontend. Update the threat model in the same change whenever a trust boundary, native permission or exposed field changes.

For security concerns, avoid opening a public issue containing sensitive details. Contact the maintainer privately through their GitHub profile until a dedicated security policy is published.

## Pull requests

Explain what changed, why it is useful, how it was tested and any effect on the future security boundary. Keep UI changes keyboard accessible and avoid introducing network calls or telemetry.

Visual changes must follow [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md), reuse semantic tokens and be checked in both themes. New colors or interaction patterns require a documented rationale.
