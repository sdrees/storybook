import { checkDependencies } from './utils/cli-utils';

checkDependencies().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
