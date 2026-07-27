# ADR 001: Tauri 2 with React

- Status: Accepted
- Date: 2026-07-26

## Decision

Use Tauri 2 as the native boundary and React + strict TypeScript + Vite for the product interface.

## Rationale

React supports fast iteration on a dense, accessible desktop interface. Tauri provides a narrow Rust command surface and a smaller distribution model than bundling a full browser runtime. The separation lets the future vault core remain outside the UI process.

## Consequences

Frontend code must treat Tauri as a capability boundary rather than importing sensitive OS behavior throughout components. Native builds require Rust and platform-specific prerequisites.
