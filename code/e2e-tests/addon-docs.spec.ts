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
      /^(vue3|vue-cli|preact)/i.test(templateName),
      `Skipping ${templateName}, which does not support dynamic source snippets`
    );

    const sbPage = new SbPage(page);
    await sbPage.navigateToStory('example-button', 'docs');
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
});
