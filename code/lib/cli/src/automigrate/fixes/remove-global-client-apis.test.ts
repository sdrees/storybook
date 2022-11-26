/// <reference types="@types/jest" />;

/* eslint-disable no-underscore-dangle */
import path from 'path';
import type { JsPackageManager } from '../../js-package-manager';
import { RemovedAPIs, removedGlobalClientAPIs as migration } from './remove-global-client-apis';

// eslint-disable-next-line global-require, jest/no-mocks-import
jest.mock('fs-extra', () => require('../../../../../__mocks__/fs-extra'));

const check = async ({ packageJson = {}, contents }: any) => {
  if (contents) {
    // eslint-disable-next-line global-require
    require('fs-extra').__setMockFiles({
      [path.join('.storybook', 'preview.js')]: contents,
    });
  }
  const packageManager = {
    retrievePackageJson: () => ({ dependencies: {}, devDependencies: {}, ...packageJson }),
  } as JsPackageManager;
  return migration.check({ packageManager });
};

describe('removedGlobalClientAPIs fix', () => {
  it('file does not exist', async () => {
    const contents = false;
    await expect(check({ contents })).resolves.toBeNull();
  });
  it('uses no removed APIs', async () => {
    const contents = `
      export const parameters = {};
    `;
    await expect(check({ contents })).resolves.toBeNull();
  });
  it('uses 1 removed API', async () => {
    const contents = `
      import { addParameters } from '@storybook/react';
      addParameters({});
    `;
    await expect(check({ contents })).resolves.toEqual(
      expect.objectContaining({
        usedAPIs: [RemovedAPIs.addParameters],
      })
    );
  });
  it('uses >1 removed APIs', async () => {
    const contents = `
      import { addParameters, addDecorator } from '@storybook/react';
      addParameters({});
      addDecorator((storyFn) => storyFn());
    `;
    await expect(check({ contents })).resolves.toEqual(
      expect.objectContaining({
        usedAPIs: expect.arrayContaining([RemovedAPIs.addParameters, RemovedAPIs.addDecorator]),
      })
    );
  });
});
