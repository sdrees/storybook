import { createBlocker } from './types';
import { dedent } from 'ts-dedent';
import type { StorybookConfigRaw } from '@storybook/types';

export const blocker = createBlocker({
  id: 'storyStoreV7removal',
  async check({ mainConfig }) {
    const features = (mainConfig as any as StorybookConfigRaw)?.features;
    if (features === undefined) {
      return false;
    }
    if (Object.hasOwn(features, 'storyStoreV7')) {
      return true;
    }
    return false;
  },
  log() {
    return dedent`
      StoryStoreV7 feature must be removed from your Storybook configuration.
      This feature was removed in Storybook 8.0.0.
      Please see the migration guide for more information:
      https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#storystorev6-and-storiesof-is-deprecated
      
      In your Storybook configuration file you have this code:

      export default = {
        features: {
          storyStoreV7: false, <--- remove this line
        },
      };

      You need to remove the storyStoreV7 property.
    `;
  },
});
