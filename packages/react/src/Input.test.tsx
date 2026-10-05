import type { QuoinInput } from '@quoin/core';
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { Input } from './Input.js';

let container: HTMLElement;
let root: Root;

function render(ui: React.ReactNode) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(ui));
  return container.querySelector('quoin-input') as QuoinInput;
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

test('passes value and label through to the element', async () => {
  const el = render(<Input label="Email" value="a@b.com" />);
  await el.updateComplete;
  expect(el.value).toBe('a@b.com');
  expect(el.label).toBe('Email');
});

test('bridges quoin-input to onValueInput', async () => {
  const onValueInput = vi.fn();
  const el = render(<Input label="Name" onValueInput={onValueInput} />);
  await el.updateComplete;
  const native = el.shadowRoot?.querySelector('input') as HTMLInputElement;
  native.value = 'Ada';
  native.dispatchEvent(new Event('input', { bubbles: true }));
  expect(onValueInput).toHaveBeenCalledWith('Ada');
});
