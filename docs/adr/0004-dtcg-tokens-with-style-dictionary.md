# ADR-0004: DTCG tokens + Style Dictionary, two-tier model

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Components consume tokens as CSS variables ([ADR-0003](0003-css-custom-properties-in-shadow-dom.md)),
but we also want typed references in TypeScript, a single authoring source, and a
structure that supports theming and a future rebrand without touching components.

## Decision

Author tokens in the **W3C DTCG** JSON format and compile them with **Style
Dictionary** into `tokens.css` (CSS custom properties) and a typed TS module of
`var()` references. Organize tokens in **two tiers**:

- **Primitive** — raw values (`palette.indigo.600`, `space.4`).
- **Semantic** — role-based aliases (`color.accent.default`, `color.text.muted`)
  that reference primitives.

Components consume **semantic tokens only**. Light lives on `:root`; dark overrides
semantic values under `[data-theme="dark"]`.

## Consequences

- Industry-standard format with multi-platform output from one source; typed TS
  references give autocomplete on token paths.
- The two-tier split is what makes theming and rebranding possible — swap what
  semantic roles point at, leave components untouched.
- Costs we accept: a build step, driven by a small *programmatic* Style Dictionary
  script (rather than declarative config) so we can emit one combined light+dark
  stylesheet from two token sets.
- We emit **resolved literal values** (`outputReferences: false`) rather than nested
  `var()` references in the compiled CSS. Theming happens at the semantic layer, so
  runtime primitive overrides aren't needed, and literals keep the output simple and
  free of reference-resolution edge cases.

## Alternatives considered

- **Hand-authored CSS variables** — simplest to start, but no typed outputs and it
  doesn't scale or theme cleanly.
- **A fully custom build script** — total control with fewer dependencies, but more
  code to own for no real gain over Style Dictionary.
