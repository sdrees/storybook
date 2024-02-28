import { logger } from '@storybook/node-logger';
import {
  getIncompatibleStorybookPackages,
  getIncompatiblePackagesSummary,
} from '../../../cli/src/doctor/getIncompatibleStorybookPackages';

export const warnOnIncompatibleAddons = async (currentStorybookVersion: string) => {
  const incompatiblePackagesList = await getIncompatibleStorybookPackages({
    skipUpgradeCheck: true,
    skipErrors: true,
    currentStorybookVersion,
  });

  const incompatiblePackagesMessage = await getIncompatiblePackagesSummary(
    incompatiblePackagesList,
    currentStorybookVersion
  );

  if (incompatiblePackagesMessage) {
    logger.warn(incompatiblePackagesMessage);
  }
};
