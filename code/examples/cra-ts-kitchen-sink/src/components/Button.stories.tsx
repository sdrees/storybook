import React from 'react';
import Button, { Type } from './Button';

export default {
  title: 'Docgen/Button',
  component: Button,
};

export const SimpleButton = () => {
  const x = 0;
  return <Button>OK {x}</Button>;
};

const typeOptions = {
  Default: 'default',
  Action: 'action',
};

export const WithType = () => <Button type={typeOptions.Default as Type}>Label</Button>;
