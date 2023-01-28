import { Meta, StoryFn } from '@storybook/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { OpenCloseComponent } from './angular-src/open-close-component/open-close.component';

export default {
  component: OpenCloseComponent,
  parameters: {
    chromatic: { delay: 100 },
  },
} as Meta;

export const WithBrowserAnimations: StoryFn = () => ({
  template: `<app-open-close></app-open-close>`,
  moduleMetadata: {
    declarations: [OpenCloseComponent],
    imports: [BrowserAnimationsModule],
  },
});

WithBrowserAnimations.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const opened = canvas.getByText('The box is now Open!');
  expect(opened).toBeDefined();
  const submitButton = canvas.getByRole('button');
  await userEvent.click(submitButton);
  const closed = canvas.getByText('The box is now Closed!');
  expect(closed).toBeDefined();
};
