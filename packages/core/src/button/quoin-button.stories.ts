import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './quoin-button.js';
import type { QuoinButtonSize, QuoinButtonVariant } from './quoin-button.js';

interface ButtonArgs {
  label: string;
  variant: QuoinButtonVariant;
  size: QuoinButtonSize;
  disabled: boolean;
  loading: boolean;
}

const meta: Meta<ButtonArgs> = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) => html`
    <quoin-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
    >
      ${args.label}
    </quoin-button>
  `,
  args: {
    label: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary', label: 'Secondary' } };

export const Ghost: Story = { args: { variant: 'ghost', label: 'Ghost' } };

export const Danger: Story = { args: { variant: 'danger', label: 'Delete' } };

export const Loading: Story = { args: { loading: true, label: 'Saving…' } };

export const Disabled: Story = { args: { disabled: true, label: 'Disabled' } };

/** All variants and sizes rendered together for visual review. */
export const Gallery: Story = {
  render: () => {
    const variants: QuoinButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
    const sizes: QuoinButtonSize[] = ['sm', 'md', 'lg'];
    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${variants.map(
          (variant) => html`
            <div style="display: flex; align-items: center; gap: 12px;">
              ${sizes.map(
                (size) => html`
                  <quoin-button variant=${variant} size=${size}>
                    ${variant}
                  </quoin-button>
                `,
              )}
            </div>
          `,
        )}
      </div>
    `;
  },
};
