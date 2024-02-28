import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import React from 'react';
import type { CodeSnippets } from '../../features/WriteStoriesModal/code/types';

const meta: Meta<typeof SyntaxHighlighter> = {
  component: SyntaxHighlighter,
  parameters: {
    chromatic: { delay: 300 },
  },
};

export default meta;

type Story = StoryObj<typeof SyntaxHighlighter>;

const data: CodeSnippets['code'] = [
  [
    {
      snippet: `import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';`,
    },
  ],
  [
    {
      snippet: `const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  // ...
};
    
export default meta;`,
    },
  ],
  [
    { snippet: `export const Primary: Story = {` },
    {
      snippet: `args: {
    primary: true,
    label: 'Click',
    background: 'red'
  }`,
      toggle: true,
    },
    { snippet: `};` },
  ],
  [
    {
      snippet: `// Copy the code below

export const Warning: Story = {
  args: {
    primary: true,
    label: 'Delete now',
    backgroundColor: 'red',
  }
};`,
    },
  ],
];

export const Default: Story = {
  render: (args) => {
    const [activeStep, setActiveStep] = React.useState(0);

    return (
      <div>
        <SyntaxHighlighter {...args} activeStep={activeStep} />
        <button onClick={() => setActiveStep(0)}>Reset</button>
        <button onClick={() => setActiveStep((step) => (activeStep > 0 ? step - 1 : 0))}>
          Previous
        </button>
        <button onClick={() => setActiveStep((step) => step + 1)}>Next</button>
      </div>
    );
  },
  args: {
    data: data,
    activeStep: 0,
    width: 480,
    filename: 'Button.stories.tsx',
  },
};
