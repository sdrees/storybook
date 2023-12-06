import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';
const templateName = process.env.STORYBOOK_TEMPLATE_NAME || '';

test.describe('addon-actions', () => {
  test('should trigger an action', async ({ page }) => {
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip(
      // eslint-disable-next-line jest/valid-title
      templateName.includes('svelte') && templateName.includes('prerelease'),
      'Svelte 5 prerelase does not support automatic actions with our current example components yet'
    );
    await page.goto(storybookUrl);
    const sbPage = new SbPage(page);
    sbPage.waitUntilLoaded();

    await sbPage.navigateToStory('example/button', 'primary');
    const root = sbPage.previewRoot();
    const button = root.locator('button', { hasText: 'Button' });
    await button.click();

    await sbPage.viewAddonPanel('Actions');
    const logItem = await page.locator('#storybook-panel-root #panel-tab-content', {
      hasText: 'click',
    });
    await expect(logItem).toBeVisible();
  });
});
