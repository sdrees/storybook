import type { FC } from 'react';
import React from 'react';
import Markdown from 'markdown-to-jsx';
import { components } from '@storybook/components';

export interface DescriptionProps {
  markdown: string;
}

/**
 * A markdown description for a component, typically used to show the
 * components docgen docs.
 */
export const Description: FC<DescriptionProps> = ({ markdown }) => (
  <Markdown
    options={{
      forceBlock: true,
      overrides: { code: components.code, pre: components.pre, a: components.a },
    }}
  >
    {markdown}
  </Markdown>
);
