import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Smoke tests for the built token artifacts. Run `pnpm build` first.
import { test } from 'node:test';
import { tokens } from '../dist/index.js';

const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');

test('css exposes primitive and semantic custom properties', () => {
  assert.match(css, /--quoin-palette-neutral-900:\s*#18181b/);
  assert.match(css, /--quoin-color-accent-default:/);
  assert.match(css, /--quoin-space-5:\s*16px/);
});

test('css defines a light :root and a dark theme override', () => {
  assert.match(css, /:root\s*\{/);
  assert.match(css, /\[data-theme="dark"\]\s*\{/);
  // The dark block should re-declare semantic roles but not primitives.
  const darkBlock = css.slice(css.indexOf('[data-theme="dark"]'));
  assert.match(darkBlock, /--quoin-color-bg-default:/);
  assert.doesNotMatch(darkBlock, /--quoin-palette-/);
});

test('ts module exposes var() references by token path', () => {
  assert.equal(tokens.color.accent.default, 'var(--quoin-color-accent-default)');
  assert.equal(tokens.radius.md, 'var(--quoin-radius-md)');
  assert.equal(tokens.palette.neutral['900'], 'var(--quoin-palette-neutral-900)');
});

test('tokens.json metadata resolves values, references, and dark overrides', () => {
  const meta = JSON.parse(readFileSync(new URL('../dist/tokens.json', import.meta.url), 'utf8'));
  const byPath = new Map(meta.map((t) => [t.path, t]));

  const accent = byPath.get('color.accent.default');
  assert.equal(accent.tier, 'semantic');
  assert.equal(accent.cssVar, '--quoin-color-accent-default');
  assert.equal(accent.value, '#4f46e5'); // light
  assert.equal(accent.valueDark, '#6366f1'); // dark override
  assert.equal(accent.reference, '{palette.indigo.600}');

  const space = byPath.get('space.5');
  assert.equal(space.tier, 'primitive');
  assert.equal(space.value, '16px');
  assert.equal(space.reference, null);
  assert.equal(space.valueDark, undefined); // primitives aren't themed
});
