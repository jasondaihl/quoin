# quoin

A personal design system: **design tokens** plus **framework-agnostic web
components** (built with [Lit](https://lit.dev)) and **thin React 19 wrappers**.

Components are authored once as custom elements and exposed to React through small
typed wrappers, so the same `<quoin-button>` works in React, another framework, or
plain HTML.

## Packages

| Package | What it is |
|---------|------------|
| [`@quoin/tokens`](packages/tokens) | Design tokens authored in the [W3C DTCG](https://tr.designtokens.org/) format, compiled by [Style Dictionary](https://styledictionary.com) to CSS custom properties + typed TS. |
| [`@quoin/core`](packages/core) | The web components (`quoin-button`, `quoin-input`, `quoin-stack`, `quoin-icon`). |
| [`@quoin/react`](packages/react) | React 19 wrappers (`Button`, `Input`, `Stack`, `Icon`). |

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

## Development

```sh
pnpm install
pnpm build                              # tokens → core → react
pnpm test                               # all tests (core/react run in Chromium)
pnpm lint                               # biome

pnpm --filter @quoin/core storybook     # web-component docs  (:6006)
pnpm --filter @quoin/react storybook    # React docs          (:6007)
```

First run of the browser tests needs Chromium: `pnpm --filter @quoin/core exec playwright install chromium`.

## Adding a component

See [docs/adding-a-component.md](docs/adding-a-component.md) for the full recipe.
