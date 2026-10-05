# ADR-0001: Web Components core with React wrappers

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

quoin needs to be usable from React today, but also wants to stay
framework-agnostic over the long term. A secondary, explicit goal is to learn Web
Components and refresh modern React. The core question is which model owns a
component's logic and markup, and how the other consumes it.

A key asymmetry drives the choice: wrapping a Web Component for React is cheap
(the wrapper is mostly typing), while going the other direction — reimplementing
a React component as a Web Component later — is effectively a rewrite.

## Decision

Author each component **once as a framework-agnostic Web Component** (`@quoin/core`)
and expose it to React through a **thin wrapper** (`@quoin/react`).

## Consequences

- Single source of truth: markup, styles, and behavior live in one place and work
  in React, other frameworks, or plain HTML.
- Style encapsulation comes for free via Shadow DOM.
- The React wrapper surface is small — mostly prop typing and custom-event bridging.
- Costs we accept: the most upfront setup of the options (WC build + wrapper layer),
  fiddlier SSR than React-native components, and real (if now-minor) React↔WC
  interop seams — eased considerably by React 19's property/event handling.

## Alternatives considered

- **React-first, Web Components later** — fastest to usable components, but leaves
  the system React-bound, and the later WC layer would be a rewrite, not a wrap.
- **Both, maintained independently** — idiomatic per platform, but ~2× the work and
  a permanent sync burden; not worth it for a personal system.
- **React only** — simplest scope, but permanently React-bound, contradicting the
  framework-agnostic and Web-Components-learning goals.
