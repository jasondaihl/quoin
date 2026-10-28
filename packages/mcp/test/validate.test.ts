import { describe, expect, it } from 'vitest';
import { checkComponent, checkToken } from '../src/validate.js';

// Asserts against the real built @jasondaihl/quoin-tokens + @jasondaihl/quoin-core manifests
// (built before mcp in the topological `pnpm build`/`pnpm test`).

describe('checkToken', () => {
  it('confirms a valid token and returns it', () => {
    const result = checkToken('color.accent.default');
    expect(result.valid).toBe(true);
    expect(result.token?.cssVar).toBe('--quoin-color-accent-default');
  });

  it('rejects a typo and suggests siblings under the same parent', () => {
    const result = checkToken('color.accent.bogus');
    expect(result.valid).toBe(false);
    expect(result.suggestions).toContain('color.accent.default');
  });
});

describe('checkComponent', () => {
  it('confirms a component and lists its props', () => {
    const result = checkComponent('Button');
    expect(result.valid).toBe(true);
    if (result.kind === 'component') expect(result.props).toContain('variant');
  });

  it('confirms a real prop on a component', () => {
    const result = checkComponent('button', 'variant');
    expect(result.valid).toBe(true);
    expect(result.kind).toBe('prop');
  });

  it('rejects an unknown prop and suggests the real ones', () => {
    const result = checkComponent('button', 'color');
    expect(result.valid).toBe(false);
    if (result.kind === 'prop') expect(result.suggestions).toContain('variant');
  });

  it('rejects an unknown component and suggests available tags', () => {
    const result = checkComponent('accordion');
    expect(result.valid).toBe(false);
    if (result.kind === 'component') expect(result.suggestions).toContain('quoin-button');
  });
});
