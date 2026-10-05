# ADR-0002: Lit as the web-component library

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Given the decision to build framework-agnostic Web Components ([ADR-0001](0001-web-components-core-with-react-wrappers.md)),
we need a way to author them. Raw custom elements are verbose (manual attribute
observation, template diffing, style setup), and a learning goal is to understand
the *platform*, not to hide behind a heavy abstraction.

## Decision

Use **Lit 3** to author the components.

## Consequences

- Small and close to the platform: reactive properties, `html` templating, and
  scoped styles with little ceremony, while still teaching real browser APIs
  (custom elements, Shadow DOM, slots, `ElementInternals`).
- Good TypeScript ergonomics via decorators.
- Costs we accept: a small runtime dependency, and a decorator configuration quirk
  (`experimentalDecorators` + `useDefineForClassFields: false`) that must be kept
  consistent across `tsconfig` and the bundler.

## Alternatives considered

- **Vanilla custom elements** — zero dependencies, but far more boilerplate for
  reactivity, templating, and styling; worse day-to-day ergonomics.
- **Stencil** — a compiler that also generates framework wrappers, but heavier and
  more opinionated, with more build-time "magic" and less direct exposure to the
  native APIs we want to learn.
