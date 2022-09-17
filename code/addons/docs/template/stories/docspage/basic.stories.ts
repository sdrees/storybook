import globalThis from 'global';

export default {
  component: globalThis.Components.Button,
  args: { children: 'Click Me!' },
  parameters: { chromatic: { disable: true } },
};

export const Basic = {
  args: { children: 'Basic' },
};

export const Disabled = {
  args: { children: 'Disabled in DocsPage' },
  parameters: { docs: { disable: true } },
};

export const Another = {
  args: { children: 'Another' },
};
