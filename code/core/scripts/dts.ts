import { join } from 'node:path';
import { process, dts, nodeInternals } from '../../../scripts/prepare/tools';
import { getEntries } from './entries';
import pkg from '../package.json';

const cwd = process.cwd();

const flags = process.argv.slice(2);

const selection = flags[0] || 'all';

const entries = getEntries(cwd);
const external = [
  ...Object.keys((pkg as any).dependencies || {}),
  ...Object.keys((pkg as any).peerDependencies || {}),
  ...nodeInternals,
  'typescript',
  '@storybook/core',

  '@storybook/core/builder-manager',
  '@storybook/core/channels',
  '@storybook/core/client-logger',
  '@storybook/core/common',
  '@storybook/core/components',
  '@storybook/core/core-events',
  '@storybook/core/core-server',
  '@storybook/core/csf-tools',
  '@storybook/core/docs-tools',
  '@storybook/core/manager-api',
  '@storybook/core/node-logger',
  '@storybook/core/preview-api',
  '@storybook/core/router',
  '@storybook/core/telemetry',
  '@storybook/core/theming',
  '@storybook/core/types',
];

const all = entries.filter((e) => e.dts);
const list = selection === 'all' ? all : [all[Number(selection)]];

await Promise.all(
  list.map(async (i) => {
    await dts(
      i.file,
      [...external, ...i.externals],
      join(import.meta.dirname, '..', 'tsconfig.build.json')
    );
  })
);
