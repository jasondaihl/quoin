---
name: add-brand
description: Add a new brand/theme overlay to quoin — a new accent identity across light and dark. Use when asked to add a brand or theme (e.g. a sunset or scout brand).
---

# Adding a quoin brand (theme overlay)

quoin themes along two independent axes: **mode** (light/dark) and **brand** (the accent
identity). The `default` brand is the base; every other brand is a thin **overlay** that
re-points only the semantic roles it changes. Components never change — they read semantic
CSS variables, and a brand just redefines what a few of those resolve to. `ocean` is the
reference example. Replace `<brand>` (e.g. `sunset`) below.

1. **Branch** off `main` (it's protected). See [CONTRIBUTING.md](../../../CONTRIBUTING.md).

2. **Add a palette ramp (if needed)** — `packages/tokens/tokens/primitive/palette.json`,
   following the existing `50…900` shape. Primitives stay in `:root` and are shared across
   brands — you're adding raw values, not theming yet.

3. **Author the overlay (light + dark)** —
   `packages/tokens/tokens/semantic/brands/<brand>/light.json` and `dark.json`:
   - Declare **only** the roles that change — typically `color.accent.*` and
     `color.focus.ring` — aliasing into your ramp (`{palette.<ramp>.600}` etc.).
   - Mirror the light→dark step pattern the base and `ocean` use (lighter steps in dark).
   - Anything you omit falls through to the base light/dark value — that's why an overlay
     only declares what differs.

4. **Contrast gotcha.** Contrast is enforced across every brand×mode theme. A **light
   accent** (like Ocean's cyan) fails white-text AA — override `color.text.on-accent` to a
   **dark** value (Ocean uses `{palette.neutral.950}` in both modes) rather than darkening
   the accent itself.

5. **Verify:** `pnpm --filter @jasondaihl/quoin-tokens test` shows exactly which
   brand×mode pairs pass WCAG AA (see [ADR-0009](../../../docs/adr/0009-accessibility-wcag-aa.md)),
   then `pnpm build && pnpm test`.

6. **Open a PR.** The `verify` check must pass; merge with squash or rebase (linear history).

Full detail, the cascade table, and rationale:
[docs/adding-a-theme.md](../../../docs/adding-a-theme.md) and
[ADR-0008](../../../docs/adr/0008-multi-brand-theming.md) (`ocean` is the reference example).
