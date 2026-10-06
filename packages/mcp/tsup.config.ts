import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  dts: true,
  sourcemap: true,
  clean: true,
  // Make the built entry directly executable as the `quoin-mcp` bin.
  banner: { js: '#!/usr/bin/env node' },
  // Keep the SDK/zod external; they resolve from node_modules at runtime.
  external: ['@modelcontextprotocol/sdk', 'zod'],
});
