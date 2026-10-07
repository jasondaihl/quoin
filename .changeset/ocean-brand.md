---
"@jasondaihl/quoin-tokens": minor
---

Add multi-brand theming on a brand × mode axis. The `default` brand remains the base
(`:root` / `[data-theme="dark"]`); additional brands are thin overlays scoped to
`[data-brand="<name>"]` that re-point only the semantic roles they change. Ships the
built-in **Ocean** brand (cyan/teal accent) and a Brand switcher in Storybook. See
`docs/adding-a-theme.md` and ADR-0008.
