import { defineConfig } from 'vitest/config';

// Web components are tested in a real browser (Playwright/Chromium) so Shadow DOM,
// custom element upgrades, and adopted stylesheets behave exactly as in production.
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      name: 'chromium',
    },
    include: ['src/**/*.test.ts'],
  },
});
