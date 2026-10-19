---
name: add-component
description: Add a new quoin component following the web-component → React-wrapper recipe. Use when asked to add or create a new component (e.g. a Badge, Card, Toggle) in the quoin design system.
---

# Adding a quoin component

Every component goes from a framework-agnostic web component in `@jasondaihl/quoin-core`
to a thin React wrapper in `@jasondaihl/quoin-react`. `quoin-button` is the reference
example. Replace `<name>` (kebab, e.g. `badge`) / `<Name>` (Pascal, e.g. `Badge`) below.

1. **Branch.** `main` is protected — branch off it (`feat/<name>`). See
   [CONTRIBUTING.md](../../../CONTRIBUTING.md).

2. **Author the web component** — `packages/core/src/<name>/quoin-<name>.ts`:
   - Extend `QuoinElement` (gives `baseStyles` + token-friendly defaults).
   - Register with `@customElement('quoin-<name>')`.
   - Declare the public API with `@property(...)`; use `reflect: true` for any property
     you target from CSS via an attribute selector (`:host([variant='...'])`).
   - **Style only with semantic tokens** — `var(--quoin-color-…)`, `var(--quoin-space-…)`.
     Never hard-code a value a token already covers.
   - Add a `declare global { interface HTMLElementTagNameMap { 'quoin-<name>': Quoin<Name> } }`
     block.
   - For custom behavior, dispatch a `CustomEvent` with `{ bubbles: true, composed: true }`
     so it escapes the Shadow DOM.

3. **Test it (real Chromium)** — `packages/core/src/<name>/quoin-<name>.test.ts`:
   mount the element, `await el.updateComplete`, assert against the shadow root. Add an
   accessibility check with `expectNoA11yViolations` (from `../test-utils.js`) over the
   component's representative states.

4. **Add a story** — `packages/core/src/<name>/quoin-<name>.stories.ts` (CSF3, `html`
   from `lit`). The theme toolbar and `tokens.css` are already wired in
   `.storybook/preview.ts`.

5. **Export it** — add the element + its types to `packages/core/src/index.ts`.

6. **Wrap it for React** — `packages/react/src/<Name>.tsx`:
   - `import '@jasondaihl/quoin-core'` (registers the element).
   - Augment `JSX.IntrinsicElements` with the tag + its attribute types.
   - Forward props straight through; accept `ref` as a prop (React 19).
   - Bridge any **custom** events with a `ref` + `useEffect`
     (`addEventListener('quoin-…')`) — React won't bind those declaratively.
   - Export from `packages/react/src/index.ts`; add `<Name>.test.tsx` and
     `<Name>.stories.tsx` mirroring the core ones.

7. **Build & verify:** `pnpm build && pnpm test && pnpm lint`.

8. **Open a PR.** The `verify` check must pass; merge with squash or rebase (linear
   history — no merge commits).

Full detail and rationale: [docs/adding-a-component.md](../../../docs/adding-a-component.md)
(`quoin-button` is the reference example).
