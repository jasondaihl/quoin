import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Run axe-core against `node` (including its shadow DOM) and assert no violations.
 *
 * Color-contrast is disabled here on purpose: contrast is enforced authoritatively, across
 * every brand×mode theme, by the tokens package's `contrast.test.js`. These component tests
 * don't load `tokens.css`, so the CSS custom properties are unresolved and axe can't judge
 * real colors. The `region` rule is also dropped — it's a page-structure check that fires on
 * an isolated component mounted outside any landmark.
 */
export async function expectNoA11yViolations(node: Element): Promise<void> {
  const results = await axe.run(node, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });
  const summary = results.violations
    .map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)
    .join('\n');
  expect(results.violations, `axe violations:\n${summary}`).toEqual([]);
}
