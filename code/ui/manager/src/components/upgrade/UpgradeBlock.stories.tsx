import type { Meta, StoryObj } from '@storybook/react';
import { ManagerContext } from '@storybook/manager-api';
import React from 'react';
import { UpgradeBlock } from './UpgradeBlock';

const meta = {
  component: UpgradeBlock,
  title: 'UpgradeBlock',
  decorators: [
    (storyFn) => (
      <ManagerContext.Provider
        value={
          {
            api: {
              getCurrentVersion: () => ({
                version: '7.2.2-alpha.0',
              }),
            },
          } as any
        }
      >
        {storyFn()}
      </ManagerContext.Provider>
    ),
  ],
} satisfies Meta<typeof UpgradeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
