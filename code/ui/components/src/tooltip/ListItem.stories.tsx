import React from 'react';
import ListItem from './ListItem';
import { Icons } from '../icon/icon';

export default {
  component: ListItem,
};

export const All = {
  render: (args) => (
    <div>
      <ListItem loading />
      <ListItem title="Default" />
      <ListItem title="Default icon" right={<Icons icon="eye" />} />
      <ListItem left="left" title="title" center="center" right="right" />
      <ListItem active left="left" title="active" center="center" right="right" />
      <ListItem
        active
        left="left"
        title="active icon"
        center="center"
        right={<Icons icon="eye" />}
      />
      <ListItem disabled left="left" title="disabled" center="center" right="right" />
    </div>
  ),
};

export const Default = {
  args: {
    title: 'Default',
  },
};

export const Loading = {
  args: {
    loading: true,
  },
};

export const DefaultIcon = {
  args: {
    title: 'Default icon',
    right: <Icons icon="eye" />,
  },
};
export const ActiveIcon = {
  args: {
    title: 'Active icon',
    active: true,
    right: <Icons icon="eye" />,
  },
};

export const WPositions = {
  args: {
    left: 'left',
    title: 'title',
    center: 'center',
    right: 'right',
  },
};

export const WPositionsActive = {
  args: {
    active: true,
    left: 'left',
    title: 'title',
    center: 'center',
    right: 'right',
  },
};
export const WPositionsDisabled = {
  args: {
    disabled: true,
    left: 'left',
    title: 'title',
    center: 'center',
    right: 'right',
  },
};
