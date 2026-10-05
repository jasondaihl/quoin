import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './quoin-input.js';

const meta: Meta = {
  title: 'Components/Input',
  tags: ['autodocs'],
  render: (args) => html`
    <quoin-input
      label=${args.label}
      placeholder=${args.placeholder}
      helper-text=${args.helperText}
      error-text=${args.errorText}
      type=${args.type}
      ?required=${args.required}
      ?disabled=${args.disabled}
      ?invalid=${args.invalid}
    ></quoin-input>
  `,
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    helperText: "We'll never share your email.",
    errorText: 'Please enter a valid email.',
    type: 'email',
    required: false,
    disabled: false,
    invalid: false,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
