# Architecture

## Boundaries

```text
React UI -> Zustand actions -> domain services/repositories
                                |
                                +-> mock repository (M0)
                                +-> restricted Tauri commands (future)
```

- `domain/` contains portable entities and pure rules.
- `features/` owns product behavior and feature-level UI.
- `stores/` coordinates session-only state and exposes intentional actions.
- `infrastructure/mocks/` supplies fixtures; it is the only M0 entry repository.
- `infrastructure/tauri/` is the future bridge for privileged operations.
- `src-tauri/` exposes an intentionally tiny command surface. Security and vault modules are placeholders, not implementations.

UI components never invoke filesystem or OS APIs directly. Clipboard behavior goes through a gateway so a reviewed Tauri implementation can replace the browser fallback.

## State model

The Zustand store retains vault selection, navigation, entry fixtures and transient overlays. It deliberately uses no persistence middleware. Form drafts remain inside dialogs. Generated passwords and copied values are not logged.

## Presentation system

The UI uses semantic CSS tokens as the boundary between product intent and component styling. Neutral surfaces define hierarchy; the MyVault steel-blue tokens identify navigation, focus and information; security states retain independent success, warning and danger colors.

- `src/styles/tokens.css` is the source of truth for themes and semantic colors.
- `src/styles/globals.css` implements layout and shared component states.
- feature components should consume tokens instead of introducing isolated colors.
- brand colors are permitted only inside entry-logo containers.

The complete visual contract is documented in [`docs/DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) and governed by [ADR 003](DECISIONS/003-codex-inspired-visual-language.md).

## Future KDBX integration

The `EntryRepository` contract will be implemented behind a Rust command boundary. Parsing, unlock and writes must never be added directly to React. The first integration is read-only and operates on a disposable copy of a fixture vault.
