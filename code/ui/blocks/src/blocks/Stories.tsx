import type { FC } from 'react';
import React, { useContext } from 'react';
import { DocsContext } from './DocsContext';
import { DocsStory } from './DocsStory';
import { Heading } from './Heading';
import type { DocsStoryProps } from './types';

interface StoriesProps {
  title?: JSX.Element | string;
  includePrimary?: boolean;
}

export const Stories: FC<StoriesProps> = ({ title, includePrimary = true }) => {
  const { componentStories } = useContext(DocsContext);

  let stories: DocsStoryProps[] = componentStories();
  stories = stories.filter((story) => !story.parameters?.docs?.disable);
  if (!includePrimary) stories = stories.slice(1);

  if (!stories || stories.length === 0) {
    return null;
  }
  return (
    <>
      <Heading>{title}</Heading>
      {stories.map(
        (story) => story && <DocsStory key={story.id} {...story} expanded __forceInitialArgs />
      )}
    </>
  );
};

Stories.defaultProps = {
  title: 'Stories',
};
