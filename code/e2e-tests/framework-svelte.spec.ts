/* eslint-disable jest/no-disabled-tests */
import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:6006';
const templateName = process.env.STORYBOOK_TEMPLATE_NAME;

test.beforeEach(async ({ page }) => {
  await page.goto(storybookUrl);
  await new SbPage(page).waitUntilLoaded();
});

test.describe('Svelte', () => {
  test.skip(
    // eslint-disable-next-line jest/valid-title
    !templateName?.includes('svelte'),
    'Only run this test on Svelte'
  );

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

  test('Decorators runs only once', async ({ page }) => {
    const sbPage = new SbPage(page);
    const lines: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      if (text === 'decorator called') {
        lines.push(text);
      }
    });

    await sbPage.navigateToStory('stories/renderers/svelte/decorators-runs-once', 'default');
    expect(lines).toHaveLength(1);
  });
});

test.describe('SvelteKit', () => {
  test.skip(
    // eslint-disable-next-line jest/valid-title
    !templateName?.includes('svelte-kit'),
    'Only run this test on SvelteKit'
  );

  test('Links are logged in Actions panel', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('stories/sveltekit/modules/hrefs', 'default-actions');
    const root = sbPage.previewRoot();
    const link = root.locator('a', { hasText: 'Link to /basic-href' });
    await link.click();

    await sbPage.viewAddonPanel('Actions');
    const basicLogItem = await page.locator('#storybook-panel-root #panel-tab-content', {
      hasText: `/basic-href`,
    });

    await expect(basicLogItem).toBeVisible();
    const complexLogItem = await page.locator('#storybook-panel-root #panel-tab-content', {
      hasText: `/deep/nested`,
    });
    await expect(complexLogItem).toBeVisible();
  });

  test('goto are logged in Actions panel', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('stories/sveltekit/modules/navigation', 'default-actions');
    const root = sbPage.previewRoot();
    await sbPage.viewAddonPanel('Actions');

    const goto = root.locator('button', { hasText: 'goto' });
    await goto.click();

    const gotoLogItem = page.locator('#storybook-panel-root #panel-tab-content', {
      hasText: `/storybook-goto`,
    });
    await expect(gotoLogItem).toBeVisible();

    const invalidate = root.getByRole('button', { name: 'invalidate', exact: true });
    await invalidate.click();

    const invalidateLogItem = page.locator('#storybook-panel-root #panel-tab-content', {
      hasText: `/storybook-invalidate`,
    });
    await expect(invalidateLogItem).toBeVisible();

    const invalidateAll = root.getByRole('button', { name: 'invalidateAll' });
    await invalidateAll.click();

    const invalidateAllLogItem = page.locator('#storybook-panel-root #panel-tab-content', {
      hasText: `"invalidateAll"`,
    });
    await expect(invalidateAllLogItem).toBeVisible();
  });
});
