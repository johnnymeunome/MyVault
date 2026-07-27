# Contributing to MyVault

Thanks for helping improve MyVault. The project is currently at M0: a product shell that is **not safe for real credentials**.

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

For security concerns, avoid opening a public issue containing sensitive details. Contact the maintainer privately through their GitHub profile until a dedicated security policy is published.

## Pull requests

Explain what changed, why it is useful, how it was tested and any effect on the future security boundary. Keep UI changes keyboard accessible and avoid introducing network calls or telemetry.
