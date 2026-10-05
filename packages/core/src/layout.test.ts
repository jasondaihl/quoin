import { afterEach, expect, test } from 'vitest';
import './index.js';
import type { QuoinIcon } from './icon/quoin-icon.js';
import type { QuoinStack } from './stack/quoin-stack.js';

async function mount<T extends HTMLElement>(markup: string): Promise<T> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const el = host.firstElementChild as T & { updateComplete?: Promise<unknown> };
  await el.updateComplete;
  return el as T;
}

afterEach(() => {
  document.body.replaceChildren();
});

test('stack resolves gap token key to a space custom property', async () => {
  const el = await mount<QuoinStack>('<quoin-stack gap="8"></quoin-stack>');
  expect(el.style.getPropertyValue('--quoin-stack-gap')).toBe('var(--quoin-space-8)');
  expect(getComputedStyle(el).flexDirection).toBe('column');
});

test('stack switches to row direction', async () => {
  const el = await mount<QuoinStack>('<quoin-stack direction="row"></quoin-stack>');
  expect(getComputedStyle(el).flexDirection).toBe('row');
});

test('icon with a label is exposed as an image to assistive tech', async () => {
  const el = await mount<QuoinIcon>('<quoin-icon label="Search"><svg></svg></quoin-icon>');
  const span = el.shadowRoot?.querySelector('span');
  expect(span?.getAttribute('role')).toBe('img');
  expect(span?.getAttribute('aria-label')).toBe('Search');
});

test('decorative icon is hidden from assistive tech', async () => {
  const el = await mount<QuoinIcon>('<quoin-icon><svg></svg></quoin-icon>');
  const span = el.shadowRoot?.querySelector('span');
  expect(span?.getAttribute('aria-hidden')).toBe('true');
  expect(span?.hasAttribute('role')).toBe(false);
});
