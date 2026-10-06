---
"@jasondaihl/quoin-core": minor
"@jasondaihl/quoin-tokens": minor
"@jasondaihl/quoin-mcp": minor
"@jasondaihl/quoin-react": minor
---

Prefix every package name with `quoin` for a consistent, self-describing namespace:
`@jasondaihl/core` → `@jasondaihl/quoin-core`, `@jasondaihl/tokens` →
`@jasondaihl/quoin-tokens`, `@jasondaihl/mcp` → `@jasondaihl/quoin-mcp`, and
`@jasondaihl/react` → `@jasondaihl/quoin-react`. Consumers must update their import
specifiers and `package.json` dependencies accordingly.
