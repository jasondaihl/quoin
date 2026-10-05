import { afterEach, expect, test, vi } from 'vitest';
import '../index.js';
import type { QuoinButton } from './quoin-button.js';

async function mount(markup: string): Promise<QuoinButton> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const el = host.querySelector('quoin-button') as QuoinButton;
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.body.replaceChildren();
});

test('registers the custom element', () => {
  expect(customElements.get('quoin-button')).toBeTruthy();
});

test('renders a native button in the shadow root', async () => {
  const el = await mount('<quoin-button>Save</quoin-button>');
  const inner = el.shadowRoot?.querySelector('button');
  expect(inner).toBeTruthy();
  expect(el.variant).toBe('primary');
  expect(el.size).toBe('md');
});

test('reflects variant and size to attributes for CSS targeting', async () => {
  const el = await mount('<quoin-button variant="danger" size="lg">Delete</quoin-button>');
  expect(el.getAttribute('variant')).toBe('danger');
  expect(el.getAttribute('size')).toBe('lg');
});

test('dispatches quoin-click when activated', async () => {
  const el = await mount('<quoin-button>Go</quoin-button>');
  const handler = vi.fn();
  el.addEventListener('quoin-click', handler);
  el.shadowRoot?.querySelector('button')?.click();
  expect(handler).toHaveBeenCalledTimes(1);
});

test('suppresses activation while disabled', async () => {
  const el = await mount('<quoin-button disabled>Go</quoin-button>');
  const handler = vi.fn();
  el.addEventListener('quoin-click', handler);
  el.shadowRoot?.querySelector('button')?.click();
  expect(handler).not.toHaveBeenCalled();
});

test('shows a spinner and blocks activation while loading', async () => {
  const el = await mount('<quoin-button loading>Go</quoin-button>');
  const handler = vi.fn();
  el.addEventListener('quoin-click', handler);
  expect(el.shadowRoot?.querySelector('.spinner')).toBeTruthy();
  expect(el.shadowRoot?.querySelector('button')?.disabled).toBe(true);
  el.shadowRoot?.querySelector('button')?.click();
  expect(handler).not.toHaveBeenCalled();
});
