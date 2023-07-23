import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Base = {
  args: { children: 'Button' },
};

const Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    viewBox="0 0 14 14"
    fill="currentColor"
  >
    <path d="M3.97 8.75a.5.5 0 0 0-.87.5 4.5 4.5 0 0 0 7.8 0 .5.5 0 1 0-.87-.5 3.5 3.5 0 0 1-6.06 0ZM5.5 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9.5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    <path
      fillRule="evenodd"
      d="M14 7A7 7 0 1 1 0 7a7 7 0 0 1 14 0Zm-1 0A6 6 0 1 1 1 7a6 6 0 0 1 12 0Z"
    />
  </svg>
);

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  ),
};

export const Active: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button variant="primary" active>
        Primary
      </Button>
      <Button variant="secondary" active>
        Secondary
      </Button>
      <Button variant="tertiary" active>
        Tertiary
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button variant="primary" icon={<Icon />}>
        Primary
      </Button>
      <Button variant="secondary" icon={<Icon />}>
        Secondary
      </Button>
      <Button variant="tertiary" icon={<Icon />}>
        Tertiary
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button size="small" icon={<Icon />}>
        Small Button
      </Button>
      <Button size="small" icon={<Icon />} iconOnly>
        Small Button
      </Button>
      <Button size="medium" icon={<Icon />}>
        Medium Button
      </Button>
      <Button size="medium" icon={<Icon />} iconOnly>
        Medium Button
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'This is a story that shows how to use the `iconOnly` prop.',
      },
      source: {
        type: 'dynamic',
      },
    },
  },
  render: () => (
    <>
      <Button size="small" variant="primary" iconOnly icon={<Icon />}>
        Primary
      </Button>
      <Button size="small" variant="secondary" iconOnly icon={<Icon />}>
        Secondary
      </Button>
      <Button size="small" variant="tertiary" iconOnly icon={<Icon />}>
        Tertiary
      </Button>
      <Button size="medium" variant="primary" iconOnly icon={<Icon />}>
        Primary
      </Button>
      <Button size="medium" variant="secondary" iconOnly icon={<Icon />}>
        Secondary
      </Button>
      <Button size="medium" variant="tertiary" iconOnly icon={<Icon />}>
        Tertiary
      </Button>
    </>
  ),
  decorators: [
    (Story) => <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>{Story()}</div>,
  ],
};

export const IconOnlyActive: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button size="small" variant="primary" iconOnly icon={<Icon />} active>
        Primary
      </Button>
      <Button size="small" variant="secondary" iconOnly icon={<Icon />} active>
        Secondary
      </Button>
      <Button size="small" variant="tertiary" iconOnly icon={<Icon />} active>
        Tertiary
      </Button>
      <Button size="medium" variant="primary" iconOnly icon={<Icon />} active>
        Primary
      </Button>
      <Button size="medium" variant="secondary" iconOnly icon={<Icon />} active>
        Secondary
      </Button>
      <Button size="medium" variant="tertiary" iconOnly icon={<Icon />} active>
        Tertiary
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithHref: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Button onClick={() => console.log('Hello')}>I am a button using onClick</Button>
      <Button as="a" href="https://storybook.js.org/">
        I am an anchor using Href
      </Button>
    </div>
  ),
};
