// Generates dist/custom-elements.json — a Custom Elements Manifest describing
// every quoin component (tags, attributes/properties, slots, events, CSS parts)
// straight from the Lit sources, so the @quoin/mcp server never drifts from them.
export default {
  globs: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.stories.ts'],
  outdir: 'dist',
  litelement: true,
};
