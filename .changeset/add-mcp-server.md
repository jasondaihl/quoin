---
"@jasondaihl/mcp": minor
"@jasondaihl/tokens": minor
"@jasondaihl/core": minor
---

Add `@jasondaihl/mcp`, a Model Context Protocol server that exposes quoin's design
tokens and component APIs to AI assistants over stdio (`list_tokens`, `get_token`,
`search_tokens`, `list_components`, `get_component`).

To feed it, `@jasondaihl/tokens` now emits a `dist/tokens.json` metadata artifact
(resolved light/dark values + alias references) and `@jasondaihl/core` now generates a
Custom Elements Manifest (`dist/custom-elements.json`) from its Lit sources.
