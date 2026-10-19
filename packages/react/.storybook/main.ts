import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-mcp'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Powers addon-mcp's docs toolset: a components manifest the MCP server reads
  // to answer agent queries about quoin's React component APIs. React-only — the
  // web-components Storybook in packages/core can't provide this, which is why
  // the MCP addon lives here alone.
  features: {
    componentsManifest: true,
  },
};

export default config;
