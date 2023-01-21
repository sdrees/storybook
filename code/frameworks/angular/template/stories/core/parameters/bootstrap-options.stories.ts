import { Meta, StoryFn } from '@storybook/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'component-with-whitespace',
  preserveWhitespaces: true,
  template: ` <div>
    <p>Some content</p>
  </div>`,
})
class ComponentWithWhitespace {}

export default {
  // title: 'Core / Parameters / With Bootstrap Options',
  component: ComponentWithWhitespace,
} as Meta;

export const WithPreserveWhitespaces: StoryFn = (_args) => ({});
