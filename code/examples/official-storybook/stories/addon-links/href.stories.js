import React from 'react';
import { hrefTo } from '@storybook/addon-links';

export default {
  title: 'Addons/Links/Href',
};

export const Log = () => {
  hrefTo('Addons/Links/Href', 'log');

  return <span>See action logger</span>;
};
Log.parameters = {
  options: {
    panel: 'storybook/actions/panel',
  },
};
