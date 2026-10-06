import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// A single entry from @jasondaihl/quoin-tokens' generated dist/tokens.json metadata.
export interface TokenMeta {
  /** Dotted token path, e.g. "color.accent.default". */
  path: string;
  /** The CSS custom property, e.g. "--quoin-color-accent-default". */
  cssVar: string;
  /** DTCG `$type` (color, dimension, number, fontFamily, …), or null. */
  type: string | null;
  /** "semantic" for themeable color roles, "primitive" for the raw scale. */
  tier: 'semantic' | 'primitive';
  /** Resolved light-theme value. */
  value: string | number;
  /** Resolved dark-theme value (present only for themed semantic roles). */
  valueDark?: string | number;
  /** The authored alias, e.g. "{palette.indigo.600}", or null for a literal. */
  reference: string | null;
}

// Read the authoritative metadata the tokens package emits at build time. We
// resolve the real file on disk (rather than bundling it in) so the server always
// reflects the currently built tokens.
const require = createRequire(import.meta.url);

let cache: TokenMeta[] | undefined;

function allTokens(): TokenMeta[] {
  if (!cache) {
    const file = require.resolve('@jasondaihl/quoin-tokens/tokens.json');
    cache = JSON.parse(readFileSync(file, 'utf8')) as TokenMeta[];
  }
  return cache;
}

/** The top-level group of a token path, e.g. "color" or "space". */
function groupOf(token: TokenMeta): string {
  return token.path.split('.')[0] ?? '';
}

export interface ListTokensOptions {
  tier?: 'semantic' | 'primitive';
  group?: string;
}

/** List tokens, optionally filtered by tier and/or top-level group. */
export function listTokens(options: ListTokensOptions = {}): TokenMeta[] {
  return allTokens().filter((t) => {
    if (options.tier && t.tier !== options.tier) return false;
    if (options.group && groupOf(t) !== options.group) return false;
    return true;
  });
}

/** The distinct top-level groups present in the token set. */
export function tokenGroups(): string[] {
  return [...new Set(allTokens().map(groupOf))].sort();
}

/** Resolve one token by its exact dotted path. */
export function getToken(path: string): TokenMeta | undefined {
  return allTokens().find((t) => t.path === path);
}

/**
 * Fuzzy search by path, CSS var, or value — case-insensitive substring match.
 * Useful for "which token is #4f46e5" or "find the accent colors".
 */
export function searchTokens(query: string): TokenMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allTokens().filter((t) => {
    const haystack = [
      t.path,
      t.cssVar,
      String(t.value),
      String(t.valueDark ?? ''),
      t.reference ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
