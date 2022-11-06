import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';

test.describe('preview-web', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);
    await new SbPage(page).waitUntilLoaded();
  });

  test('should pass over shortcuts, but not from play functions, story', async ({ page }) => {
    const sbPage = new SbPage(page);
    await sbPage.navigateToStory('lib/store/shortcuts', 'keydown-during-play');

    await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

    await sbPage.previewRoot().locator('button').press('s');
    await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
  });

  test('should pass over shortcuts, but not from play functions, docs', async ({ page }) => {
    const sbPage = new SbPage(page);
    await sbPage.navigateToStory('lib/store/shortcuts', 'docs');

    await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

    await sbPage.previewRoot().getByRole('button').getByText('Submit').press('s');
    await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
  });
});
