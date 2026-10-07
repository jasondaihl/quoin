import type { Preview } from '@storybook/web-components';
// Load quoin tokens globally so the CSS custom properties exist on :root, then
// register every quoin element.
import '@jasondaihl/quoin-tokens/tokens.css';
import '../src/index.js';

/**
 * Reflect the selected brand + theme onto the document root. Because components
 * consume only semantic CSS variables, setting `data-brand` / `data-theme` re-themes
 * everything with zero component changes — the key property of the token system.
 * Brand (default/ocean) and theme (light/dark) are independent axes.
 */
function applyGlobals(theme: string, brand: string) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  // The default brand lives on :root, so it has no [data-brand] selector — clear it.
  if (brand === 'default') root.removeAttribute('data-brand');
  else root.setAttribute('data-brand', brand);
  root.style.background = 'var(--quoin-color-bg-default)';
  root.style.color = 'var(--quoin-color-text-default)';
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
    brand: {
      description: 'quoin brand',
      defaultValue: 'default',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default', icon: 'circle' },
          { value: 'ocean', title: 'Ocean', icon: 'circle' },
          { value: 'sunset', title: 'Sunset', icon: 'circle' },
          { value: 'forest', title: 'Forest', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      applyGlobals(context.globals.theme ?? 'light', context.globals.brand ?? 'default');
      return story();
    },
  ],
};

export default preview;
