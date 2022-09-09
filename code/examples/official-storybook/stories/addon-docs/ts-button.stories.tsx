import * as React from 'react';
import Button, { Type } from '../../components/TsButton';

export default {
  title: 'Addons/Docs/TsButton',
  component: Button,
  parameters: {
    viewMode: 'story',
  },
};

type Story = () => any;

export const SimpleButton: Story = () => {
  const x = 0;
  return <Button>OK {x}</Button>;
};

const typeOptions = {
  Default: 'default',
  Action: 'action',
};

export const WithType = () => <Button type={typeOptions.Default as Type}>Label</Button>;
