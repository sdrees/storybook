import globalThis from 'global';

export default {
  component: globalThis.Components.Html,
  args: {
    contents: '<button>Click Me!</button>',
  },
  parameters: {
    chromatic: { disable: true },
  },
};

export const Options = {
  args: {
    contents:
      '<button style="color: rgb(255, 255, 255); background-color: rgb(76, 175, 80);">Click me!</button>',
  },
  parameters: {
    a11y: {
      config: {},
      options: {
        checks: {
          'color-contrast': { enabled: false },
        },
      },
    },
  },
};

export const Config = {
  args: {
    contents:
      '<button style="color: rgb(255, 255, 255); background-color: rgb(76, 175, 80);">Click me!</button>',
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'avoid-inline-spacing', options: {} }],
        disableOtherRules: true,
      },
      options: {},
    },
  },
};

export const Targetted = {
  args: {
    contents: '<button class="custom-target">Click Me!</button>',
  },
  parameters: {
    a11y: {
      element: '.custom-target',
    },
  },
};

export const Disabled = {
  parameters: {
    a11y: {
      disable: true,
    },
  },
};
