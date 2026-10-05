# Architecture Decision Records

This directory records the significant, hard-to-reverse decisions behind quoin and
*why* they were made — so the reasoning survives past the moment it was obvious.

## Conventions

- **One file per decision**, named `NNNN-short-title.md`.
- ADRs are **immutable**. Don't rewrite a decision when you change your mind —
  add a new ADR and set the old one's status to `Superseded by ADR-XXXX`.
- Keep them short: *Context → Decision → Consequences → Alternatives considered*.
- Record decisions with real tradeoffs. Skip obvious or trivially reversible choices.
- Copy [`template.md`](template.md) to start a new one.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-web-components-core-with-react-wrappers.md) | Web Components core with React wrappers | Accepted |
| [0002](0002-lit-as-web-component-library.md) | Lit as the web-component library | Accepted |
| [0003](0003-css-custom-properties-in-shadow-dom.md) | Styling via CSS custom properties in Shadow DOM | Accepted |
| [0004](0004-dtcg-tokens-with-style-dictionary.md) | DTCG tokens + Style Dictionary, two-tier model | Accepted |
| [0005](0005-pnpm-monorepo.md) | pnpm monorepo (`tokens → core → react`) | Accepted |
| [0006](0006-real-browser-testing.md) | Real-browser testing with Vitest browser mode | Accepted |
