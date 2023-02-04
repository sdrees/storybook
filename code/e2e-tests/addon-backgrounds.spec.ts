import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';

test.describe('addon-backgrounds', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);
    await new SbPage(page).waitUntilLoaded();
  });

  test('should have a dark background', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('example/button', 'primary');
    await sbPage.selectToolbar('[title="Change the background of the preview"]', '#list-item-dark');

    await expect(sbPage.getCanvasBodyElement()).toHaveCSS('background-color', 'rgb(51, 51, 51)');
  });

  test('should apply a grid', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('example/button', 'primary');
    await sbPage.selectToolbar('[title="Apply a grid to the preview"]');

    await expect(sbPage.getCanvasBodyElement()).toHaveCSS('background-image', /linear-gradient/);
  });
});
