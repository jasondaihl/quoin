import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './quoin-stack.js';
import '../button/quoin-button.js';

const box = (label: string) => html`
  <div
    style="
      padding: 12px 16px;
      background: var(--quoin-color-accent-subtle);
      border: 1px solid var(--quoin-color-border-default);
      border-radius: var(--quoin-radius-md);
      color: var(--quoin-color-text-default);
    "
  >
    ${label}
  </div>
`;

const meta: Meta = {
  title: 'Layout/Stack',
  tags: ['autodocs'],
  render: (args) => html`
    <quoin-stack direction=${args.direction} gap=${args.gap} align=${args.align}>
      ${box('One')} ${box('Two')} ${box('Three')}
    </quoin-stack>
  `,
  args: { direction: 'column', gap: '4', align: 'stretch' },
  argTypes: {
    direction: { control: 'inline-radio', options: ['row', 'column'] },
    gap: { control: 'select', options: ['0', '2', '4', '6', '8', '10', '12'] },
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end', 'stretch'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Column: Story = {};
export const Row: Story = { args: { direction: 'row', gap: '3' } };

export const ButtonRow: Story = {
  render: () => html`
    <quoin-stack direction="row" gap="3">
      <quoin-button variant="primary">Save</quoin-button>
      <quoin-button variant="secondary">Cancel</quoin-button>
    </quoin-stack>
  `,
};
