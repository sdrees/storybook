import React from 'react';
import { SourceType } from '@storybook/docs-tools';
import type { Meta, StoryObj } from '@storybook/react';

import { Source } from './Source';
import * as ParametersStories from '../examples/SourceParameters.stories';
import { SourceContext } from './SourceContainer';

const meta: Meta<typeof Source> = {
  component: Source,
  parameters: {
    relativeCsfPaths: ['../examples/SourceParameters.stories'],
    snippets: {
      'storybook-blocks-example-sourceparameters--no-parameters': {
        code: `const emitted = 'source';`,
      },
      'storybook-blocks-example-sourceparameters--type-dynamic': {
        code: `const emitted = 'source';`,
      },
    },
  },
  decorators: [
    (Story, { parameters: { snippets = {} } }) => (
      <SourceContext.Provider value={{ sources: snippets }}>
        <Story />
      </SourceContext.Provider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

const code = `query HeroNameAndFriends($episode: Episode) {
          hero(episode: $episode) {
            name
            friends {
              name
            }
          }
        }
`;

export const DefaultAttached = {};

export const Of: Story = {
  args: {
    of: ParametersStories.NoParameters,
  },
};

export const OfTypeProp: Story = {
  args: {
    of: ParametersStories.NoParameters,
    type: SourceType.CODE,
  },
};

export const OfTypeParameter: Story = {
  args: {
    of: ParametersStories.TypeCode,
  },
};

export const OfTransformSourceParameter: Story = {
  args: {
    of: ParametersStories.TransformSource,
  },
};

export const OfUnattached: Story = {
  args: {
    of: ParametersStories.NoParameters,
  },
  parameters: { attached: false },
};

export const Code: Story = {
  args: { code },
};

export const CodeParameters: Story = {
  args: { of: ParametersStories.Code },
};

export const CodeFormat: Story = {
  args: {
    code,
    format: true,
  },
};

export const CodeFormatParameters: Story = {
  args: { of: ParametersStories.CodeFormat },
};

export const CodeLanguage: Story = {
  args: {
    code,
    language: 'graphql',
    format: true,
  },
};

export const CodeLanguageParameters: Story = {
  args: { of: ParametersStories.CodeLanguage },
};

export const Dark: Story = {
  args: { code, dark: true },
};

export const CodeDarkParameters: Story = {
  args: { of: ParametersStories.CodeDark },
};
