/* eslint-disable jest/no-disabled-tests */
import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';
const templateName = process.env.STORYBOOK_TEMPLATE_NAME || '';

test.describe('preview-web', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);

    await new SbPage(page).waitUntilLoaded();
  });

  test('should pass over shortcuts, but not from play functions, story', async ({ page }) => {
    test.skip(
      // eslint-disable-next-line jest/valid-title
      /^(lit)/i.test(`${templateName}`),
      `Skipping ${templateName}, which does not support addon-interactions`
    );

    const sbPage = new SbPage(page);
    await sbPage.deepLinkToStory(storybookUrl, 'lib/preview-api/shortcuts', 'keydown-during-play');
    await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

    // wait for the play function to complete
    await sbPage.viewAddonPanel('Interactions');
    const interactionsTab = await page.locator('#tabbutton-storybook-interactions-panel');
    await expect(interactionsTab).toBeVisible();
    const panel = sbPage.panelContent();
    const runStatusBadge = await panel.locator('[aria-label="Status of the test run"]');
    await expect(runStatusBadge).toContainText(/Pass/);

    // click outside, to remove focus from the input of the story, then press S to toggle sidebar
    await sbPage.previewRoot().click();
    await sbPage.previewRoot().press('s');
    await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
  });

  test('should pass over shortcuts, but not from play functions, docs', async ({ page }) => {
    test.skip(
      // eslint-disable-next-line jest/valid-title
      /^(lit)/i.test(`${templateName}`),
      `Skipping ${templateName}, which does not support addon-interactions`
    );

    const sbPage = new SbPage(page);
    await sbPage.deepLinkToStory(storybookUrl, 'lib/preview-api/shortcuts', 'docs');

    await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

    await sbPage.previewRoot().getByRole('button').getByText('Submit').first().press('s');
    await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
  });
});
