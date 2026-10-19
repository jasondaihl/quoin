import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import Color from 'colorjs.io';
// WCAG AA contrast is a tested contract across every brand×mode theme. We read the built
// stylesheet (literal oklch, no aliases) and recompose each theme by the same CSS cascade the
// browser applies, then check role pairs. Run `pnpm build` first. See docs/adr/0009.

const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');

/** Parse every `selector { --quoin-x: #hex; ... }` block into a map keyed by selector. */
function parseBlocks(source) {
  const blocks = {};
  // Strip /* comments */ so the banner doesn't get captured into the first selector.
  const cleaned = source.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, rawSelector, body] of cleaned.matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const vars = {};
    for (const decl of body.split(';')) {
      const [prop, value] = decl.split(':');
      if (prop?.trim().startsWith('--')) vars[prop.trim()] = value.trim();
    }
    blocks[rawSelector.trim()] = vars;
  }
  return blocks;
}

const blocks = parseBlocks(css);

// Compose each theme by layering selector blocks in cascade order (later wins).
const layer = (...selectors) => Object.assign({}, ...selectors.map((s) => blocks[s] ?? {}));

// Discover brands from the stylesheet so every brand is checked without edits here.
const brands = [
  ...new Set(
    Object.keys(blocks)
      .map((sel) => sel.match(/\[data-brand="([^"]+)"\]/)?.[1])
      .filter(Boolean),
  ),
];
const themes = {
  'default/light': layer(':root'),
  'default/dark': layer(':root', '[data-theme="dark"]'),
};
for (const brand of brands) {
  themes[`${brand}/light`] = layer(':root', `[data-brand="${brand}"]`);
  themes[`${brand}/dark`] = layer(
    ':root',
    '[data-theme="dark"]',
    `[data-brand="${brand}"]`,
    `[data-brand="${brand}"][data-theme="dark"]`,
  );
}

// --- WCAG 2.1 contrast ---------------------------------------------------------------------
// Values are authored/emitted as oklch; WCAG 2.x contrast is defined on sRGB relative
// luminance, so we let colorjs.io parse the color and compute the WCAG21 ratio (it converts
// through sRGB internally). Same engine Style Dictionary uses to emit the oklch.
const contrast = (a, b) => new Color(a).contrast(b, 'WCAG21');
const v = (theme, role) => themes[theme][`--quoin-color-${role}`];

// label, foreground role, background role, required ratio
const GATED = [
  ['text on bg', 'text-default', 'bg-default', 4.5],
  ['text on bg-subtle', 'text-default', 'bg-subtle', 4.5],
  ['text on surface-raised', 'text-default', 'surface-raised', 4.5],
  ['muted text on bg', 'text-muted', 'bg-default', 4.5],
  ['muted text on surface', 'text-muted', 'surface-default', 4.5],
  ['on-accent text on accent', 'text-on-accent', 'accent-default', 4.5],
  ['on-danger text on danger', 'text-on-danger', 'danger-default', 4.5],
  ['focus ring on bg (UI)', 'focus-ring', 'bg-default', 3.0],
  ['strong border on surface (UI)', 'border-strong', 'surface-default', 3.0],
  ['accent fill on bg (UI)', 'accent-default', 'bg-default', 3.0],
];

// Non-gating: transient states + decorative borders. Printed for visibility, never asserted.
const ADVISORY = [
  ['on-accent text on accent-hover', 'text-on-accent', 'accent-hover', 4.5],
  ['on-accent text on accent-active', 'text-on-accent', 'accent-active', 4.5],
  ['on-danger text on danger-hover', 'text-on-danger', 'danger-hover', 4.5],
  ['decorative border on surface', 'border-default', 'surface-default', 3.0],
];

for (const theme of Object.keys(themes)) {
  test(`${theme} meets WCAG AA for gated role pairs`, () => {
    for (const [label, fg, bg, min] of GATED) {
      const ratio = contrast(v(theme, fg), v(theme, bg));
      assert.ok(
        ratio >= min,
        `${theme}: ${label} — ${ratio.toFixed(2)}:1 (need ${min}:1) [${v(theme, fg)} on ${v(theme, bg)}]`,
      );
    }
  });
}

// Surface advisory results without failing the suite — a nudge, not a gate.
test('advisory contrast (reported, not gated)', () => {
  for (const theme of Object.keys(themes)) {
    for (const [label, fg, bg, min] of ADVISORY) {
      const ratio = contrast(v(theme, fg), v(theme, bg));
      if (ratio < min) {
        console.log(`  advisory: ${theme} — ${label} ${ratio.toFixed(2)}:1 (<${min}:1)`);
      }
    }
  }
});
