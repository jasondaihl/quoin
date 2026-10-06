import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { reactHints, reactNameFor } from './react-hints.js';

// --- Normalized shapes returned by the tools -----------------------------------------

export interface ComponentProp {
  name: string;
  attribute: string | null;
  type: string | null;
  default: string | null;
  reflects: boolean;
  description: string | null;
}

export interface NamedEntry {
  name: string;
  description: string | null;
}

export interface ComponentEvent extends NamedEntry {
  type: string | null;
  /** The React callback prop that surfaces this event, from react-hints. */
  reactProp: string | null;
}

export interface ComponentInfo {
  tag: string;
  reactName: string;
  summary: string | null;
  props: ComponentProp[];
  slots: NamedEntry[];
  events: ComponentEvent[];
  cssParts: NamedEntry[];
  cssProperties: NamedEntry[];
  usage: { html: string; react: string };
}

// --- Manifest loading (authoritative, read at runtime) -------------------------------

const require = createRequire(import.meta.url);

let cache: ComponentInfo[] | undefined;

function loadManifest(): ComponentInfo[] {
  if (cache) return cache;
  const file = require.resolve('@quoin/core/custom-elements.json');
  // biome-ignore lint/suspicious/noExplicitAny: the CEM is external, loosely-typed JSON.
  const manifest = JSON.parse(readFileSync(file, 'utf8')) as any;

  const components: ComponentInfo[] = [];
  for (const mod of manifest.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (!decl.customElement || !decl.tagName) continue;
      components.push(normalize(decl));
    }
  }
  components.sort((a, b) => a.tag.localeCompare(b.tag));
  cache = components;
  return cache;
}

// biome-ignore lint/suspicious/noExplicitAny: CEM declaration node.
function normalize(decl: any): ComponentInfo {
  const tag: string = decl.tagName;

  // Public reactive properties: instance fields with an attribute binding.
  // Excludes private fields, methods, and inherited statics like `baseStyles`.
  const props: ComponentProp[] = (decl.members ?? [])
    .filter(
      // biome-ignore lint/suspicious/noExplicitAny: CEM member node.
      (m: any) => m.kind === 'field' && !m.static && m.privacy !== 'private' && m.attribute != null,
    )
    // biome-ignore lint/suspicious/noExplicitAny: CEM member node.
    .map((m: any) => ({
      name: m.name,
      attribute: m.attribute ?? null,
      type: m.type?.text ?? null,
      default: m.default ?? null,
      reflects: m.reflects === true,
      description: m.description ?? null,
    }));

  const hint = reactHints[tag];
  const events: ComponentEvent[] = (decl.events ?? []).map(
    // biome-ignore lint/suspicious/noExplicitAny: CEM event node.
    (e: any) => ({
      name: e.name,
      type: e.type?.text ?? null,
      description: e.description ?? null,
      reactProp: hint?.eventProps[e.name] ?? null,
    }),
  );

  // biome-ignore lint/suspicious/noExplicitAny: CEM named-entry node.
  const named = (list: any[]): NamedEntry[] =>
    (list ?? []).map((x) => ({ name: x.name, description: x.description ?? null }));

  const info: ComponentInfo = {
    tag,
    reactName: reactNameFor(tag),
    summary: firstLine(decl.summary ?? decl.description),
    props,
    slots: named(decl.slots),
    events,
    cssParts: named(decl.cssParts),
    cssProperties: named(decl.cssProperties),
    usage: { html: '', react: '' },
  };
  info.usage = buildUsage(info);
  return info;
}

// --- Usage-snippet generation --------------------------------------------------------

/** A prop whose default is worth showing in an illustrative snippet. */
function exampleValue(prop: ComponentProp): string | null {
  const raw = prop.default;
  if (raw == null) return null;
  const unquoted = raw.replace(/^'(.*)'$/, '$1');
  if (unquoted === '' || unquoted === 'null' || unquoted === 'undefined') return null;
  if (unquoted === 'false') return null; // boolean off — omit
  return unquoted;
}

function buildUsage(info: ComponentInfo): { html: string; react: string } {
  const hasDefaultSlot = info.slots.some((s) => s.name === '');
  const body = hasDefaultSlot ? 'content' : null;

  // HTML: attribute="value" pairs.
  const htmlAttrs = info.props
    .map((p) => {
      const val = exampleValue(p);
      if (val == null || !p.attribute) return null;
      return val === 'true' ? p.attribute : `${p.attribute}="${val}"`;
    })
    .filter((x): x is string => x != null);
  const htmlOpen = [info.tag, ...htmlAttrs].join(' ');
  const html = body != null ? `<${htmlOpen}>${body}</${info.tag}>` : `<${htmlOpen}></${info.tag}>`;

  // React: camelCase prop names + event callbacks.
  const reactAttrs = info.props
    .map((p) => {
      const val = exampleValue(p);
      if (val == null) return null;
      return val === 'true' ? p.name : `${p.name}="${val}"`;
    })
    .filter((x): x is string => x != null);
  const reactEvents = info.events
    .filter((e) => e.reactProp)
    .map((e) => `${e.reactProp}={/* ${e.name} */}`);
  const reactOpen = [info.reactName, ...reactAttrs, ...reactEvents].join(' ');
  const react = body != null ? `<${reactOpen}>${body}</${info.reactName}>` : `<${reactOpen} />`;

  return { html, react };
}

function firstLine(text: string | undefined): string | null {
  if (!text) return null;
  return text.split('\n')[0]?.trim() ?? null;
}

// --- Public queries ------------------------------------------------------------------

export function listComponents(): Array<Pick<ComponentInfo, 'tag' | 'reactName' | 'summary'>> {
  return loadManifest().map(({ tag, reactName, summary }) => ({ tag, reactName, summary }));
}

/** Resolve a component by tag (`quoin-button`), React name (`Button`), or bare (`button`). */
export function getComponent(name: string): ComponentInfo | undefined {
  const q = name.trim().toLowerCase();
  return loadManifest().find(
    (c) =>
      c.tag.toLowerCase() === q ||
      c.reactName.toLowerCase() === q ||
      c.tag.replace(/^quoin-/, '').toLowerCase() === q,
  );
}
