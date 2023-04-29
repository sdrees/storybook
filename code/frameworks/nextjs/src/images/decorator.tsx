import * as React from 'react';
import type { Addon_StoryContext } from '@storybook/types';
import { ImageContext } from './context';

export const ImageDecorator = (
  Story: React.FC,
  { parameters }: Addon_StoryContext
): React.ReactNode => {
  if (!parameters.nextjs?.image) {
    return <Story />;
  }

  return (
    <ImageContext.Provider value={parameters.nextjs.image}>
      <Story />
    </ImageContext.Provider>
  );
};
