import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';

test.describe('addon-interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);
    await new SbPage(page).waitUntilLoaded();
  });

  // FIXME: skip xxx
  test('should have interactions', async ({ page }) => {
    const sbPage = new SbPage(page);

    await sbPage.navigateToStory('example-page', 'logged-in');
    await sbPage.viewAddonPanel('Interactions');

    const welcome = await sbPage.previewRoot().locator('.welcome');
    await expect(welcome).toContainText('Welcome, Jane Doe!');

    const interactionsTab = await page.locator('#tabbutton-interactions');
    await expect(interactionsTab).toContainText(/(1)/);
    await expect(interactionsTab).toBeVisible();

    const panel = sbPage.panelContent();
    await expect(panel).toContainText(/userEvent.click/);
    await expect(panel).toBeVisible();

    const done = await panel.locator('[data-testid=icon-done]');
    await expect(done).toBeVisible();
  });
});
