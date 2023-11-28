import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';
const templateName = process.env.STORYBOOK_TEMPLATE_NAME;

test.describe('Manager UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);

    await new SbPage(page).waitUntilLoaded();
  });

  test.describe('Desktop', () => {
    // TODO: test dragging and resizing

    test('Sidebar toggling', async ({ page }) => {
      const sbPage = new SbPage(page);

      await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

      // toggle with keyboard shortcut
      await sbPage.page.locator('html').press('s');
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
      await sbPage.page.locator('html').press('s');
      await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

      // toggle with menu item
      await sbPage.page.locator('[aria-label="Shortcuts"]').click();
      await sbPage.page.locator('#list-item-S').click();
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();

      // toggle with "show sidebar" button
      await sbPage.page.locator('[aria-label="Show sidebar"]').click();
      await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();
    });

    test('Toolbar toggling', async ({ page }) => {
      const sbPage = new SbPage(page);
      const expectToolbarVisibility = async (visible: boolean) => {
        expect(async () => {
          const toolbar = await sbPage.page.locator(`[data-test-id="sb-preview-toolbar"]`);
          const marginTop = await toolbar.evaluate(
            (element) => window.getComputedStyle(element).marginTop
          );
          expect(marginTop).toBe(visible ? '0px' : '-40px');
        }).toPass({ intervals: [400] });
      };

      await expectToolbarVisibility(true);

      // toggle with keyboard shortcut
      await sbPage.page.locator('html').press('t');
      await expectToolbarVisibility(false);
      await sbPage.page.locator('html').press('t');
      await expectToolbarVisibility(true);

      // toggle with menu item
      await sbPage.page.locator('[aria-label="Shortcuts"]').click();
      await sbPage.page.locator('#list-item-T').click();
      await expectToolbarVisibility(false);
      await sbPage.page.locator('[aria-label="Shortcuts"]').click();
      await sbPage.page.locator('#list-item-T').click();
      await expectToolbarVisibility(true);
    });

    test.describe('Panel', () => {
      test('Hidden in docs view', async ({ page }) => {
        const sbPage = new SbPage(page);

        // navigate to docs to hide panel
        await sbPage.navigateToStory('example/button', 'docs');

        await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();

        // toggle with keyboard shortcut
        await sbPage.page.locator('html').press('a');
        await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
        await sbPage.page.locator('html').press('a');
        await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
      });

      test('Toggling', async ({ page }) => {
        const sbPage = new SbPage(page);

        // navigate to story to show panel
        await sbPage.navigateToStory('example/button', 'primary');

        await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();

        // toggle with keyboard shortcut
        await sbPage.page.locator('html').press('a');
        await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
        await sbPage.page.locator('html').press('a');
        await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();

        // toggle with menu item
        await sbPage.page.locator('[aria-label="Shortcuts"]').click();
        await sbPage.page.locator('#list-item-A').click();
        await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();

        // toggle with "show addons" button
        await sbPage.page.locator('[aria-label="Show addons"]').click();
        await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();
      });

      test('Positioning', async ({ page }) => {
        const sbPage = new SbPage(page);

        // navigate to story to show panel
        await sbPage.navigateToStory('example/button', 'primary');

        await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();

        // toggle position with keyboard shortcut
        await sbPage.page.locator('html').press('d');
        await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();
        // TODO: how to assert panel position?

        // hide with keyboard shortcut
        await sbPage.page.locator('html').press('a');
        await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();

        // toggling position should also show the panel again
        await sbPage.page.locator('html').press('d');
        await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();
      });
    });

    test('Fullscreen toggling', async ({ page }) => {
      const sbPage = new SbPage(page);

      // navigate to story to show panel
      await sbPage.navigateToStory('example/button', 'primary');

      await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

      // toggle with keyboard shortcut
      await sbPage.page.locator('html').press('f');
      await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();

      await sbPage.page.locator('html').press('f');
      await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

      // toggle with menu item
      await sbPage.page.locator('[aria-label="Shortcuts"]').click();
      await sbPage.page.locator('#list-item-F').click();
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
      await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();

      // toggle with "go/exit fullscreen" button
      await sbPage.page.locator('[aria-label="Exit full screen"]').click();
      await expect(sbPage.page.locator('#storybook-panel-root')).toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).toBeVisible();

      await sbPage.page.locator('[aria-label="Go full screen"]').click();
      await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();

      // go fullscreen when sidebar is shown but panel is hidden
      await sbPage.page.locator('[aria-label="Show sidebar"]').click();
      await sbPage.page.locator('[aria-label="Go full screen"]').click();
      await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();

      // go fullscreen when panel is shown but sidebar is hidden
      await sbPage.page.locator('[aria-label="Show addons"]').click();
      await sbPage.page.locator('[aria-label="Go full screen"]').click();
      await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();
      await expect(sbPage.page.locator('.sidebar-container')).not.toBeVisible();
    });

    test('Settings page', async ({ page }) => {
      const sbPage = new SbPage(page);
      await sbPage.page.locator('[aria-label="Shortcuts"]').click();
      await sbPage.page.locator('#list-item-about').click();

      await expect(sbPage.page.url()).toContain('/settings/about');

      await expect(sbPage.page.locator('#storybook-panel-root')).not.toBeVisible();

      await sbPage.page.locator('[title="Close settings page"]').click();
      await expect(sbPage.page.url()).not.toContain('/settings/about');
    });
  });

  test.describe('Mobile', () => {
    // TODO: remove this when SSV6 templates have been removed
    // Some assertions in these tests are not compatible with SSV6
    // GIven that SSV6 will be removed before the new mobile UI released, it doesn't make sense to fix them
    // eslint-disable-next-line jest/no-disabled-tests
    test.skip(
      // eslint-disable-next-line jest/valid-title
      templateName?.includes('ssv6') || false,
      'Skip mobile UI tests for SSV6'
    );

    // standard iPhone viewport size
    test.use({ viewport: { width: 390, height: 844 } });

    test('Navigate to story', async ({ page }) => {
      const sbPage = new SbPage(page);

      const mobileNavigationHeading = await sbPage.page.locator('[title="Open navigation menu"]');

      // navigation menu is closed
      await expect(mobileNavigationHeading).toHaveText('Configure your project/Docs');
      await expect(sbPage.page.locator('#storybook-explorer-menu')).not.toBeVisible();

      // open navigation menu
      await mobileNavigationHeading.click();

      await sbPage.openComponent('Example/Button');

      // navigation menu is still open
      await expect(sbPage.page.locator('#storybook-explorer-menu')).toBeVisible();
      // story has not changed
      await expect(sbPage.page.url()).toContain('configure-your-project');

      await sbPage.navigateToStory('Example/Button', 'Secondary');

      // navigation menu is closed
      await expect(mobileNavigationHeading).toHaveText('Example/Button/Secondary');
      await expect(sbPage.page.locator('#storybook-explorer-menu')).not.toBeVisible();
      // story has changed
      await expect(sbPage.page.url()).toContain('example-button--secondary');
    });

    test('Open and close addon panel', async ({ page }) => {
      const sbPage = new SbPage(page);

      const mobileNavigationHeading = await sbPage.page.locator('[title="Open navigation menu"]');
      await mobileNavigationHeading.click();
      await sbPage.navigateToStory('Example/Button', 'Secondary');

      // panel is closed
      await expect(mobileNavigationHeading).toHaveText('Example/Button/Secondary');
      await expect(sbPage.page.locator('#tabbutton-addon-controls')).not.toBeVisible();

      // open panel
      await sbPage.page.locator('[title="Open addon panel"]').click();

      // panel is open
      await expect(sbPage.page.locator('#tabbutton-addon-controls')).toBeVisible();

      // close panel
      await sbPage.page.locator('[title="Close addon panel"]').click();

      // panel is closed
      await expect(mobileNavigationHeading).toHaveText('Example/Button/Secondary');
      await expect(sbPage.page.locator('#tabbutton-addon-controls')).not.toBeVisible();
    });
  });
});
