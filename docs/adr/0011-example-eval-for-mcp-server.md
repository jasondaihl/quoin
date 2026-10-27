# ADR-0011: Example eval for the MCP server

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

[ADR-0007](0007-mcp-server.md) added `@jasondaihl/quoin-mcp` so an AI assistant gets
quoin's tokens and component APIs as structured tools. `packages/mcp/test` already
unit-tests those tools against the generated manifests — but a unit test asserts an
exact value and passes or fails. It can't answer the question that actually matters
for an assistant-facing product: *given a realistic task, does the server let a model
reach the right answer?* That is graded, tolerant, and worth tracking as a score over
time — the job of an eval, not a test. We had no example of one, and wanted a small,
readable reference to learn the shape from and grow.

## Decision

Add a top-level **`evals/`** workspace package (`@jasondaihl/quoin-eval`, private, not
published) holding one worked eval of the MCP server. It keeps the four parts of an
eval in separate files — system under test, dataset, graders, runner — and drives the
**real built server over stdio** via the official MCP client, so it grades the server
an assistant actually talks to.

It runs in two modes behind the same dataset/graders/runner: an **offline heuristic
agent** (default — deterministic, free, no API key, CI-friendly) and a **real Claude
model** with the server's tools attached (`EVAL_AGENT=model`, default
`claude-haiku-5-5` to keep a run cheap, `EVAL_MODEL` to override). The runner scores
each case with partial credit and exits non-zero below `EVAL_MIN_SCORE`.

## Consequences

- A reference to copy when evaluating any future assistant-facing surface, and a
  dataset to grow: each bad answer becomes a case, and the score tracks quoin's
  usefulness to an assistant over time.
- `evals/` sits outside the `packages/*` globs, so it stays out of `build`/`test`/
  release; it is run on demand with `pnpm eval`, not wired into `verify`.
- Costs we accept: a second runtime (`tsx`) and an `@anthropic-ai/sdk` dependency in
  a dev-only package, and a dataset whose expectations must be kept current with the
  tokens and component APIs it asserts on.

## Alternatives considered

- **Lean on the existing unit tests** — they guard the tool functions but are binary
  and don't measure task success or a model's tool choice; they answer a different
  question.
- **LLM-only eval** — most faithful, but needs an API key and spends tokens on every
  run, so it can't gate CI and is a poor first thing to read. Kept as the opt-in mode
  instead of the default.
- **Hosted MCP connector** instead of a manual tool-use loop — only takes URL
  servers; quoin's MCP server is stdio ([ADR-0007](0007-mcp-server.md)), so the loop
  runs against the stdio client directly.
