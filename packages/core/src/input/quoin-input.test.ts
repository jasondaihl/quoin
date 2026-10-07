import { afterEach, expect, test, vi } from 'vitest';
import '../index.js';
import { expectNoA11yViolations } from '../test-utils.js';
import type { QuoinInput } from './quoin-input.js';

async function mount(markup: string): Promise<HTMLElement> {
  const host = document.createElement('div');
  host.innerHTML = markup;
  document.body.append(host);
  const first = host.firstElementChild as HTMLElement;
  // Wait for any quoin-input inside to finish its first render.
  const input = host.querySelector('quoin-input') as QuoinInput | null;
  if (input) await input.updateComplete;
  return first;
}

afterEach(() => {
  document.body.replaceChildren();
});

test('fires quoin-input with the new value on keystroke', async () => {
  const el = (await mount('<quoin-input label="Name"></quoin-input>')) as QuoinInput;
  const handler = vi.fn();
  el.addEventListener('quoin-input', handler as EventListener);
  const native = el.shadowRoot?.querySelector('input') as HTMLInputElement;
  native.value = 'Ada';
  native.dispatchEvent(new Event('input', { bubbles: true }));
  expect(el.value).toBe('Ada');
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler.mock.calls[0][0].detail.value).toBe('Ada');
});

test('participates in a native form via ElementInternals', async () => {
  const form = (await mount(
    '<form><quoin-input name="email" value="a@b.com"></quoin-input></form>',
  )) as HTMLFormElement;
  const data = new FormData(form);
  expect(data.get('email')).toBe('a@b.com');
});

test('reports validity for required fields', async () => {
  const form = (await mount(
    '<form><quoin-input name="email" required></quoin-input></form>',
  )) as HTMLFormElement;
  expect(form.checkValidity()).toBe(false);

  const el = form.querySelector('quoin-input') as QuoinInput;
  el.value = 'filled';
  await el.updateComplete;
  expect(form.checkValidity()).toBe(true);
});

test('shows error text when invalid', async () => {
  const el = (await mount(
    '<quoin-input label="Email" invalid error-text="Required"></quoin-input>',
  )) as QuoinInput;
  const helper = el.shadowRoot?.querySelector('.helper');
  expect(helper?.classList.contains('error')).toBe(true);
  expect(helper?.textContent?.trim()).toBe('Required');
});

test('has no axe violations across representative states', async () => {
  for (const markup of [
    '<quoin-input label="Name"></quoin-input>',
    '<quoin-input label="Email" required helper-text="We never share it"></quoin-input>',
    '<quoin-input label="Email" invalid error-text="Enter a valid email"></quoin-input>',
  ]) {
    const el = await mount(markup);
    await expectNoA11yViolations(el);
  }
});
