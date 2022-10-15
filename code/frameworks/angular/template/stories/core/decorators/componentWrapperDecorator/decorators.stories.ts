// your-component.stories.ts

import { Args, componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import ChildComponent from './child.component';
import ParentComponent from './parent.component';

export default {
  // title: 'Core / Decorators / ComponentWrapperDecorator',
  component: ChildComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `Grandparent<br><div style="margin: 3em; border:solid;">${story}</div>`
    ),
  ],
  args: { childText: 'Child text', childPrivateText: 'Child private text' },
  argTypes: { onClickChild: { action: 'onClickChild' } },
} as Meta;

export const WithTemplate = (args: Args) => ({
  template: `Child Template`,
  props: {
    ...args,
  },
});

export const WithComponent = (args: Args) => ({
  props: {
    ...args,
  },
});

export const WithLegacyComponent = (args: Args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});

export const WithComponentWrapperDecorator = (args: Args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});
WithComponentWrapperDecorator.decorators = [
  moduleMetadata({ declarations: [ParentComponent] }),
  componentWrapperDecorator(ParentComponent),
];

export const WithComponentWrapperDecoratorAndProps = (args: Args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});
WithComponentWrapperDecoratorAndProps.decorators = [
  moduleMetadata({ declarations: [ParentComponent] }),
  componentWrapperDecorator(ParentComponent, {
    parentText: 'Parent text',
    onClickParent: () => {
      console.log('onClickParent');
    },
  }),
];

export const WithComponentWrapperDecoratorAndArgs = (args: Args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});
WithComponentWrapperDecoratorAndArgs.argTypes = {
  parentText: { control: { type: 'text' } },
  onClickParent: { action: 'onClickParent' },
};
WithComponentWrapperDecoratorAndArgs.decorators = [
  moduleMetadata({ declarations: [ParentComponent] }),
  componentWrapperDecorator(ParentComponent, ({ args }) => ({
    parentText: args.parentText,
    onClickParent: args.onClickParent,
  })),
];

export const WithCustomDecorator = (args: Args) => ({
  template: `Child Template`,
  props: {
    ...args,
  },
});
WithCustomDecorator.decorators = [
  (storyFunc) => {
    const story = storyFunc();

    return {
      ...story,
      template: `Custom Decorator <div style="margin: 3em">${story.template}</div>`,
    };
  },
] as Story['decorators'];

export const AngularLegacyRendering = (args: Args) => ({
  template: `Child Template`,
  props: {
    ...args,
  },
});
AngularLegacyRendering.parameters = { angularLegacyRendering: true };
AngularLegacyRendering.decorators = [
  (storyFunc) => {
    const story = storyFunc();

    return {
      ...story,
      template: `Custom Decorator <div style="margin: 3em">${story.template}</div>`,
    };
  },
] as Story['decorators'];
