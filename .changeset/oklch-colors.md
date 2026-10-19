---
"@jasondaihl/quoin-tokens": minor
"@jasondaihl/quoin-mcp": patch
---

Emit colors as OKLCH. The compiled `tokens.css` and `tokens.json` now express every
color as `oklch(L C H)` instead of hex, via Style Dictionary's built-in `color/oklch`
transform. Source ramps stay authored in hex and the conversion is lossless (identical
rendered colors), so `var(--quoin-color-*)` consumers are unaffected; only code that
parsed the raw hex strings from the published artifacts needs to read oklch. The MCP
`search_tokens` examples are updated accordingly (hex substring lookups no longer match).
