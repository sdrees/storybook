import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';

test.describe('addon-viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);
    await new SbPage(page).waitUntilLoaded();
  });

  test('should have viewport button in the toolbar', async ({ page }) => {
    const sbPage = new SbPage(page);

    // Click on viewport button and select small mobile
    await sbPage.navigateToStory('example/button', 'primary');
    await sbPage.selectToolbar('[title="Change the size of the preview"]', '#list-item-mobile1');

    // Check that Button story is still displayed
    await expect(sbPage.previewRoot()).toContainText('Button');
  });
});
