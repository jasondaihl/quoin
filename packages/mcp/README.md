# @jasondaihl/quoin-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes
quoin's **design tokens** and **component APIs** to an AI assistant over stdio, so
it can build quoin UI correctly instead of guessing.

The server reads the **generated, authoritative artifacts** from the other
packages — `@jasondaihl/quoin-tokens`' token metadata (`dist/tokens.json`) and `@jasondaihl/quoin-core`'s
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
(`dist/custom-elements.json`) — so its answers can't drift from the source. See
[ADR-0007](../../docs/adr/0007-mcp-server.md) for the rationale.

## Tools

| Tool | What it does |
|------|--------------|
| `list_tokens` | List tokens, optionally filtered by `tier` (`semantic` \| `primitive`) and/or top-level `group` (`color`, `space`, …). |
| `get_token` | Resolve one token by dotted `path` → CSS var, type, light `value`, `valueDark`, and alias `reference`. |
| `search_tokens` | Substring search across path, CSS var, and value (e.g. "which token is `oklch(0.5106 0.2301 276.97)`"). |
| `list_components` | Every component with its tag, React wrapper name, and summary. |
| `get_component` | Full API for one component (by tag, React name, or bare name): props, slots, events, CSS parts, plus HTML + React usage snippets. |
| `check_usage` | Validate a token `path`, or a `component` (optionally a `prop`), **before** using it → `valid: true` with the resolved entry, or `valid: false` with the nearest real suggestions, so an agent can self-correct a typo instead of emitting a wrong CSS var or prop. |

## Resources

The whole authoritative dataset as readable documents, for pulling the full
picture into context in one read rather than many tool calls:

| Resource | Contents |
|----------|----------|
| `quoin://tokens.json` | Every token (path, CSS var, type, tier, light/dark value, alias). |
| `quoin://components.json` | Every component's full normalized API (props, slots, events, CSS parts/props, HTML + React usage). |

## Prompts

Guided, parameterized workflows that hand a client the recipe knowledge from the
[`.claude/skills`](../../.claude/skills) — the "how", to go with the tools' "what":

| Prompt | Argument | What it guides |
|--------|----------|----------------|
| `scaffold-component` | `name` | Adding a component the quoin way (web component → React wrapper, semantic tokens, real-Chromium + a11y tests). |
| `add-brand` | `brand` | Adding a brand/theme overlay across light + dark, including the WCAG-AA contrast rule. |

## Usage

Build the workspace first so the manifests exist:

```sh
pnpm build
```

Then register the server with your MCP client:

```sh
# Claude Code
claude mcp add quoin -- node /absolute/path/to/quoin/packages/mcp/dist/index.js
```

```jsonc
// …or a client config (e.g. Claude Desktop)
{
  "mcpServers": {
    "quoin": { "command": "node", "args": ["/absolute/path/to/quoin/packages/mcp/dist/index.js"] }
  }
}
```

To poke at it directly, use the MCP inspector:

```sh
npx @modelcontextprotocol/inspector node packages/mcp/dist/index.js
```

## How it stays in sync

Component metadata comes straight from the Lit sources via the analyzer, so keep
the structured JSDoc tags (`@slot`, `@fires`, `@csspart`) current when authoring a
component. The **one** hand-maintained piece is
[`src/react-hints.ts`](src/react-hints.ts), which maps each custom event to its
React callback prop name (e.g. `quoin-input` → `onValueInput`) — that rename exists
only in `@jasondaihl/quoin-react`, so it can't be derived from the manifest. Update it when the
React wrappers' event props change.
