# Recipe: adding a theme (brand)

quoin themes along two independent axes: **mode** (light/dark) and **brand** (the accent
identity). The `default` brand is the base; every other brand is a thin **overlay** that
re-points only the semantic roles it changes. Components never change — they read semantic
CSS variables, and a brand just redefines what a few of those resolve to. See
[ADR-0008](adr/0008-multi-brand-theming.md) for the why.

`ocean` is the reference example. Say you're adding a brand called `sunset`.

## How brands resolve (the cascade)

The base brand's light values sit on `:root`; its dark values override under
`[data-theme="dark"]`. An overlay brand adds two more layers:

| Attributes on `<html>` | accent resolves from |
|---|---|
| (none) | `:root` — base light |
| `data-theme="dark"` | `[data-theme="dark"]` — base dark |
| `data-brand="sunset"` | `[data-brand="sunset"]` — sunset light |
| `data-brand="sunset"` + `data-theme="dark"` | `[data-brand="sunset"][data-theme="dark"]` — sunset dark (highest specificity) |

Any role the brand *doesn't* override falls through to the base light/dark value. That's
why an overlay only needs to declare what actually differs.

![The button gallery across the Default and Ocean brands in light and dark. The accent
(primary) color tracks the brand while backgrounds track the mode; danger stays red in
every cell because it isn't part of the overlay.](assets/brand-theme-matrix.png)

## 1. Add a palette ramp (`@jasondaihl/quoin-tokens`)

A brand usually needs a new primitive color ramp for its accent. Add it to
`packages/tokens/tokens/primitive/palette.json`, following the existing `50…900` shape:

```json
"orange": {
  "50": { "$value": "#fff7ed" },
  "500": { "$value": "#f97316" },
  "600": { "$value": "#ea580c" },
  "700": { "$value": "#c2410c" },
  "800": { "$value": "#9a3412" },
  "900": { "$value": "#7c2d12" }
}
```

Primitives stay in `:root` and are shared across brands — you're adding raw values, not
theming yet.

## 2. Author the overlay (light + dark)

Create `packages/tokens/tokens/semantic/brands/sunset/light.json` and `dark.json`. Declare
**only** the roles that change — typically `color.accent.*` and `color.focus.ring` —
aliasing into your new ramp. Mirror the light→dark step pattern the base and `ocean` use
(lighter steps in dark):

```json
// brands/sunset/light.json
{
  "color": {
    "$type": "color",
    "accent": {
      "default": { "$value": "{palette.orange.600}" },
      "hover":   { "$value": "{palette.orange.700}" },
      "active":  { "$value": "{palette.orange.800}" },
      "subtle":  { "$value": "{palette.orange.50}" }
    },
    "focus": { "ring": { "$value": "{palette.orange.500}" } }
  }
}
```

If the brand needs to diverge further (its own backgrounds, text, borders), add those roles
too — anything you omit inherits from the base.

**Contrast is enforced.** `packages/tokens/test/contrast.test.js` checks WCAG AA across every
brand×mode theme, so a new brand must pass (see [ADR-0009](adr/0009-accessibility-wcag-aa.md)).
A common gotcha: a **light accent** (like Ocean's cyan) fails white-text AA, so the brand
should override `color.text.on-accent` to a **dark** value rather than darkening the accent —
Ocean sets it to `{palette.neutral.950}` in both modes and keeps its vibrant cyan. Run
`pnpm --filter @jasondaihl/quoin-tokens test` to see exactly which pairs pass.

## 3. Register the brand in the build

Add the name to the `BRANDS` list in `packages/tokens/sd.build.js`:

```js
const BRANDS = ['default', 'ocean', 'sunset'];
```

That's all the build needs — it emits a `[data-brand="sunset"]` layer (light) and a
`[data-brand="sunset"][data-theme="dark"]` layer (dark), semantic-only, in cascade order.

## 4. Add it to the Storybook switcher

Add a toolbar item in **both** previews (they're maintained in parallel):
`packages/core/.storybook/preview.ts` and `packages/react/.storybook/preview.tsx`.

```ts
brand: {
  // …
  toolbar: {
    items: [
      { value: 'default', title: 'Default', icon: 'circle' },
      { value: 'ocean', title: 'Ocean', icon: 'circle' },
      { value: 'sunset', title: 'Sunset', icon: 'circle' },
    ],
  },
},
```

The decorator already maps the selected brand to `data-brand` on the root (clearing it for
`default`), so no other wiring is needed.

## 5. Build & verify

```sh
pnpm build        # tokens first — regenerates dist/tokens.css with the new layers
pnpm test         # the tokens smoke test checks the overlay blocks
pnpm lint         # biome
pnpm --filter @jasondaihl/quoin-core storybook   # flip Brand × Theme and watch accent change
```

Confirm `packages/tokens/dist/tokens.css` ends with `[data-brand="sunset"]` and
`[data-brand="sunset"][data-theme="dark"]` blocks containing *only* the roles you declared
(no primitives, no untouched roles). Optionally add an assertion to
`packages/tokens/test/tokens.test.js` mirroring the `ocean` one.

That's the whole loop. The only per-brand thinking is steps 1–2; the rest is mechanical.
