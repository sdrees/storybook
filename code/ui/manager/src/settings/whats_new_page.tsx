import { useStorybookState } from '@storybook/manager-api';
import type { FC } from 'react';
import React from 'react';

import { WhatsNewScreen } from './whats_new';

const WhatsNewPage: FC = () => {
  const state = useStorybookState();

  return (
    <WhatsNewScreen
      url={state.whatsNewData?.status === 'SUCCESS' ? state.whatsNewData.url : undefined}
    />
  );
};

export { WhatsNewPage };
