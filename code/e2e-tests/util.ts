/* eslint-disable jest/no-standalone-expect, no-await-in-loop */
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { toId } from '@storybook/csf';

export class SbPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async openComponent(title: string, hasRoot = true) {
    const parts = title.split('/');
    for (let i = hasRoot ? 1 : 0; i < parts.length; i += 1) {
      const parentId = toId(parts.slice(0, i + 1).join('/'));

      const parentLink = this.page.locator(`#${parentId}`);

      await expect(parentLink).toBeVisible();
      if ((await parentLink.getAttribute('aria-expanded')) === 'false') {
        await parentLink.click();
      }
    }
  }

  async navigateToStory(title: string, name: string) {
    await this.openComponent(title);

    const titleId = toId(title);
    const storyId = toId(name);
    const storyLinkId = `#${titleId}--${storyId}`;
    await this.page.waitForSelector(storyLinkId);
    const storyLink = this.page.locator(storyLinkId);
    await storyLink.click({ force: true });

    // assert url changes
    const viewMode = name === 'docs' ? 'docs' : 'story';

    const url = this.page.url();
    await expect(url).toContain(`path=/${viewMode}/${titleId}--${storyId}`);

    const selected = await storyLink.getAttribute('data-selected');
    await expect(selected).toBe('true');
  }

  async waitUntilLoaded() {
    const root = this.previewRoot();
    const docsLoadingPage = root.locator('.sb-preparing-docs');
    const storyLoadingPage = root.locator('.sb-preparing-story');
    await docsLoadingPage.waitFor({ state: 'hidden' });
    await storyLoadingPage.waitFor({ state: 'hidden' });
  }

  previewIframe() {
    return this.page.frameLocator('#storybook-preview-iframe');
  }

  previewRoot() {
    const preview = this.previewIframe();
    return preview.locator('#storybook-root:visible, #storybook-docs:visible');
  }

  panelContent() {
    return this.page.locator('#storybook-panel-root #panel-tab-content');
  }

  async viewAddonPanel(name: string) {
    const tabs = await this.page.locator('[role=tablist] button[role=tab]');
    const tab = tabs.locator(`text=/^${name}/`);
    await tab.click();
  }

  async selectToolbar(toolbarSelector: string, itemSelector?: string) {
    await this.page.locator(toolbarSelector).click();
    if (itemSelector) {
      await this.page.locator(itemSelector).click();
    }
  }

  getCanvasBodyElement() {
    return this.previewIframe().locator('body');
  }
}
