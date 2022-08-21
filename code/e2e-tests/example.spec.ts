import { test, expect } from '@playwright/test';
import process from 'process';

const storybookUrl = process.env.STORYBOOK_URL || 'http://localhost:8001';

test('Basic story test', async ({ page }) => {
  await page.goto(storybookUrl);

  const preview = page.frameLocator('#storybook-preview-iframe');
  const root = preview.locator('#root:visible, #docs-root:visible');

  // Specific check for introduction story
  await expect(root).toContainText('Welcome');
});
