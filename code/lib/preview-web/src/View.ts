import type { Store_Story } from '@storybook/types';

export interface View<TStorybookRoot> {
  // Get ready to render a story, returning the element to render to
  prepareForStory(story: Store_Story<any>): TStorybookRoot;

  prepareForDocs(): TStorybookRoot;

  showErrorDisplay(err: { message?: string; stack?: string }): void;

  showNoPreview(): void;

  showPreparingStory(options: { immediate: boolean }): void;

  showPreparingDocs(): void;

  showMain(): void;

  showDocs(): void;

  showStory(): void;

  showStoryDuringRender(): void;
}
