# Architecture Decision Records

This directory records the significant, hard-to-reverse decisions behind quoin and
*why* they were made — so the reasoning survives past the moment it was obvious.

## Conventions

- **One file per decision**, named `NNNN-short-title.md`.
- ADRs are **immutable**. Don't rewrite a decision when you change your mind —
  add a new ADR and set the old one's status to `Superseded by ADR-XXXX`.
- Keep them short: *Context → Decision → Consequences → Alternatives considered*.
- Record decisions with real tradeoffs. Skip obvious or trivially reversible choices.

## How to add an ADR

1. Branch off `main`.
2. Copy [`template.md`](template.md) to `NNNN-short-title.md`, where `NNNN` is the
   next number in sequence.
3. Fill in *Context → Decision → Consequences → Alternatives considered*. Keep it to
   ~15–20 lines.
4. Add a row to the [Index](#index) below.
5. Open a PR.

To **reverse** a past decision, don't edit the old ADR — write a new one and set the
old one's status to `Superseded by ADR-XXXX` (and link the two).

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-web-components-core-with-react-wrappers.md) | Web Components core with React wrappers | Accepted |
| [0002](0002-lit-as-web-component-library.md) | Lit as the web-component library | Accepted |
| [0003](0003-css-custom-properties-in-shadow-dom.md) | Styling via CSS custom properties in Shadow DOM | Accepted |
| [0004](0004-dtcg-tokens-with-style-dictionary.md) | DTCG tokens + Style Dictionary, two-tier model | Accepted |
| [0005](0005-pnpm-monorepo.md) | pnpm monorepo (`tokens → core → react`) | Accepted |
| [0006](0006-real-browser-testing.md) | Real-browser testing with Vitest browser mode | Accepted |
