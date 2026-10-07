# @jasondaihl/quoin-mcp

## 0.2.2

### Patch Changes

- Updated dependencies [a6f9fd6]
  - @jasondaihl/quoin-tokens@0.4.0
  - @jasondaihl/quoin-core@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [51c9b4d]
  - @jasondaihl/quoin-tokens@0.3.0
  - @jasondaihl/quoin-core@0.2.1

## 0.2.0

### Minor Changes

- bdaa65a: Prefix every package name with `quoin` for a consistent, self-describing namespace:
  `@jasondaihl/core` → `@jasondaihl/quoin-core`, `@jasondaihl/tokens` →
  `@jasondaihl/quoin-tokens`, `@jasondaihl/mcp` → `@jasondaihl/quoin-mcp`, and
  `@jasondaihl/react` → `@jasondaihl/quoin-react`. Consumers must update their import
  specifiers and `package.json` dependencies accordingly.

### Patch Changes

- Updated dependencies [bdaa65a]
  - @jasondaihl/quoin-core@0.2.0
  - @jasondaihl/quoin-tokens@0.2.0

## 0.1.0

### Minor Changes

- 9f7b575: Add `@jasondaihl/quoin-mcp`, a Model Context Protocol server that exposes quoin's design
  tokens and component APIs to AI assistants over stdio (`list_tokens`, `get_token`,
  `search_tokens`, `list_components`, `get_component`).

  To feed it, `@jasondaihl/quoin-tokens` now emits a `dist/tokens.json` metadata artifact
  (resolved light/dark values + alias references) and `@jasondaihl/quoin-core` now generates a
  Custom Elements Manifest (`dist/custom-elements.json`) from its Lit sources.

### Patch Changes

- Updated dependencies [9f7b575]
- Updated dependencies [03abdde]
  - @jasondaihl/quoin-tokens@0.1.0
  - @jasondaihl/quoin-core@0.1.0
