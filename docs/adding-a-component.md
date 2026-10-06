# Recipe: adding a component

Every quoin component follows the same path, from the framework-agnostic web
component to its React wrapper. `quoin-button` is the reference example.

Say you're adding a `Badge`.

## 1. Author the web component (`@jasondaihl/quoin-core`)

Create `packages/core/src/badge/quoin-badge.ts`:

- Extend `QuoinElement` (gives you `baseStyles` + token-friendly defaults).
- Register with `@customElement('quoin-badge')`.
- Declare public API with `@property(...)`. Use `reflect: true` for any property
  you target from CSS with an attribute selector (`:host([variant='...'])`).
- Style **only with semantic tokens** — `var(--quoin-color-...)`, `var(--quoin-space-...)`,
  etc. Never hard-code a color or pixel value that a token already covers.
- Add a `declare global { interface HTMLElementTagNameMap { 'quoin-badge': QuoinBadge } }`
  block so TypeScript and templating libraries know the tag.
- For custom behavior, dispatch a `CustomEvent` (`bubbles: true, composed: true`)
  so it escapes the Shadow DOM.

## 2. Test it (real browser)

Create `packages/core/src/badge/quoin-badge.test.ts`. Mount the element, `await
el.updateComplete`, and assert against the shadow root. Tests run in Chromium via
`vitest` browser mode, so Shadow DOM and custom-element upgrades behave for real.

## 3. Add a story

Create `packages/core/src/badge/quoin-badge.stories.ts` (CSF3, `html` from `lit`).
The theme toolbar and `tokens.css` are already wired up in `.storybook/preview.ts`.

## 4. Export it

Add to `packages/core/src/index.ts`:

```ts
export { QuoinBadge } from './badge/quoin-badge.js';
export type { QuoinBadgeVariant } from './badge/quoin-badge.js';
```

## 5. Wrap it for React (`@jasondaihl/quoin-react`)

Create `packages/react/src/Badge.tsx`:

- `import '@jasondaihl/quoin-core'` (registers the element).
- Augment `JSX.IntrinsicElements` with the tag + its attribute types.
- Forward props straight through; accept `ref` as a prop (React 19).
- Bridge any **custom** events with a `ref` + `useEffect`
  (`addEventListener('quoin-...')`) — React won't bind those declaratively.
- Export from `packages/react/src/index.ts`.

Add a React test (`Badge.test.tsx`) and story (`Badge.stories.tsx`) mirroring the core ones.

## 6. Build & verify

```sh
pnpm build        # tokens → core → react
pnpm test         # all package tests
pnpm lint         # biome
```

That's the whole loop. The only per-component thinking is steps 1 and 5; the rest
is mechanical.
