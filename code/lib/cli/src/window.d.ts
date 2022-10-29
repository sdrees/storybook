import type { AnyFramework } from '@storybook/types';
import type { StoryStore } from '@storybook/client-api';

declare global {
  interface Window {
    __STORYBOOK_STORY_STORE__: StoryStore<AnyFramework>;
  }
}
