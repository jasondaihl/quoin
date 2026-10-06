# ADR-0003: Styling via CSS custom properties in Shadow DOM

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

Components render inside Shadow DOM ([ADR-0002](0002-lit-as-web-component-library.md)),
which encapsulates styles and blocks external selectors — including utility-class
frameworks — from reaching in. We still need consistent theming across all
components, including light/dark.

## Decision

Express design tokens as **CSS custom properties** and style each component with
**plain CSS inside its shadow root**, referencing only **semantic** tokens
(`var(--quoin-color-...)`, `var(--quoin-space-...)`). The token stylesheet is loaded
once on the document `:root`.

## Consequences

- Zero styling runtime; styles are encapsulated and can't leak in or out.
- Custom properties inherit *through* the Shadow DOM boundary, so a single
  `data-theme` switch on an ancestor re-themes every component with no component
  changes — the central property we wanted ([ADR-0004](0004-dtcg-tokens-with-style-dictionary.md)).
- Costs we accept: no utility-class authoring ergonomics, and consumers must load
  `@jasondaihl/quoin-tokens/tokens.css` once for the variables to exist.

## Alternatives considered

- **Tailwind** — great app-level DX, but its classes cannot style content inside
  Shadow DOM, and it would couple the system to Tailwind.
- **vanilla-extract / CSS-in-TS** — type-safe and strong for React, but awkward for
  Web Components and adds build/runtime machinery we don't need.
