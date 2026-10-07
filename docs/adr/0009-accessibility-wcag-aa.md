# ADR-0009: Accessibility — WCAG AA as a tested contract

- **Status:** Accepted
- **Date:** 2026-10-07

## Context

Components were built with good a11y defaults, but nothing *enforced* it — and with two
brands × light/dark ([ADR-0008](0008-multi-brand-theming.md)) the contrast surface
multiplied. Measuring the themes found real failures, most starkly the Ocean brand's white
text on its cyan accent (3.68:1 light, 2.43:1 dark) and white-on-red danger in dark mode.
We want regressions caught automatically rather than by eye.

## Decision

Treat **WCAG 2.1 AA as a tested contract**, enforced in CI, plus an advisory layer in
Storybook.

- **Contrast (themes)** — `packages/tokens/test/contrast.test.js` reads the built
  `tokens.css`, recomposes each brand×mode theme by the CSS cascade, and asserts role
  pairs: **4.5:1** for text (incl. `text.on-accent`/accent and `text.on-danger`/danger),
  **3:1** for interactive/UI (focus ring, control borders, accent-as-fill). Transient
  states (hover/active) and purely decorative borders are **advisory** — reported, not
  gated.
- **Components** — axe-core runs in the existing real-browser vitest tests
  (`expectNoA11yViolations`), gating structural a11y (roles, names, ARIA). Color-contrast
  is disabled there because it's owned authoritatively by the token test.
- **Storybook** — `@storybook/addon-a11y` gives every story a live axe panel under the
  active Theme/Brand toolbar. Advisory DX, not a CI gate.

To make the gated pairs pass we chose, for a **light accent, dark `text.on-accent`** rather
than darkening the accent: Ocean keeps its vibrant cyan and uses dark button text
(`text.on-accent` → neutral-950). `text.on-danger` was split from `text.on-accent` so danger
can stay white-on-red while Ocean's accent text goes dark. Base dark accent/danger deepened
one step, and `border.strong` darkened to neutral-500 for the 3:1 control-border threshold.

## Consequences

- A11y regressions (a new brand with a low-contrast accent, a dropped ARIA attribute) fail
  `verify` before merge. The Ocean accent bug is fixed, not just documented.
- A brand with a light accent must set its own `text.on-accent` — this is the documented
  pattern (see [adding-a-theme](../adding-a-theme.md)), and the contrast test enforces it.
- Costs we accept: contrast lives in a token-level test (not axe on every component) because
  component unit tests don't load `tokens.css`; and visibly darker control borders.
- Hover/active contrast is advisory — a deliberate scope choice; the resting states, which
  automated tooling snapshots, all meet AA.

## Alternatives considered

- **Darken accents so white text always passes** — would turn Ocean into a dim dark-teal in
  dark mode; dark-text-on-vibrant-accent reads better and is the common pattern for light hues.
- **axe color-contrast on components across themes** — duplicates the token test, needs
  tokens.css loaded per theme, and is flakier (opacity on disabled controls trips it).
- **AAA (7:1)** — would force a palette overhaul (muted text and most accents fail); AA is
  the design-system norm.
