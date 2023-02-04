import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import Panel from './panel';
import { panels, shortcuts } from '../layout/app.mockdata';

const onSelect = action('onSelect');
const toggleVisibility = action('toggleVisibility');
const togglePosition = action('togglePosition');

export default {
  title: 'Panel',
  component: Panel,
};

export const Default = () => {
  const [selectedPanel, setSelectedPanel] = useState('test2');
  return (
    <Panel
      absolute={false}
      panels={panels}
      actions={{ onSelect: setSelectedPanel, toggleVisibility, togglePosition }}
      selectedPanel={selectedPanel}
      shortcuts={shortcuts}
    />
  );
};

export const NoPanels = () => (
  <Panel
    panels={{}}
    actions={{ onSelect, toggleVisibility, togglePosition }}
    shortcuts={shortcuts}
  />
);
