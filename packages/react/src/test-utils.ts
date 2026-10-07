import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Run axe-core against `node` (including the web components' shadow DOM) and assert no
 * violations. Color-contrast is disabled here on purpose — it's enforced authoritatively,
 * across every brand×mode theme, by the tokens package's `contrast.test.js`, and these
 * tests don't load `tokens.css` (so CSS variables are unresolved). The page-structure
 * `region` rule is dropped too, since components mount outside any landmark.
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
