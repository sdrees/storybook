import React from 'react';
import * as Vue from 'vue';
import { StoryContext, PartialStoryFn } from '@storybook/csf';
import { app, VueFramework } from '../index';

// This is cast as `any` to workaround type errors caused by Vue 2 types
const { render, h } = Vue as any;

export const prepareForInline = (
  storyFn: PartialStoryFn<VueFramework>,
  { args }: StoryContext<VueFramework>
) => {
  const component = storyFn();

  const vnode = h(component, args);
  // By attaching the app context from `@storybook/vue3` to the vnode
  // like this, these stoeis are able to access any app config stuff
  // the end-user set inside `.storybook/preview.js`
  vnode.appContext = app._context; // eslint-disable-line no-underscore-dangle

  return React.createElement('div', {
    ref: (node?: HTMLDivElement): void => (node ? render(vnode, node) : null),
  });
};
