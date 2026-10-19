---
name: record-changeset
description: Record a Changesets entry for quoin so a change gets a version bump and changelog on release. Use when asked to add a changeset, bump a version, or prepare a package change for publishing.
---

# Recording a changeset

quoin versions its packages with [Changesets](https://github.com/changesets/changesets). A
changeset is a small markdown file (in `.changeset/`) describing which packages bump and
why — it rides along in the PR that makes the change. Any PR that changes a published
package's behavior should include one.

The published packages: `@jasondaihl/quoin-tokens`, `@jasondaihl/quoin-core`,
`@jasondaihl/quoin-mcp`, `@jasondaihl/quoin-react`.

1. On your change branch, run `pnpm changeset`.
2. **Select the packages** that changed (space to toggle).
3. **Pick the bump** for each (semver): `patch` (fix), `minor` (additive feature),
   `major` (breaking). Internal dependents bump `patch` automatically
   (`updateInternalDependencies` in `.changeset/config.json`).
4. **Write the summary** — one or two lines in the user's voice; it becomes the changelog
   entry, so describe the change, not the file edits.
5. Commit the generated `.changeset/<name>.md` with your change and open/update the PR.

**What happens next (automated — don't do it by hand):** as changesets land on `main`,
`.github/workflows/release.yml` opens a **"Version Packages" PR** that applies the bumps and
updates changelogs. Merging *that* PR publishes to **GitHub Packages**. Do **not** run
`pnpm version-packages` or `pnpm release` locally unless deliberately bypassing the workflow.

Full release flow: [CONTRIBUTING.md](../../../CONTRIBUTING.md) (Releases section).
