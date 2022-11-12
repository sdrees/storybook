import { Addon_StoryContext } from '@storybook/types';

import { Component } from '@angular/core';
import { moduleMetadata } from './decorators';
import { AngularFramework } from './types';

const defaultContext: Addon_StoryContext<AngularFramework> = {
  componentId: 'unspecified',
  kind: 'unspecified',
  title: 'unspecified',
  id: 'unspecified',
  name: 'unspecified',
  story: 'unspecified',
  tags: [],
  parameters: {},
  initialArgs: {},
  args: {},
  argTypes: {},
  globals: {},
  hooks: {},
  loaded: {},
  originalStoryFn: jest.fn(),
  viewMode: 'story',
  abortSignal: undefined,
  canvasElement: undefined,
};

class MockModule {}
class MockModuleTwo {}
class MockService {}
@Component({})
class MockComponent {}

describe('moduleMetadata', () => {
  it('should add metadata to a story without it', () => {
    const result = moduleMetadata({
      imports: [MockModule],
      providers: [MockService],
    })(
      () => ({
        component: MockComponent,
      }),
      // deepscan-disable-next-line
      defaultContext
    );

    expect(result).toEqual({
      component: MockComponent,
      moduleMetadata: {
        declarations: [],
        entryComponents: [],
        imports: [MockModule],
        schemas: [],
        providers: [MockService],
      },
    });
  });

  it('should combine with individual metadata on a story', () => {
    const result = moduleMetadata({
      imports: [MockModule],
    })(
      () => ({
        component: MockComponent,
        moduleMetadata: {
          imports: [MockModuleTwo],
          providers: [MockService],
        },
      }),
      // deepscan-disable-next-line
      defaultContext
    );

    expect(result).toEqual({
      component: MockComponent,
      moduleMetadata: {
        declarations: [],
        entryComponents: [],
        imports: [MockModule, MockModuleTwo],
        schemas: [],
        providers: [MockService],
      },
    });
  });

  it('should return the original metadata if passed null', () => {
    const result = moduleMetadata(null)(
      () => ({
        component: MockComponent,
        moduleMetadata: {
          providers: [MockService],
        },
      }),
      // deepscan-disable-next-line
      defaultContext
    );

    expect(result).toEqual({
      component: MockComponent,
      moduleMetadata: {
        declarations: [],
        entryComponents: [],
        imports: [],
        schemas: [],
        providers: [MockService],
      },
    });
  });
});
