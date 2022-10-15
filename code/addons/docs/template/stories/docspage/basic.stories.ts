import globalThis from 'global';

export default {
  component: globalThis.Components.Button,
  args: { label: 'Click Me!' },
  parameters: { chromatic: { disable: true } },
};

export const Basic = {
  args: { label: 'Basic' },
};

export const Disabled = {
  args: { label: 'Disabled in DocsPage' },
  parameters: { docs: { disable: true } },
};

export const Another = {
  args: { label: 'Another' },
};
