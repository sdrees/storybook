import React from 'react';
import { styled } from '@storybook/theming';

import { Spaced } from './Spaced';

const PlaceholderBlock = styled.div(({ color }) => ({
  background: color || 'hotpink',
  padding: 20,
}));
const PlaceholderInline = styled.span(({ color }) => ({
  background: color || 'hotpink',
  display: 'inline-block',
  padding: 20,
}));

export default {
  component: Spaced,
};

export const Default = (args) => (
  <div>
    <PlaceholderBlock color="silver" />
    <Spaced {...args}>
      <PlaceholderBlock />
      <PlaceholderBlock />
      <PlaceholderBlock />
    </Spaced>
    <PlaceholderBlock color="silver" />
  </div>
);

export const Column = {
  render: (args) => (
    <div>
      <PlaceholderBlock color="silver" />
      <Spaced {...args}>
        <PlaceholderBlock />
        <PlaceholderBlock />
        <PlaceholderBlock />
      </Spaced>
      <PlaceholderBlock color="silver" />
    </div>
  ),
};
export const Row = {
  render: (args) => (
    <div>
      <PlaceholderInline color="silver" />
      <Spaced {...args}>
        <PlaceholderInline />
        <PlaceholderInline />
        <PlaceholderInline />
      </Spaced>
      <PlaceholderInline color="silver" />
    </div>
  ),
  argTypes: {
    col: {
      defaultValue: 1,
    },
  },
};
