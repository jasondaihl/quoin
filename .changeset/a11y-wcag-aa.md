---
"@jasondaihl/quoin-tokens": minor
"@jasondaihl/quoin-core": patch
---

Enforce WCAG AA accessibility. Adds a `color.text.on-danger` semantic role and remediates
contrast across all brand×mode themes: Ocean now uses dark `text.on-accent` on its cyan
accent, dark-mode accent/danger are deepened, and `border.strong` is darkened to meet the
3:1 control-border threshold. Contrast is now verified by a tokens test across every theme,
components are checked with axe-core in their tests, and the input associates its
helper/error text via `aria-describedby`. See ADR-0009.
