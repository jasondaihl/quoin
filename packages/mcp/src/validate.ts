import type { ComponentProp } from './components.js';
import { getComponent, listComponents } from './components.js';
import type { TokenMeta } from './tokens.js';
import { getToken, listTokens, searchTokens } from './tokens.js';

// --- Validation ----------------------------------------------------------------------
//
// The read tools answer "what is X"; these answer "is X real, and if not, what did
// you mean?" — so an agent can check a token path or a component prop *before* it
// emits a wrong CSS var or an unsupported attribute, then self-correct from the
// suggestions instead of guessing again. Pure functions so they're unit-testable; the
// `check_usage` tool in index.ts is a thin wrapper over them.

export interface TokenCheck {
  valid: boolean;
  kind: 'token';
  input: string;
  /** The resolved token, when valid. */
  token?: TokenMeta;
  /** Nearest real token paths, when invalid. */
  suggestions?: string[];
}

export type ComponentCheck =
  | { valid: false; kind: 'component'; input: string; suggestions: string[] }
  | { valid: true; kind: 'component'; input: string; tag: string; props: string[] }
  | { valid: true; kind: 'prop'; input: string; prop: string; tag: string; detail: ComponentProp }
  | { valid: false; kind: 'prop'; input: string; prop: string; tag: string; suggestions: string[] };

/** Real token paths near a miss: siblings under the same parent, else a fuzzy search. */
function suggestTokens(path: string): string[] {
  const parts = path.split('.');
  const parent = parts.slice(0, -1).join('.');
  let near = parent ? listTokens().filter((t) => t.path.startsWith(`${parent}.`)) : [];
  if (near.length === 0) near = searchTokens(parts[parts.length - 1] ?? path);
  return near.slice(0, 8).map((t) => t.path);
}

/** Validate a dotted token path; on a miss, suggest the nearest real paths. */
export function checkToken(path: string): TokenCheck {
  const token = getToken(path);
  if (token) return { valid: true, kind: 'token', input: path, token };
  return { valid: false, kind: 'token', input: path, suggestions: suggestTokens(path) };
}

/**
 * Validate a component — and, with `prop`, whether it accepts that prop/attribute.
 * On a miss, suggest the available components or props.
 */
export function checkComponent(name: string, prop?: string): ComponentCheck {
  const component = getComponent(name);
  if (!component) {
    return {
      valid: false,
      kind: 'component',
      input: name,
      suggestions: listComponents().map((c) => c.tag),
    };
  }
  if (prop === undefined) {
    return {
      valid: true,
      kind: 'component',
      input: name,
      tag: component.tag,
      props: component.props.map((p) => p.name),
    };
  }
  const match = component.props.find((p) => p.name === prop || p.attribute === prop);
  if (match) {
    return { valid: true, kind: 'prop', input: name, prop, tag: component.tag, detail: match };
  }
  return {
    valid: false,
    kind: 'prop',
    input: name,
    prop,
    tag: component.tag,
    suggestions: component.props.map((p) => p.name),
  };
}
