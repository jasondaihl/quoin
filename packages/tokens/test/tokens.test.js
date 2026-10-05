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
