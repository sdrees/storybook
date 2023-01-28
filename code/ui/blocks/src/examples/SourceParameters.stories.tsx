import type { Meta, StoryObj } from '@storybook/react';
import { SourceType } from '@storybook/docs-tools';

import { EmptyExample } from './EmptyExample';

const code = `query HeroNameAndFriends($episode: Episode) {
          hero(episode: $episode) {
            name
            friends {
              name
            }
          }
        }
`;

const meta = {
  title: 'examples/Stories for the Source Block',
  component: EmptyExample,
} satisfies Meta<typeof EmptyExample>;
export default meta;

type Story = StoryObj<typeof meta>;

export const NoParameters: Story = {
  // This is here so we can tell if we are looking at the real vs emitted source
};

export const TypeCode: Story = {
  parameters: { docs: { source: { type: SourceType.CODE } } },
};

export const TransformSource = {
  parameters: { docs: { source: { transformSource: () => `const transformed = "source";` } } },
};

export const Code = {
  parameters: { docs: { source: { code } } },
};

export const CodeFormat = {
  parameters: { docs: { source: { code, format: true } } },
};

export const CodeLanguage = {
  parameters: { docs: { source: { code, format: true, language: 'graphql' } } },
};

export const CodeDark = {
  parameters: { docs: { source: { code, dark: true } } },
};
