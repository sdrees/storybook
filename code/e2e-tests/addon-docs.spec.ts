/* eslint-disable jest/no-disabled-tests */
/* eslint-disable no-await-in-loop */
import { test, expect } from '@playwright/test';
import process from 'process';
import { SbPage } from './util';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';
const templateName = process.env.STORYBOOK_TEMPLATE_NAME || '';

test.describe('addon-docs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(storybookUrl);
    await new SbPage(page).waitUntilLoaded();
  });

  test('should provide source snippet', async ({ page }) => {
    // templateName is e.g. 'Vue-CLI (Default JS)'
    test.skip(
      // eslint-disable-next-line jest/valid-title
      /^(vue3|vue-cli|preact)/i.test(`${templateName}`),
      `Skipping ${templateName}, which does not support dynamic source snippets`
    );

    const sbPage = new SbPage(page);
    await sbPage.navigateToStory('addons/docs/docspage/basic', 'docs');
    const root = sbPage.previewRoot();
    const toggles = root.locator('.docblock-code-toggle');

    const toggleCount = await toggles.count();
    for (let i = 0; i < toggleCount; i += 1) {
      const toggle = await toggles.nth(i);
      await toggle.click({ force: true });
    }

    const codes = root.locator('pre.prismjs');
    const codeCount = await codes.count();
    for (let i = 0; i < codeCount; i += 1) {
      const code = await codes.nth(i);
      const text = await code.innerText();
      await expect(text).not.toMatch(/^\(args\) => /);
    }
  });

  test('should not run autoplay stories without parameter', async ({ page }) => {
    const sbPage = new SbPage(page);
    await sbPage.navigateToStory('addons/docs/docspage/autoplay', 'docs');

    const root = sbPage.previewRoot();
    const autoplayPre = root.locator('#story--addons-docs-docspage-autoplay--autoplay pre');
    await expect(autoplayPre).toHaveText('Play has run');

    const noAutoplayPre = root.locator('#story--addons-docs-docspage-autoplay--no-autoplay pre');
    await expect(noAutoplayPre).toHaveText('Play has not run');
  });

  test('should order entries correctly', async ({ page }) => {
    const sbPage = new SbPage(page);
    await sbPage.navigateToStory('addons/docs/docspage/basic', 'docs');

    // The `<Primary>` block should render the "Basic" story, and the `<Stories/>` block should
    // render both the "Basic" and "Another" story
    const root = sbPage.previewRoot();
    const stories = root.locator('.sb-story button');

    await expect(await stories.count()).toBe(3);
    await expect(stories.first()).toHaveText('Basic');
    await expect(stories.nth(1)).toHaveText('Basic');
    await expect(stories.last()).toHaveText('Another');
  });
});
