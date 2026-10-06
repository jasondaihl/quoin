import type { QuoinButton } from '@jasondaihl/quoin-core';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { Button } from './Button.js';

let container: HTMLElement;
let root: Root;

function render(ui: React.ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return container.querySelector('quoin-button') as QuoinButton;
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test('renders the underlying custom element', () => {
  const el = render(<Button>Save</Button>);
  expect(el).toBeTruthy();
  expect(el.tagName.toLowerCase()).toBe('quoin-button');
});

test('passes props through to the element', () => {
  const el = render(
    <Button variant="danger" size="lg" disabled>
      Delete
    </Button>,
  );
  expect(el.variant).toBe('danger');
  expect(el.size).toBe('lg');
  expect(el.disabled).toBe(true);
});

test('forwards ref to the underlying element', () => {
  let captured: QuoinButton | null = null;
  render(
    <Button
      ref={(node) => {
        captured = node;
      }}
    >
      Hi
    </Button>,
  );
  expect(captured).not.toBeNull();
  expect((captured as unknown as HTMLElement).tagName.toLowerCase()).toBe('quoin-button');
});

test('bridges the quoin-click custom event to onClick', async () => {
  const onClick = vi.fn();
  const el = render(<Button onClick={onClick}>Go</Button>);
  await el.updateComplete;
  el.shadowRoot?.querySelector('button')?.click();
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(onClick.mock.calls[0][0].type).toBe('quoin-click');
});
