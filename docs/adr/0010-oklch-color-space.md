# ADR-0010: OKLCH as the emitted color space

- **Status:** Accepted
- **Date:** 2026-10-19

## Context

Color tokens are authored as hex ramps and compiled by Style Dictionary into
`tokens.css` and `tokens.json`. Hex is sRGB-only and perceptually non-uniform —
equal numeric steps aren't equal visual steps — which makes building even ramps and
reasoning about lightness/chroma for theming and contrast awkward. OKLCH is
perceptually uniform, is now broadly supported in browsers, and is the modern CSS
default for design systems.

## Decision

Emit colors as OKLCH. Swap Style Dictionary's `color/css` transform for its built-in
`color/oklch` (backed by colorjs.io), so the compiled `tokens.css` and `tokens.json`
express every color as `oklch(L C H)`. Source ramps stay authored in **hex** (see
[ADR-0004](0004-dtcg-tokens-with-style-dictionary.md)) — conversion happens at build
time. The WCAG AA contrast contract ([ADR-0009](0009-accessibility-wcag-aa.md)) is
preserved by having its test parse the oklch value and compute the ratio via colorjs.io.

## Consequences

- The conversion is lossless for our in-gamut sRGB palette: rendered colors are
  identical, and `var(--quoin-color-*)` consumers are unaffected.
- Lightness/chroma/hue are now legible directly in the output, easing future ramp
  tuning and a possible move to wider-gamut (P3) accents.
- Code that parsed the raw hex strings from the published artifacts must read oklch;
  the MCP `search_tokens` hex-substring lookups no longer match.
- `colorjs.io` becomes a (dev) dependency of the tokens package.

## Alternatives considered

- **Keep hex.** Simplest, but forfeits perceptual uniformity and the modern baseline.
- **Re-author the source ramps in OKLCH.** Enables perceptual ramp tuning at the
  source, but a large hand-edited diff and loses the recognizable hex ramps. Deferred —
  this representation-only step doesn't preclude it later.
- **Custom transform / another color lib (culori).** Unnecessary: Style Dictionary v5
  ships `color/oklch`, and colorjs.io is already in the dependency tree.
