/* eslint-disable jest/no-standalone-expect */
import { expect, Page } from '@playwright/test';

export class SbPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateToStory(title: string, name: string) {
    const titleId = title.replace(/ /g, '-').toLowerCase();
    const storyId = name.replace(/ /g, '-').toLowerCase();

    const titleLink = this.page.locator(`#${titleId}`);
    if ((await titleLink.getAttribute('aria-expanded')) === 'false') {
      await titleLink.click();
    }

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

  previewIframe() {
    return this.page.frameLocator('#storybook-preview-iframe');
  }

  previewRoot() {
    const preview = this.previewIframe();
    return preview.locator('#root:visible, #docs-root:visible');
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
