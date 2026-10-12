import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Render real React into a real browser so we exercise the actual React 19 ↔
// custom element interop (property setting + custom event dispatch).
export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  // Pre-bundle the React runtime so Vite doesn't discover it mid-run and reload the
  // browser tab (which closes the connection and fails the suite on a cold cache).
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.tsx'],
  },
});
