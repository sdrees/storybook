import type { AutoblockOptions, Blocker } from './types';
import { logger } from '@storybook/node-logger';
import chalk from 'chalk';
import boxen from 'boxen';

const excludesFalse = <T>(x: T | false): x is T => x !== false;

const blockers: () => BlockerModule<any>[] = () => [
  // add/remove blockers here
  import('./block-storystorev6'),
  import('./block-stories-mdx'),
  import('./block-dependencies-versions'),
  import('./block-node-version'),
];

type BlockerModule<T> = Promise<{ blocker: Blocker<T> }>;

export const autoblock = async (
  options: AutoblockOptions,
  list: BlockerModule<any>[] = blockers()
) => {
  if (list.length === 0) {
    return null;
  }

  logger.info('Checking for upgrade blockers...');

  const out = await Promise.all(
    list.map(async (i) => {
      const { blocker } = await i;
      const result = await blocker.check(options);
      if (result) {
        return {
          id: blocker.id,
          value: true,
          log: blocker.log(options, result),
        };
      } else {
        return false;
      }
    })
  );

  const faults = out.filter(excludesFalse);

  if (faults.length > 0) {
    const messages = {
      welcome: `Blocking your upgrade because of the following issues:`,
      reminder: chalk.yellow('Fix the above issues and try running the upgrade command again.'),
    };
    const borderColor = '#FC521F';

    logger.plain('Oh no..');
    logger.plain(
      boxen(
        [messages.welcome]
          .concat(faults.map((i) => i.log))
          .concat([messages.reminder])
          .join('\n\n'),
        { borderStyle: 'round', padding: 1, borderColor }
      )
    );

    return faults[0].id;
  }

  logger.plain('No blockers found.');
  logger.line();

  return null;
};
