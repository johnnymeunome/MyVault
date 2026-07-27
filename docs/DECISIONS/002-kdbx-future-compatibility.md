# ADR 002: Future KDBX compatibility

- Status: Accepted
- Date: 2026-07-26

## Decision

MyVault will target interoperability with established KDBX files rather than inventing a proprietary vault format. No KDBX code is included in M0.

MyVault is an original Tauri/React application, **not a fork of KeePassXC**. Forking KeePassXC was considered but rejected for this product because its C++/Qt interface architecture and GPL inheritance would make a ground-up experience harder to isolate. Compatibility is pursued at the file-format boundary instead.

## Rollout

1. Review candidate Rust implementations and threat models.
2. Read a disposable fixture copy without writes.
3. Add compatibility and corruption tests.
4. Implement atomic writes to copies with backups.
5. Audit before recommending real credentials.

## Consequences

Domain entities remain independent from a particular parser. File access, unlock and serialization belong behind restricted Rust commands, with typed non-secret results crossing into the UI.
