# Contributing to MyVault

Thanks for helping improve MyVault. M0 and the experimental read-only M1 are complete. The project is **not safe for real credentials**.

## Your first contribution

1. Choose an [open `good first issue`](https://github.com/johnnymeunome/MyVault/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and keep the work limited to that issue.
2. Fork the repository, create a focused branch and install dependencies with `npm ci`.
3. Prefer a starter-safe scope: documentation, tests that use existing public synthetic fixtures or mock-only UI changes that do not cross the native KDBX/Tauri boundary.
4. Read the [threat model](docs/THREAT-MODEL.md), [fixture policy](src-tauri/tests/fixtures/kdbx/README.md) and [security policy](SECURITY.md) before changing behavior. Cryptography, KDBX writing, secret persistence, network access, telemetry and Tauri permissions are outside first-contribution scope.
5. Make one small, reviewable change and run the [documented validation](#validation) that applies. Use the complete suite when behavior changes.
6. Open a focused pull request using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md). Explain what changed, why it is useful, how it was tested and whether it affects a security boundary.

## Validation

Run the complete validation suite:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --lib
```

## Security-sensitive changes

Do not add cryptography, KDBX write support, secret persistence or new Tauri permissions without an explicit architectural decision, threat analysis and compatibility tests. Never include real credentials in fixtures, screenshots, logs, issues or pull requests.

KDBX read work must follow [`docs/M1-SPEC.md`](docs/M1-SPEC.md), [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md), the [compatibility matrix](docs/KDBX-COMPATIBILITY.md) and the [fixture policy](src-tauri/tests/fixtures/kdbx/README.md). A compatibility claim requires a versioned fixture, automated test and unchanged source hash.

M1 pull requests must not enable KDBX writing or serialize passwords, TOTP, notes, custom fields, history or attachments to the frontend. Update the threat model in the same change whenever a trust boundary, native permission or exposed field changes.

M2 is documentation-gated. Do not enable `save_kdbx4`, add a write command or modify KDBX capabilities unless the change is explicitly scoped by [`docs/M2-SPEC.md`](docs/M2-SPEC.md), [ADR 005](docs/DECISIONS/005-safe-kdbx-copy-on-write.md) and the [M2 threat-model delta](docs/M2-THREAT-MODEL.md). The first implementation gate writes only a new disposable copy and never replaces the source.

Use public issues for ordinary bugs that do not expose a vulnerability or sensitive data. For suspected vulnerabilities, do not open a public issue; follow [`SECURITY.md`](SECURITY.md) and use GitHub private vulnerability reporting. Maintainers should review unknown contributions using [`docs/MAINTAINER-SECURITY.md`](docs/MAINTAINER-SECURITY.md).

## Pull requests

Explain what changed, why it is useful, how it was tested and any effect on the future security boundary. Keep UI changes keyboard accessible and avoid introducing network calls or telemetry.

Visual changes must follow [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md), reuse semantic tokens and be checked in both themes. New colors or interaction patterns require a documented rationale.
