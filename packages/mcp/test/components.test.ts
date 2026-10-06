import { describe, expect, it } from 'vitest';
import { getComponent, listComponents } from '../src/components.js';

// Assert against the real @jasondaihl/quoin-core Custom Elements Manifest (built before mcp).

describe('listComponents', () => {
  it('lists every component with tag + React name', () => {
    const tags = listComponents().map((c) => c.tag);
    expect(tags).toEqual(
      expect.arrayContaining(['quoin-button', 'quoin-input', 'quoin-stack', 'quoin-icon']),
    );
    const button = listComponents().find((c) => c.tag === 'quoin-button');
    expect(button?.reactName).toBe('Button');
  });
});

describe('getComponent', () => {
  it('resolves by tag, React name, and bare name', () => {
    expect(getComponent('quoin-button')?.tag).toBe('quoin-button');
    expect(getComponent('Button')?.tag).toBe('quoin-button');
    expect(getComponent('button')?.tag).toBe('quoin-button');
  });

  it('returns the public props with types, defaults, and attributes', () => {
    const button = getComponent('Button');
    const variant = button?.props.find((p) => p.name === 'variant');
    expect(variant).toMatchObject({
      attribute: 'variant',
      type: 'QuoinButtonVariant',
      default: "'primary'",
      reflects: true,
    });
    // Internal/static members must not leak in.
    expect(button?.props.some((p) => p.name === 'baseStyles')).toBe(false);
    expect(button?.props.some((p) => p.name === 'handleClick')).toBe(false);
  });

  it('exposes slots, events (with React prop mapping), and CSS parts', () => {
    const button = getComponent('Button');
    expect(button?.slots.map((s) => s.name)).toEqual(expect.arrayContaining(['', 'start', 'end']));

    const click = button?.events.find((e) => e.name === 'quoin-click');
    expect(click?.reactProp).toBe('onClick');

    expect(button?.cssParts.map((p) => p.name)).toEqual(
      expect.arrayContaining(['button', 'spinner']),
    );
  });

  it('maps input custom events to their React callback props', () => {
    const input = getComponent('Input');
    const names = Object.fromEntries((input?.events ?? []).map((e) => [e.name, e.reactProp]));
    expect(names['quoin-input']).toBe('onValueInput');
    expect(names['quoin-change']).toBe('onValueChange');
  });

  it('generates HTML and React usage snippets', () => {
    const button = getComponent('Button');
    expect(button?.usage.html).toContain('<quoin-button');
    expect(button?.usage.html).toContain('variant="primary"');
    expect(button?.usage.html).toContain('>content</quoin-button>');

    expect(button?.usage.react).toContain('<Button');
    expect(button?.usage.react).toContain('variant="primary"');
    expect(button?.usage.react).toContain('onClick=');
  });

  it('returns undefined for an unknown component', () => {
    expect(getComponent('nope')).toBeUndefined();
  });
});
