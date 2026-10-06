# Contributing to quoin

How work gets done in this repo. It's a personal project, but these conventions
keep `main` healthy and keep future-me from having to re-derive decisions.

## Prerequisites & setup

- **Node** ≥ 20 and **pnpm** (the repo pins a version via `packageManager`).
- Install dependencies:
  ```sh
  pnpm install
  ```
- The browser tests need Chromium (one-time):
  ```sh
  pnpm --filter @jasondaihl/core exec playwright install chromium
  ```

## Everyday commands

Run from the repo root (they fan out across packages in dependency order):

```sh
pnpm build        # tokens → core → react
pnpm test         # all tests (core/react run in real Chromium)
pnpm lint         # biome check
pnpm format       # biome format --write

pnpm --filter @jasondaihl/core storybook     # web-component docs  (:6006)
pnpm --filter @jasondaihl/react storybook    # React docs          (:6007)
```

## Branch & PR workflow

`main` is protected by a ruleset — you can't push to it directly. Every change
goes through a pull request:

1. Branch off `main` (e.g. `feat/…`, `docs/…`, `chore/…`).
2. Make the change; keep `pnpm build`, `pnpm test`, and `pnpm lint` green.
3. Open a PR. The **`verify`** check (build + test + lint) must pass.
4. Merge with **squash** or **rebase** — `main` requires **linear history**, so
   merge commits are disabled.

Other enforced rules: **signed commits**, **conversation resolution**, no
force-pushes, no branch deletion. Approvals are set to 0 so you can merge solo.

### Signed commits

Commits must be signed (SSH signing is configured globally). A correctly set-up
commit shows a green **Verified** badge on GitHub. To set this up on a new machine,
see the git docs on [SSH commit signing](https://docs.github.com/authentication/managing-commit-signature-verification/about-commit-signature-verification),
and add the public key to your GitHub account as a **Signing key**.

## Adding a component

Follow the step-by-step in [docs/adding-a-component.md](docs/adding-a-component.md):
author the web component in `@jasondaihl/core`, test it, add a story, export it, then
wrap it for React in `@jasondaihl/react`.

## Recording a decision (ADRs)

When you make a significant, hard-to-reverse choice, record it as an Architecture
Decision Record. The process and conventions live in
[docs/adr/README.md](docs/adr/README.md) — in short: copy the template to the next
number, fill it in, add it to the index, and open a PR. Reverse a past decision by
writing a *new* ADR that supersedes the old one (never edit the old one).

## Releases

Versioning is managed with [Changesets](https://github.com/changesets/changesets):

```sh
pnpm changeset          # record intended version bumps in a PR
pnpm version-packages   # apply bumps + update changelogs
pnpm release            # build + publish
```
