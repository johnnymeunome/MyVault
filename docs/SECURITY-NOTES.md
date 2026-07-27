# Security notes

## M0 threat posture

M0 is a product prototype, not a secure vault. The app includes plaintext fixture passwords in the frontend bundle, keeps edited values in JavaScript memory and has not undergone security review. Never enter a real password.

## Deliberate safeguards

- No `localStorage`, IndexedDB or file persistence
- No network requests or telemetry
- No password logging
- Minimal Tauri capability set (`core:default` only)
- Privileged operations reserved for narrow Rust commands
- Clipboard access isolated behind a gateway

## Clipboard limitation

The browser preview uses `navigator.clipboard.writeText`. After the visible countdown it attempts to overwrite the clipboard with an empty string. The operating system or browser may refuse this when the window is unfocused, and another application could have replaced the clipboard in the meantime. A later native implementation must use reviewed platform behavior, avoid erasing unrelated content and document guarantees per OS.

## Before real-world use

Threat modeling, audited cryptographic dependencies, KDBX compatibility tests, locked-memory strategy, redacted crash reporting, keychain policy, filesystem permissions, signed updates, secure backups and an independent audit are required.
