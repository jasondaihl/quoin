import { defineConfig } from 'vitest/config';

// Pure logic (manifest parsing + query helpers) — runs in Node, not a browser.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
