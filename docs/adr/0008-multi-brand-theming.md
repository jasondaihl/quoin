# ADR-0008: Multi-brand theming on a brand × mode axis

- **Status:** Accepted
- **Date:** 2026-10-07

## Context

[ADR-0004](0004-dtcg-tokens-with-style-dictionary.md) chose a two-tier token model
"so theming and a future rebrand are possible without touching components," and shipped
one theming axis: **mode** (light/dark), switched via `data-theme`. We now want more than
one **brand** (a distinct accent identity) selectable independently of light/dark, still
without changing a single component.

## Decision

Add **brand** as a second, orthogonal axis, applied with a `data-brand` attribute.

- The **`default` brand is the base**: its light set defines every token on `:root`
  (primitives + semantics); its dark set overrides semantic color roles under
  `[data-theme="dark"]`.
- Every **other brand is a thin overlay** — it re-declares *only* the semantic roles it
  changes (for Ocean, `color.accent.*` + `color.focus.ring`), compiled to
  `[data-brand="<name>"]` (light) and `[data-brand="<name>"][data-theme="dark"]` (dark).
- Source lives under `tokens/semantic/brands/<name>/{light,dark}.json`; `sd.build.js`
  loops over a `BRANDS` list, emitting one CSS layer per brand × mode.

CSS **cascade + specificity** resolves any combination. A brand's dark layer
(`[data-brand][data-theme="dark"]`, specificity 0,2,0) beats the base dark layer (0,1,0);
roles a brand doesn't override simply fall through to the base light/dark values.

## Consequences

- A new brand is a small override file plus one entry in `BRANDS` — no component,
  story, or wrapper changes. See [adding-a-theme](../adding-a-theme.md).
- Accent-only overlays stay tiny and make the cascade the single source of truth; a brand
  *can* grow to override more roles when it needs to diverge further.
- The generated `tokens.json` metadata (consumed by the MCP server and the Design Tokens
  story) tracks the **default** brand only; other brands are a pure CSS concern. The
  reference swatches read live CSS vars, so they still re-theme with the Brand toolbar.
- Cost we accept: layer **order matters** for equal-specificity collisions, so the build
  concatenates fragments in a fixed cascade order (base `:root`, base dark, then each
  overlay's light then dark).

## Alternatives considered

- **A full semantic set per brand** — each brand redeclares every role. Simpler cascade
  (no specificity reasoning), but far more to author and keep in sync for what is usually
  just an accent change.
- **Separate stylesheet per brand** (`ocean.css`) loaded on demand — avoids one combined
  file, but complicates consumption and the Storybook switcher, and loses the single
  cascade that lets unoverridden roles fall through to the base.
- **Runtime primitive overrides** (re-point `palette.*` per brand) — rejected for the same
  reason as in ADR-0004: theming belongs at the semantic layer, and we emit resolved
  literals, not nested `var()` references.
