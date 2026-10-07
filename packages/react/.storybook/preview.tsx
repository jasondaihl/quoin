import type { Preview } from '@storybook/react';
// Tokens must be present on :root; importing core (via the Button) registers the element.
import '@jasondaihl/quoin-tokens/tokens.css';

// Reflect the selected brand + theme onto the document root. Components read only
// semantic CSS vars, so setting these attributes re-themes everything. Brand
// (default/ocean) and theme (light/dark) are independent axes.
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
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      applyGlobals(context.globals.theme ?? 'light', context.globals.brand ?? 'default');
      return <Story />;
    },
  ],
};

export default preview;
