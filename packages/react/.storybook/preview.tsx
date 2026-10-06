import type { Preview } from '@storybook/react';
// Tokens must be present on :root; importing core (via the Button) registers the element.
import '@jasondaihl/tokens/tokens.css';

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
    (Story, context) => {
      applyTheme(context.globals.theme ?? 'light');
      return <Story />;
    },
  ],
};

export default preview;
