# ADR-0007: MCP server exposing tokens and component APIs

- **Status:** Accepted
- **Date:** 2026-10-06

## Context

quoin's value is helping build correct UI, but what the semantic tokens resolve
to and what props/variants/slots/events each component has lives only in source
and Storybook. An AI assistant consuming quoin has to guess or scrape that, which
is exactly where it gets details wrong.

The [Model Context Protocol](https://modelcontextprotocol.io) is the emerging way
to feed a local assistant (Claude Code/Desktop, Cursor) structured, tool-shaped
knowledge. The question is whether to add one, and — given we have it — how to keep
its answers from drifting out of sync with the components and tokens they describe.

## Decision

Add a fourth workspace package **`@jasondaihl/quoin-mcp`** that runs an MCP server over
**stdio**, exposing both **design tokens** (`list_tokens`, `get_token`,
`search_tokens`) and **component APIs** (`list_components`, `get_component`, with
HTML + React usage snippets).

The server reads **generated, authoritative artifacts**, never hand-copied data:

- `@jasondaihl/quoin-tokens` emits `dist/tokens.json` (a metadata build target alongside the
  existing CSS/JS outputs) with each token's resolved light/dark value and alias.
- `@jasondaihl/quoin-core` emits `dist/custom-elements.json`, a
  [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
  generated from the Lit sources by `@custom-elements-manifest/analyzer`.

The one hand-maintained piece is a small `react-hints` table mapping custom events
to their React callback prop names, since that rename exists only in the wrappers.

## Consequences

- The server stays in sync with the components/tokens for free: both manifests are
  regenerated on every build, and `@jasondaihl/quoin-mcp` depends on both, so it builds and
  tests last in the existing topological `pnpm -r` order.
- Authoring components keeps paying off: structured JSDoc (`@slot`, `@fires`,
  `@csspart`) now also feeds the manifest, so it's worth keeping current.
- Costs we accept: a new published package with a `bin`, an extra build step in
  `@jasondaihl/quoin-core` (the analyzer), and the small `react-hints` table to keep aligned
  with `@jasondaihl/quoin-react`.

## Alternatives considered

- **Ship nothing** — assistants keep guessing quoin's API; the whole point of a
  consistent system is undercut at the moment of use.
- **Hand-written manifest in the MCP package** — no build-tool dependency, but it
  drifts from the components the first time anything changes; rejected on principle
  (the repo already generates its token types rather than hand-maintaining them).
- **HTTP/remote transport** — needed only to share the server over a network;
  unnecessary hosting and auth overhead for a personal, local tool. stdio first;
  revisit with a new ADR if remote access is ever wanted.
