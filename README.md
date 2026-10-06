# quoin

A personal design system: **design tokens** plus **framework-agnostic web
components** (built with [Lit](https://lit.dev)) and **thin React 19 wrappers**.

Components are authored once as custom elements and exposed to React through small
typed wrappers, so the same `<quoin-button>` works in React, another framework, or
plain HTML.

**▶ [Explore the components in Storybook](https://jasondaihl.github.io/quoin/)** —
live docs with light/dark theming for both the [Core web components](https://jasondaihl.github.io/quoin/core/)
and the [React wrappers](https://jasondaihl.github.io/quoin/react/), deployed from `main` on every push.

## Packages

| Package | What it is |
|---------|------------|
| [`@quoin/tokens`](packages/tokens) | Design tokens authored in the [W3C DTCG](https://tr.designtokens.org/) format, compiled by [Style Dictionary](https://styledictionary.com) to CSS custom properties + typed TS. |
| [`@quoin/core`](packages/core) | The web components (`quoin-button`, `quoin-input`, `quoin-stack`, `quoin-icon`). |
| [`@quoin/react`](packages/react) | React 19 wrappers (`Button`, `Input`, `Stack`, `Icon`). |
| [`@quoin/mcp`](packages/mcp) | An [MCP](https://modelcontextprotocol.io) server exposing the tokens and component APIs to AI assistants. |

## Architecture

```
@quoin/tokens  →  @quoin/core (Lit)  →  @quoin/react (wrappers)
```

Tokens are **two-tier**: primitive values (`palette.indigo.600`, `space.4`) and
semantic roles (`color.accent.default`, `color.text.muted`) that reference them.
Components consume **only semantic tokens**, which is what makes theming work.

## Usage

### 1. Load the tokens stylesheet once

The token CSS variables live on `:root`; custom properties inherit through the
Shadow DOM, so components just read them.

```ts
import '@quoin/tokens/tokens.css';
```

### 2a. Use the web components anywhere

```ts
import '@quoin/core'; // registers all elements
```

```html
<quoin-button variant="primary">Save</quoin-button>
```

### 2b. …or the React wrappers

```tsx
import { Button, Input, Stack } from '@quoin/react';

<Stack gap="5">
  <Input label="Email" type="email" required />
  <Button variant="primary" onClick={(e) => console.log(e.detail)}>
    Sign in
  </Button>
</Stack>;
```

## Theming

Light is the default (`:root`). Switch to dark by setting an attribute on any
ancestor — no component changes needed:

```html
<html data-theme="dark">
```

Because every component reads semantic variables, flipping `data-theme` re-themes
the whole tree.

## React + custom events

React 19 sets custom-element *properties* (so `variant`, `disabled`, `value` etc.
just work as JSX props) but does **not** bind arbitrary *custom events*
declaratively. The wrappers handle this: they attach `quoin-click` / `quoin-input`
/ `quoin-change` listeners via a `ref` + effect and surface them as `onClick` /
`onValueInput` / `onValueChange` callbacks.

> **SSR note.** The React wrappers are client-side: they register custom elements
> and attach event listeners in the browser. Server-rendering custom elements
> (Declarative Shadow DOM) is not wired up here, so in frameworks like Next.js use
> these in client components for now.

## MCP server

[`@quoin/mcp`](packages/mcp) is a [Model Context Protocol](https://modelcontextprotocol.io)
server that lets an AI assistant (Claude Code/Desktop, Cursor, …) query quoin
directly instead of guessing: resolve a token to its light/dark value, or get a
component's full prop/slot/event API with ready-to-paste HTML and React snippets.
It reads the generated token metadata and Custom Elements Manifest, so its answers
never drift from the source.

Build it (`pnpm build`), then register the stdio server with your client:

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

Tools: `list_tokens`, `get_token`, `search_tokens`, `list_components`,
`get_component`. See [`packages/mcp`](packages/mcp) for details.

## Development

```sh
pnpm install
pnpm build                              # tokens → core → react → mcp
pnpm test                               # all tests (core/react run in Chromium)
pnpm lint                               # biome

pnpm --filter @quoin/core storybook     # web-component docs  (:6006)
pnpm --filter @quoin/react storybook    # React docs          (:6007)
```

First run of the browser tests needs Chromium: `pnpm --filter @quoin/core exec playwright install chromium`.

## Adding a component

See [docs/adding-a-component.md](docs/adding-a-component.md) for the full recipe.

## Why it's built this way

The significant architectural decisions and their rationale are recorded as
[Architecture Decision Records](docs/adr/).
