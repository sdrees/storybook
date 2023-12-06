import * as React from 'react';
import type { StoryContext } from '@storybook/react';

export const ServerComponentDecorator = (
  Story: React.FC,
  { parameters }: StoryContext
): React.ReactNode =>
  parameters?.nextjs?.rsc ? (
    <React.Suspense>
      <Story />
    </React.Suspense>
  ) : (
    <Story />
  );
