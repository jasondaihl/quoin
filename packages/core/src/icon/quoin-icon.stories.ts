import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './quoin-icon.js';

// A simple search glyph for demos.
const searchSvg = html`
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10 4a6 6 0 1 0 3.9 10.6l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
    />
  </svg>
`;

const meta: Meta = {
  title: 'Components/Icon',
  tags: ['autodocs'],
  render: (args) => html`
    <span style="color: var(--quoin-color-accent-default)">
      <quoin-icon size=${args.size} label=${args.label}>${searchSvg}</quoin-icon>
    </span>
  `,
  args: { size: 'md', label: 'Search' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; align-items: center; gap: 16px; color: var(--quoin-color-text-default)">
      <quoin-icon size="sm" label="small">${searchSvg}</quoin-icon>
      <quoin-icon size="md" label="medium">${searchSvg}</quoin-icon>
      <quoin-icon size="lg" label="large">${searchSvg}</quoin-icon>
    </div>
  `,
};

/** Icons inherit `currentColor`, so they pick up surrounding text color. */
export const InheritsColor: Story = {
  render: () => html`
    <div style="display: flex; gap: 16px;">
      <span style="color: var(--quoin-color-accent-default)"
        ><quoin-icon label="accent">${searchSvg}</quoin-icon></span
      >
      <span style="color: var(--quoin-color-danger-default)"
        ><quoin-icon label="danger">${searchSvg}</quoin-icon></span
      >
    </div>
  `,
};
