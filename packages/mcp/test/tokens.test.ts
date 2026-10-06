import { describe, expect, it } from 'vitest';
import { getToken, listTokens, searchTokens, tokenGroups } from '../src/tokens.js';

// These assert against the real @jasondaihl/tokens metadata (built before mcp in the
// topological `pnpm build`/`pnpm test`).

describe('getToken', () => {
  it('resolves a semantic role with light + dark values and its alias', () => {
    const accent = getToken('color.accent.default');
    expect(accent).toBeDefined();
    expect(accent?.tier).toBe('semantic');
    expect(accent?.cssVar).toBe('--quoin-color-accent-default');
    expect(accent?.value).toBe('#4f46e5');
    expect(accent?.valueDark).toBe('#6366f1');
    expect(accent?.reference).toBe('{palette.indigo.600}');
  });

  it('resolves a primitive with no dark override', () => {
    const space = getToken('space.5');
    expect(space?.tier).toBe('primitive');
    expect(space?.value).toBe('16px');
    expect(space?.valueDark).toBeUndefined();
  });

  it('returns undefined for an unknown path', () => {
    expect(getToken('color.nope.nope')).toBeUndefined();
  });
});

describe('listTokens', () => {
  it('filters by tier', () => {
    const semantic = listTokens({ tier: 'semantic' });
    expect(semantic.length).toBeGreaterThan(0);
    expect(semantic.every((t) => t.tier === 'semantic')).toBe(true);
  });

  it('filters by group', () => {
    const space = listTokens({ group: 'space' });
    expect(space.length).toBeGreaterThan(0);
    expect(space.every((t) => t.path.startsWith('space.'))).toBe(true);
  });
});

describe('tokenGroups', () => {
  it('includes the expected top-level groups', () => {
    const groups = tokenGroups();
    expect(groups).toContain('color');
    expect(groups).toContain('space');
    expect(groups).toContain('palette');
  });
});

describe('searchTokens', () => {
  it('finds a token by its resolved hex value', () => {
    const hits = searchTokens('#4f46e5');
    expect(hits.some((t) => t.path === 'palette.indigo.600')).toBe(true);
    expect(hits.some((t) => t.path === 'color.accent.default')).toBe(true);
  });

  it('returns nothing for an empty query', () => {
    expect(searchTokens('   ')).toEqual([]);
  });
});
