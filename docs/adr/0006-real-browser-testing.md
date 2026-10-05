# ADR-0006: Real-browser testing with Vitest browser mode

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

The components depend on browser features that simulated DOMs implement
imperfectly: Shadow DOM, custom-element upgrade timing, adopted stylesheets,
`ElementInternals`, and native form participation. The React wrappers additionally
exercise React 19 ↔ custom-element interop. Tests need these to behave as they do
in production.

## Decision

Run tests with **Vitest in browser mode** using the **Playwright (Chromium)**
provider, for both `@quoin/core` and `@quoin/react`.

## Consequences

- Tests exercise real DOM semantics — this is what let us actually verify form
  submission through `ElementInternals`, event retargeting across the shadow
  boundary, and property/custom-event interop from React.
- One familiar runner (Vitest) and assertion style across packages.
- Costs we accept: browser binaries must be installed (an extra CI step,
  `playwright install --with-deps chromium`) and startup is slightly slower than a
  simulated DOM.

## Alternatives considered

- **jsdom / happy-dom** — fast and binary-free, but unreliable for Shadow DOM,
  adopted stylesheets, and `ElementInternals`; they would give false confidence for
  exactly the features that matter most here.
- **@web/test-runner** — also real-browser and Lit-recommended, but a separate
  toolchain from Vitest; using one runner for both packages is simpler.
