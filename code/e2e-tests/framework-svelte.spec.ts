/* eslint-disable jest/no-disabled-tests */
import { test, expect } from '@playwright/test';
import process from 'process';
import dedent from 'ts-dedent';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:6006';
const templateName = process.env.STORYBOOK_TEMPLATE_NAME;

test.describe('Svelte', () => {
  test.skip(
    // eslint-disable-next-line jest/valid-title
    !templateName?.includes('svelte'),
    'Only run this test on Svelte'
  );

  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);
    await new SbPage(page).waitUntilLoaded();
  });

  test('JS story has auto-generated args table', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('stories/renderers/svelte/js-docs', 'docs');
    const root = sbPage.previewRoot();
    const argsTable = root.locator('.docblock-argstable');
    await expect(argsTable).toContainText('Rounds the button');
  });

  test('TS story has auto-generated args table', async ({ page }) => {
    // eslint-disable-next-line jest/valid-title
    test.skip(!templateName?.endsWith('ts') || false, 'Only test TS story in TS templates');
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('stories/renderers/svelte/ts-docs', 'docs');
    const root = sbPage.previewRoot();
    const argsTable = root.locator('.docblock-argstable');
    await expect(argsTable).toContainText('Rounds the button');
  });

  test('Decorators are excluded from generated source code', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('stories/renderers/svelte/slot-decorators', 'docs');
    const root = sbPage.previewRoot();
    const showCodeButton = (await root.locator('button', { hasText: 'Show Code' }).all())[0];
    await showCodeButton.click();
    const sourceCode = root.locator('pre.prismjs');
    const expectedSource = '<ButtonJavaScript primary/>';
    await expect(sourceCode.textContent()).resolves.toContain(expectedSource);
  });
});
