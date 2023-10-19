import type { FC } from 'react';
import React, { useContext } from 'react';
import dedent from 'ts-dedent';
import { deprecate } from '@storybook/client-logger';
import type { Of } from './useOf';
import { useOf } from './useOf';
import { DocsContext } from './DocsContext';
import { DocsStory } from './DocsStory';

interface PrimaryProps {
  /**
   * @deprecated Primary block should only be used to render the primary story, which is automatically found.
   */
  name?: string;
  /**
   * Specify where to get the primary story from.
   */
  of?: Of;
}

export const Primary: FC<PrimaryProps> = (props) => {
  const { name, of } = props;

  if ('of' in props && of === undefined) {
    throw new Error('Unexpected `of={undefined}`, did you mistype a CSF file reference?');
  }

  const docsContext = useContext(DocsContext);

  let story;
  if (of) {
    const resolvedOf = useOf(of || 'meta', ['meta']);
    story = resolvedOf.csfFile.stories[0] || null;
  }

  if (!story) {
    const storyId = name && docsContext.storyIdByName(name);
    story = docsContext.storyById(storyId);
  }

  if (name) {
    deprecate(dedent`\`name\` prop is deprecated on the Primary block.
    The Primary block should only be used to render the primary story, which is automatically found.
    `);
  }

  return story ? (
    <DocsStory of={story.moduleExport} expanded={false} __primary withToolbar />
  ) : null;
};
