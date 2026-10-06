# ADR-0005: pnpm monorepo (`tokens → core → react`)

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

quoin is naturally several related packages with a dependency chain: design tokens
feed the web components, which the React wrappers build on. These version and
publish at different cadences and should be consumable independently.

## Decision

Use a **pnpm workspace** with three packages — `@jasondaihl/tokens`, `@jasondaihl/core`,
`@jasondaihl/react` — built in topological order, with Changesets for versioning and
release.

## Consequences

- Clear package boundaries and independent versioning/publishing; workspace linking
  (`workspace:*`) keeps local development wired together.
- A single `pnpm build` / `pnpm test` / `pnpm lint` fans out across packages.
- Costs we accept: more configuration than a single package, and the need to
  coordinate cross-package rebuilds (e.g. rebuild `core` before `react` consumes it).

## Alternatives considered

- **Single package** — simplest to publish and reason about, but forces coarse,
  all-or-nothing consumption and versioning; a consumer wanting only tokens would
  still pull in Lit and React types.
- **npm / yarn workspaces** — functionally comparable, but pnpm is faster and
  stricter. Its strictness actively surfaced genuinely missing dependencies during
  setup (e.g. renderer packages not declared directly), which we consider a feature.
