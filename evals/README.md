# quoin eval — a worked example

A small, self-contained **eval** for the quoin MCP server. It exists to be read
and learned from: the whole thing is a handful of short files and runs offline in
a couple of seconds with no API key — then the same suite points at a real Claude
model with one environment variable.

> **Eval, not test.** A unit test asserts an exact value and is binary — pass or
> fail. An eval runs a system over a set of realistic _tasks_, grades each answer
> with _tolerant_ checks, and reports a _score_. That difference is what lets you
> measure a system — like an AI assistant — whose answers are good-but-not-identical
> each time. (`packages/mcp/test` already unit-tests the tools; this grades them as
> a set of tasks instead.)

## Run it

```bash
pnpm eval            # from the repo root — builds the MCP server, then grades it
```

Or, if the packages are already built:

```bash
pnpm --filter @jasondaihl/quoin-eval eval
```

You'll get a per-case report, an overall score, and a `results.json` (gitignored)
you can diff between runs. The process exits non-zero if the score drops below the
bar, so it can gate CI like a test suite would — set the bar with
`EVAL_MIN_SCORE` (0–1, default `0.8`):

```bash
EVAL_MIN_SCORE=0.95 pnpm --filter @jasondaihl/quoin-eval eval
```

## The four parts of an eval

Every eval, however fancy, is these four pieces. Each lives in its own file here:

| Part | File | What it is |
| --- | --- | --- |
| **System under test** | [`src/agent.ts`](src/agent.ts) (+ [`src/model-agent.ts`](src/model-agent.ts)) | The thing that turns a task into an answer. |
| **Dataset** | [`src/dataset.ts`](src/dataset.ts) | The tasks, each paired with the graders that judge it. |
| **Graders** | [`src/graders.ts`](src/graders.ts) | Small functions that score one answer, with partial credit. |
| **Runner** | [`src/run.ts`](src/run.ts) | Runs every task, grades it, totals the score, sets the exit code. |

[`src/client.ts`](src/client.ts) is plumbing, not a concept: it launches the real
built server over stdio using the official MCP client, so the eval grades the
_actual_ server an assistant would talk to — not a re-implementation of it.

### Why the score isn't 100%

The `radius-scale` case scores partially on purpose. The dataset says "enumerating
a token group should use `list_tokens`", but the stand-in agent — a crude keyword
planner — reaches for `search_tokens` instead. It still surfaces the right tokens,
so it earns the content points and loses the tool-choice point.

That partial score is the entire point of an eval: **a suite that always scores
100% is measuring nothing.** The number only becomes useful once it can go down —
when a token is renamed, a component API changes, or (with a real model) a prompt
tweak quietly makes tool choice worse.

## Point it at a real model

The default agent ([`src/agent.ts`](src/agent.ts)) is a deterministic stand-in for
the real target: a Claude model given the quoin MCP server, choosing tools on its
own. That real target is built and wired in too — [`src/model-agent.ts`](src/model-agent.ts)
hands Claude the server's tools and runs the tool-use loop. Because it returns the
same `AgentOutput` shape, **the dataset, graders and runner don't change** — only
the thing being graded does.

Run the exact same suite against the model:

```bash
export ANTHROPIC_API_KEY=sk-ant-...          # or `ant auth login`
EVAL_AGENT=model pnpm eval                    # grade a real Claude model
EVAL_AGENT=model EVAL_MODEL=claude-opus-5-5 pnpm eval    # measure the ceiling
```

It defaults to `claude-haiku-5-5` (the cheapest current model, to keep a run
inexpensive); set `EVAL_MODEL` to run a more capable or different one. The report
header and `results.json` record which agent ran.

Two things change in character once a real model is behind it, and the graders are
already built for both:

- **Answers vary run to run**, so you lean on the tolerant graders (`answerContains`,
  `oklchCloseTo`) rather than exact-string assertions — and you may run each case a
  few times and average. Expect a different score than the heuristic's: the model
  answers in prose, so (for instance) it might say "Button, Input…" where a content
  grader looks for the exact tag `quoin-button`. Those gaps are real signal — tighten
  the prompt in `model-agent.ts`, or loosen the grader, deliberately.
- **It costs tokens and time**, so a model eval usually runs on a schedule or before
  a release, while the offline heuristic runs on every push.

## Grow it

The dataset is meant to grow. Each time you hit a question the server answers badly
— a confusing token name, a missing component prop, a bad tool choice — add a case
for it. The eval then keeps measuring that forever, and the score tells you,
in one number, whether quoin is getting better or worse at serving an AI assistant.
