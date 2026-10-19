---
name: write-adr
description: Record an Architecture Decision Record (ADR) for quoin. Use when asked to write/add an ADR, or when a significant, hard-to-reverse decision needs documenting (or an old decision reversed).
---

# Writing a quoin ADR

ADRs capture the significant, hard-to-reverse decisions behind quoin and *why* they were
made. They live in [docs/adr/](../../../docs/adr/) and are **immutable** — never rewrite a
decision; supersede it. Record decisions with real tradeoffs; skip obvious or trivially
reversible ones.

1. **Branch** off `main` (it's protected). See [CONTRIBUTING.md](../../../CONTRIBUTING.md).

2. **Find the next number.** Look at `docs/adr/` and take the next in sequence
   (`NNNN`, zero-padded). The index table in
   [docs/adr/README.md](../../../docs/adr/README.md) lists the current ones.

3. **Copy the template.** `docs/adr/template.md` → `docs/adr/NNNN-short-title.md`.

4. **Fill it in**, keeping to ~15–20 lines:
   - **Status:** `Accepted` (or `Proposed`), **Date:** today.
   - **Context** → **Decision** → **Consequences** → **Alternatives considered**.

5. **Add a row** to the Index table in `docs/adr/README.md` (link + title + status).

6. **Open a PR.** The `verify` check must pass; merge with squash or rebase (linear history).

**Reversing a past decision:** don't edit the old ADR. Write a *new* one, and set the old
one's Status to `Superseded by ADR-XXXX` (and link the two).

Conventions and the full process: [docs/adr/README.md](../../../docs/adr/README.md).
