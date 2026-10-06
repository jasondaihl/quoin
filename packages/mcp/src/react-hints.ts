// The one hand-maintained bit of this server.
//
// The Custom Elements Manifest describes the *web components* precisely, but it
// can't know how the thin React wrappers in `@jasondaihl/react` rename things. React
// uses `className` (not `class`) and bridges each custom event to a callback prop
// with its own name/signature. Keep this table in sync with packages/react/src/*.tsx.

export interface ReactHint {
  /** The exported React component name, e.g. `Button`. */
  reactName: string;
  /** Map of DOM custom-event name → the React callback prop that surfaces it. */
  eventProps: Record<string, string>;
}

export const reactHints: Record<string, ReactHint> = {
  'quoin-button': {
    reactName: 'Button',
    eventProps: { 'quoin-click': 'onClick' },
  },
  'quoin-input': {
    reactName: 'Input',
    eventProps: { 'quoin-input': 'onValueInput', 'quoin-change': 'onValueChange' },
  },
  'quoin-stack': {
    reactName: 'Stack',
    eventProps: {},
  },
  'quoin-icon': {
    reactName: 'Icon',
    eventProps: {},
  },
};

/** The React wrapper name for a tag (falls back to a PascalCase of the tag). */
export function reactNameFor(tag: string): string {
  const hint = reactHints[tag];
  if (hint) return hint.reactName;
  return tag
    .replace(/^quoin-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
