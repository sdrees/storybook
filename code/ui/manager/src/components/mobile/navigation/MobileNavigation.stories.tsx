import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ManagerContext } from '@storybook/manager-api';
import { within } from '@storybook/testing-library';
import { startCase } from 'lodash';
import { MobileNavigation } from './MobileNavigation';
import { LayoutProvider, useLayout } from '../../layout/LayoutProvider';

const MockPanel = () => {
  const { setMobilePanelOpen } = useLayout();
  return (
    <div>
      panel
      <button type="button" title="Close addon panel" onClick={() => setMobilePanelOpen(false)}>
        close
      </button>
    </div>
  );
};

const renderLabel = ({ name }: { name: string }) => startCase(name);

const mockManagerStore: any = {
  state: {
    index: {
      someRootId: {
        type: 'root',
        id: 'someRootId',
        name: 'root',
        isRoot: true,
        isComponent: false,
        isLeaf: false,
        renderLabel,
      },
      someComponentId: {
        type: 'component',
        id: 'someComponentId',
        name: 'component',
        parent: 'someRootId',
        isRoot: false,
        isComponent: true,
        isLeaf: false,
        renderLabel,
      },
      someStoryId: {
        type: 'story',
        id: 'someStoryId',
        name: 'story',
        parent: 'someComponentId',
        isRoot: false,
        isComponent: false,
        isLeaf: true,
        renderLabel,
      },
    },
  },
  api: {
    getCurrentStoryData() {
      return mockManagerStore.state.index.someStoryId;
    },
  },
};

const meta = {
  component: MobileNavigation,
  title: 'Mobile/Navigation',
  decorators: [
    (storyFn) => (
      <ManagerContext.Provider value={mockManagerStore}>
        <LayoutProvider>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100svh' }}>
            <div style={{ flex: 1 }} />
            {storyFn()}
          </div>
        </LayoutProvider>
      </ManagerContext.Provider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    theme: 'light',
    viewport: {
      defaultViewport: 'mobile1',
    },
    chromatic: { viewports: [320] },
  },
  args: {
    menu: <div>navigation menu</div>,
    panel: <MockPanel />,
    showPanel: true,
  },
} satisfies Meta<typeof MobileNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = {
  parameters: { theme: 'dark' },
};

export const LongStoryName: Story = {
  decorators: [
    (storyFn) => {
      const mockManagerStoreWithLongNames: any = {
        state: {
          index: {
            someRootId: {
              type: 'root',
              id: 'someRootId',
              name: 'someLongRootName',
              isRoot: true,
              isComponent: false,
              isLeaf: false,
              renderLabel,
            },
            someComponentId: {
              type: 'component',
              id: 'someComponentId',
              name: 'someComponentName',
              parent: 'someRootId',
              isRoot: false,
              isComponent: true,
              isLeaf: false,
              renderLabel,
            },
            someStoryId: {
              type: 'story',
              id: 'someStoryId',
              name: 'someLongStoryName',
              parent: 'someComponentId',
              isRoot: false,
              isComponent: false,
              isLeaf: true,
              renderLabel,
            },
          },
        },
        api: {
          getCurrentStoryData() {
            return mockManagerStoreWithLongNames.state.index.someStoryId;
          },
        },
      };
      return (
        <ManagerContext.Provider value={mockManagerStoreWithLongNames}>
          {storyFn()}
        </ManagerContext.Provider>
      );
    },
  ],
};

export const MenuOpen: Story = {
  play: async ({ canvasElement }) => {
    const menuOpen = await within(canvasElement).getByTitle('Open navigation menu');
    await menuOpen.click();
  },
};

export const MenuClosed: Story = {
  play: async (context) => {
    await MenuOpen.play(context);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const overlay = await within(context.canvasElement).getByLabelText('Close navigation menu');
    await overlay.click();
  },
};

export const PanelOpen: Story = {
  play: async ({ canvasElement }) => {
    const panelButton = await within(canvasElement).getByTitle('Open addon panel');
    await panelButton.click();
  },
};

export const PanelClosed: Story = {
  play: async (context) => {
    await PanelOpen.play(context);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const closeButton = await within(context.canvasElement).getByTitle('Close addon panel');
    await closeButton.click();
  },
};

export const PanelDisabled: Story = {
  args: {
    showPanel: false,
  },
};
