import { addons } from '@storybook/manager-api';
import { global } from '@storybook/global';

const STATIC_FILTER = 'static-filter';

addons.register(STATIC_FILTER, (api) => {
  // FIXME: this ensures the filter is applied after the first render
  //        to avoid a strange race condition in Webkit only.
  const excludeTags = Object.entries(global.TAGS_OPTIONS ?? {}).reduce(
    (acc, entry) => {
      const [tag, option] = entry;
      if ((option as any).excludeFromSidebar) {
        acc[tag] = true;
      }
      return acc;
    },
    {} as Record<string, boolean>
  );

  api.experimental_setFilter(STATIC_FILTER, (item) => {
    const tags = item.tags || [];
    return tags.filter((tag) => excludeTags[tag]).length === 0;
  });
});
