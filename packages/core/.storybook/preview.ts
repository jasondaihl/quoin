import type { Preview } from '@storybook/web-components';
// Load quoin tokens globally so the CSS custom properties exist on :root, then
// register every quoin element.
import '@jasondaihl/quoin-tokens/tokens.css';
import '../src/index.js';

/**
 * Reflect the selected theme onto the document root. Because components consume
 * only semantic CSS variables, flipping `data-theme` re-themes everything with
 * zero component changes — the key property of the token system.
 */
function applyTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.background = 'var(--quoin-color-bg-default)';
  document.documentElement.style.color = 'var(--quoin-color-text-default)';
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  globalTypes: {
    theme: {
      description: 'quoin color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      applyTheme(context.globals.theme ?? 'light');
      return story();
    },
  ],
};

export default preview;
