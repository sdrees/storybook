import { global as globalThis } from '@storybook/global';

export default {
  component: globalThis.Components.Button,
  tags: ['autodocs'],
  args: { label: 'Click Me!' },
  parameters: { chromatic: { disable: true } },
};

export const Auto = {};

export const Disabled = {
  parameters: {
    docs: {
      source: { code: null },
    },
  },
};

export const Code = {
  parameters: {
    docs: {
      source: { type: 'code' },
    },
  },
};

export const Custom = {
  parameters: {
    docs: {
      source: { code: 'custom source' },
    },
  },
};

export const Transform = {
  parameters: {
    docs: {
      transformSource(src: string) {
        return `// We transformed this!\nconst example = (\n${src}\n);`;
      },
    },
  },
};
