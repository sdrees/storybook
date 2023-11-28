import type { Meta, StoryObj } from '@storybook/react';
import { ManagerContext } from '@storybook/manager-api';
import React, { useEffect } from 'react';
import { within } from '@storybook/testing-library';
import { MobileAbout } from './MobileAbout';
import { LayoutProvider, useLayout } from '../../layout/LayoutProvider';

/**
 * A helper component to open the about page via the MobileLayoutContext
 */
const OpenAboutHelper = ({ children }: { children: any }) => {
  const { setMobileAboutOpen } = useLayout();
  useEffect(() => {
    setMobileAboutOpen(true);
  }, [setMobileAboutOpen]);
  return children;
};

const meta = {
  component: MobileAbout,
  title: 'Mobile/About',
  parameters: {
    layout: 'fullscreen',
    theme: 'light',
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [320] },
  },
  decorators: [
    (storyFn) => {
      return (
        <ManagerContext.Provider
          value={
            {
              api: {
                getCurrentVersion: () => ({
                  version: '7.2.0',
                }),
              },
            } as any
          }
        >
          <LayoutProvider>
            <OpenAboutHelper>{storyFn()}</OpenAboutHelper>
          </LayoutProvider>
        </ManagerContext.Provider>
      );
    },
  ],
} satisfies Meta<typeof MobileAbout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = {
  parameters: { theme: 'dark' },
};

export const Closed: Story = {
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const closeButton = await within(canvasElement).getByTitle('Close about section');
    await closeButton.click();
  },
};
