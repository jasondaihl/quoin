# @jasondaihl/quoin-tokens

## 0.4.0

### Minor Changes

- a6f9fd6: Enforce WCAG AA accessibility. Adds a `color.text.on-danger` semantic role and remediates
  contrast across all brand×mode themes: Ocean now uses dark `text.on-accent` on its cyan
  accent, dark-mode accent/danger are deepened, and `border.strong` is darkened to meet the
  3:1 control-border threshold. Contrast is now verified by a tokens test across every theme,
  components are checked with axe-core in their tests, and the input associates its
  helper/error text via `aria-describedby`. See ADR-0009.

## 0.3.0

### Minor Changes

- 51c9b4d: Add multi-brand theming on a brand × mode axis. The `default` brand remains the base
  (`:root` / `[data-theme="dark"]`); additional brands are thin overlays scoped to
  `[data-brand="<name>"]` that re-point only the semantic roles they change. Ships the
  built-in **Ocean** brand (cyan/teal accent) and a Brand switcher in Storybook. See
  `docs/adding-a-theme.md` and ADR-0008.

## 0.2.0

### Minor Changes

- bdaa65a: Prefix every package name with `quoin` for a consistent, self-describing namespace:
  `@jasondaihl/core` → `@jasondaihl/quoin-core`, `@jasondaihl/tokens` →
  `@jasondaihl/quoin-tokens`, `@jasondaihl/mcp` → `@jasondaihl/quoin-mcp`, and
  `@jasondaihl/react` → `@jasondaihl/quoin-react`. Consumers must update their import
  specifiers and `package.json` dependencies accordingly.

## 0.1.0

### Minor Changes

- 9f7b575: Add `@jasondaihl/quoin-mcp`, a Model Context Protocol server that exposes quoin's design
  tokens and component APIs to AI assistants over stdio (`list_tokens`, `get_token`,
  `search_tokens`, `list_components`, `get_component`).

  To feed it, `@jasondaihl/quoin-tokens` now emits a `dist/tokens.json` metadata artifact
  (resolved light/dark values + alias references) and `@jasondaihl/quoin-core` now generates a
  Custom Elements Manifest (`dist/custom-elements.json`) from its Lit sources.

- 03abdde: Initial release of quoin: design tokens (DTCG → CSS variables + typed TS), core
  web components (`button`, `input`, `stack`, `icon`) built with Lit, and React 19
  wrappers.
