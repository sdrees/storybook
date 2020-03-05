import React from 'react';
import { PropTypes } from 'prop-types';
import { Button } from '@storybook/react/demo';
import { addons } from '@storybook/addons';
import { useAddonState, useStoryState } from '@storybook/api';
import { themes } from '@storybook/theming';
import { AddonPanel } from '@storybook/components';

import logo from './logo.svg';

addons.setConfig({
  theme: {
    brandImage: logo,
    brandTitle: 'Custom - Storybook',
    ...themes.dark,
    appContentBg: 'white',
  },
  panelPosition: 'bottom',
  selectedPanel: 'storybook/roundtrip',
});

const StatePanel = ({ active, key }) => {
  const [managerState, setManagerState] = useAddonState('manager', 10);
  const [previewState, setPreviewState] = useAddonState('preview');
  const [storyState, setstoryState] = useStoryState(10);
  return (
    <AddonPanel key={key} active={active}>
      <div>
        Manager counter: {managerState}
        <br />
        <Button onClick={() => setManagerState(managerState - 1)}>decrement</Button>
        <Button onClick={() => setManagerState(managerState + 1)}>increment</Button>
      </div>
      <br />
      <div>
        Preview counter: {previewState}
        <br />
        <Button onClick={() => previewState && setPreviewState(previewState - 1)}>decrement</Button>
        <Button onClick={() => previewState && setPreviewState(previewState + 1)}>increment</Button>
      </div>
      <br />
      <div>
        Story counter: {storyState}
        <br />
        <Button onClick={() => storyState && setstoryState(storyState - 1)}>decrement</Button>
        <Button onClick={() => storyState && setstoryState(storyState + 1)}>increment</Button>
      </div>
    </AddonPanel>
  );
};

StatePanel.propTypes = {
  active: PropTypes.bool.isRequired,
  key: PropTypes.string.isRequired,
};

addons.addPanel('useAddonState', {
  id: 'useAddonState',
  title: 'useAddonState',
  render: StatePanel,
});
