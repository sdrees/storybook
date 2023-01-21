import type { FC } from 'react';
import React from 'react';
import { Subheading } from './Subheading';
import type { DocsStoryProps } from './types';
import { Anchor } from './Anchor';
import { Description } from './Description';
import { Story } from './Story';
import { Canvas } from './Canvas';

export const DocsStory: FC<DocsStoryProps> = ({
  id,
  name,
  expanded = true,
  withToolbar = false,
  parameters = {},
  __forceInitialArgs = false,
  __primary = false,
}) => {
  let description;
  const { docs } = parameters;
  if (expanded && docs) {
    description = docs.description?.story;
  }

  const subheading = expanded && name;

  return (
    <Anchor storyId={id}>
      {subheading && <Subheading>{subheading}</Subheading>}
      {description && <Description markdown={description} />}
      <Canvas withToolbar={withToolbar}>
        <Story
          id={id}
          parameters={parameters}
          __forceInitialArgs={__forceInitialArgs}
          __primary={__primary}
        />
      </Canvas>
    </Anchor>
  );
};
