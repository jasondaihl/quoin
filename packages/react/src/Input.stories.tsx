import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Stack } from './Stack.js';

const meta: Meta<typeof Input> = {
  title: 'React/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
    helperText: "We'll never share your email.",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const Invalid: Story = {
  args: { invalid: true, errorText: 'Please enter a valid email.' },
};

/** A controlled input driven by React state via the bridged custom event. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Stack gap="3">
        <Input label="Your name" value={value} onValueInput={setValue} />
        <span style={{ color: 'var(--quoin-color-text-muted)', fontSize: 14 }}>
          You typed: {value || '—'}
        </span>
      </Stack>
    );
  },
};

/** The whole system together: Stack layout + Input + Button. */
export const SignInForm: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Stack gap="5">
        <Input label="Email" type="email" placeholder="you@example.com" required />
        <Input label="Password" type="password" required />
        <Stack direction="row" gap="3" justify="end">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Sign in</Button>
        </Stack>
      </Stack>
    </div>
  ),
};
