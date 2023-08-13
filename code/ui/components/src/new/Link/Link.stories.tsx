import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Link } from './Link';

const meta: Meta<typeof Link> = {
  title: 'Link',
  component: Link,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Base = {
  args: { children: 'Link' },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Link href="https://storybook.js.org/" variant="primary">
        Primary
      </Link>
      <Link href="https://storybook.js.org/" variant="secondary">
        Secondary
      </Link>
    </div>
  ),
};

export const Underline: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Link href="https://storybook.js.org/" variant="primary" underline="hover">
        Primary
      </Link>
      <Link href="https://storybook.js.org/" variant="primary" underline="always">
        Secondary
      </Link>
      <Link href="https://storybook.js.org/" variant="secondary" underline="hover">
        Secondary
      </Link>
      <Link href="https://storybook.js.org/" variant="secondary" underline="always">
        Secondary
      </Link>
    </div>
  ),
};

export const Weight: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Link href="https://storybook.js.org/" variant="primary" weight="regular">
        Primary
      </Link>
      <Link href="https://storybook.js.org/" variant="primary" weight="bold">
        Secondary
      </Link>
      <Link href="https://storybook.js.org/" variant="secondary" weight="regular">
        Secondary
      </Link>
      <Link href="https://storybook.js.org/" variant="secondary" weight="bold">
        Secondary
      </Link>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Link href="https://storybook.js.org/" variant="primary" icon="FaceHappy">
        Primary
      </Link>
      <Link href="https://storybook.js.org/" variant="secondary" icon="FaceHappy">
        Secondary
      </Link>
    </div>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="https://storybook.js.org/" variant="primary" withArrow>
          Primary
        </Link>
        <Link href="https://storybook.js.org/" variant="secondary" withArrow>
          Secondary
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="https://storybook.js.org/" variant="primary" icon="FaceHappy" withArrow>
          Primary
        </Link>
        <Link href="https://storybook.js.org/" variant="secondary" icon="FaceHappy" withArrow>
          Secondary
        </Link>
      </div>
    </div>
  ),
};
