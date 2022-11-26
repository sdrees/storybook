import type { ComponentProps, Key } from 'react';
import React, { Fragment } from 'react';
import { action } from '@storybook/addon-actions';
import { logger } from '@storybook/client-logger';
import type { Meta } from '@storybook/react';
import { Tabs, TabsState, TabWrapper } from './tabs';

const colours = Array.from(new Array(15), (val, index) => index).map((i) =>
  Math.floor((1 / 15) * i * 16777215)
    .toString(16)
    .padStart(6, '0')
);

interface FibonacciMap {
  [key: string]: number;
}

function fibonacci(num: number, memo?: FibonacciMap): number {
  /* eslint-disable no-param-reassign */
  if (!memo) {
    memo = {};
  }
  if (memo[num]) {
    return memo[num];
  }
  if (num <= 1) {
    return 1;
  }

  memo[num] = fibonacci(num - 1, memo) + fibonacci(num - 2, memo);
  return memo[num];
  /* eslint-enable no-param-reassign */
}

interface Panels {
  [key: string]: {
    title: string;
    color?: string;
    render: ({ active, key }: { active: boolean; key: Key }) => JSX.Element;
  };
}

const panels: Panels = {
  test1: {
    title: 'Tab title #1',
    render: ({ active, key }) =>
      active ? (
        <div id="test1" key={key}>
          CONTENT 1
        </div>
      ) : null,
  },
  test2: {
    title: 'Tab title #2',
    render: ({ active, key }) => (
      <div
        key={key}
        id="test2"
        style={{
          background: 'hotpink',
          minHeight: '100%',
          display: active ? 'block' : 'none',
        }}
      >
        CONTENT 2
      </div>
    ),
  },
  test3: {
    title: 'Tab with scroll!',
    render: ({ active, key }) =>
      active ? (
        <div id="test3" key={key}>
          {colours.map((colour, i) => (
            <div
              key={colour}
              style={{
                background: `#${colour}`,
                height: 30 + fibonacci(i + 5) / 10,
              }}
            />
          ))}
        </div>
      ) : null,
  },
  test4: {
    title: 'Tab title #4',
    render: ({ active, key }) =>
      active ? (
        <div key={key} id="test4">
          CONTENT 4
        </div>
      ) : null,
  },
  test5: {
    title: 'Tab title #5',
    render: ({ active, key }) =>
      active ? (
        <div key={key} id="test5">
          CONTENT 5
        </div>
      ) : null,
  },
  test6: {
    title: 'Tab title #6',
    render: ({ active, key }) => (
      <TabWrapper key={key} active={active} render={() => <div>CONTENT 6</div>} />
    ),
  },
};

const onSelect = action('onSelect');

const content = Object.entries(panels).map(([k, v]) => (
  <div key={k} id={k} title={v.title}>
    {v.render}
  </div>
));

export default {
  title: 'Tabs',
  decorators: [
    (story) => (
      <div
        style={{
          position: 'relative',
          height: 'calc(100vh - 20px)',
          width: 'calc(100vw - 20px)',
          margin: 10,
        }}
      >
        {story()}
      </div>
    ),
  ],
} as Meta;

export const StatefulStatic = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <TabsState initial="test2" {...args}>
      <div id="test1" title="With a function">
        {({ active, selected }: { active: boolean; selected: string }) =>
          active ? <div>{selected} is selected</div> : null
        }
      </div>
      <div id="test2" title="With markup">
        <div>test2 is always active (but visually hidden)</div>
      </div>
    </TabsState>
  ),
};

export const StatefulStaticWithSetButtonTextColors = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <div>
      <TabsState initial="test2" {...args}>
        <div id="test1" title="With a function" color="#e00000">
          {({ active, selected }: { active: boolean; selected: string }) =>
            active ? <div>{selected} is selected</div> : null
          }
        </div>
        <div id="test2" title="With markup" color="green">
          <div>test2 is always active (but visually hidden)</div>
        </div>
      </TabsState>
    </div>
  ),
};
export const StatefulStaticWithSetBackgroundColor = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <div>
      <TabsState initial="test2" backgroundColor="rgba(0,0,0,.05)" {...args}>
        <div id="test1" title="With a function" color="#e00000">
          {({ active, selected }: { active: boolean; selected: string }) =>
            active ? <div>{selected} is selected</div> : null
          }
        </div>
        <div id="test2" title="With markup" color="green">
          <div>test2 is always active (but visually hidden)</div>
        </div>
      </TabsState>
    </div>
  ),
};

export const StatefulDynamic = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <TabsState initial="test3" {...args}>
      {Object.entries(panels).map(([k, v]) => (
        <div key={k} id={k} title={v.title}>
          {v.render}
        </div>
      ))}
    </TabsState>
  ),
};
export const StatefulNoInitial = {
  render: (args: ComponentProps<typeof TabsState>) => <TabsState {...args}>{content}</TabsState>,
};
export const StatelessBordered = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <Tabs
      bordered
      absolute={false}
      selected="test3"
      actions={{
        onSelect,
      }}
      {...args}
    >
      {content}
    </Tabs>
  ),
};
export const StatelessWithTools = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <Tabs
      selected="test3"
      actions={{
        onSelect,
      }}
      tools={
        <Fragment>
          <button type="button" onClick={() => logger.log('1')}>
            1
          </button>
          <button type="button" onClick={() => logger.log('2')}>
            2
          </button>
        </Fragment>
      }
      {...args}
    >
      {content}
    </Tabs>
  ),
};
export const StatelessAbsolute = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <Tabs
      absolute
      selected="test3"
      actions={{
        onSelect,
      }}
      {...args}
    >
      {content}
    </Tabs>
  ),
};
export const StatelessAbsoluteBordered = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <Tabs
      absolute
      bordered
      selected="test3"
      actions={{
        onSelect,
      }}
      {...args}
    >
      {content}
    </Tabs>
  ),
};
export const StatelessEmpty = {
  render: (args: ComponentProps<typeof TabsState>) => (
    <Tabs
      actions={{
        onSelect,
      }}
      bordered
      absolute
      {...args}
    />
  ),
};
