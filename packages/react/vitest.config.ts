import { defineConfig } from 'vitest/config';

// Render real React into a real browser so we exercise the actual React 19 ↔
// custom element interop (property setting + custom event dispatch).
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      name: 'chromium',
    },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.tsx'],
  },
});
