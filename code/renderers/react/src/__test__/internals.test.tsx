/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from 'vitest';
import React from 'react';
import { addons } from '@storybook/preview-api';
import { cleanup, render, screen } from '@testing-library/react';

import { composeStories, composeStory } from '..';

import * as stories from './Button.stories';

const { CSF2StoryWithParamsAndDecorator } = composeStories(stories);

it('returns composed args including default values from argtypes', () => {
  expect(CSF2StoryWithParamsAndDecorator.args).toEqual({
    ...stories.CSF2StoryWithParamsAndDecorator.args,
  });
});

it('returns composed parameters from story', () => {
  expect(CSF2StoryWithParamsAndDecorator.parameters).toEqual(
    expect.objectContaining({
      ...stories.CSF2StoryWithParamsAndDecorator.parameters,
    })
  );
});

describe('Id of the story', () => {
  it('is exposed correctly when composeStories is used', () => {
    expect(CSF2StoryWithParamsAndDecorator.id).toBe(
      'example-button--csf-2-story-with-params-and-decorator'
    );
  });
  it('is exposed correctly when composeStory is used and exportsName is passed', () => {
    const exportName = Object.entries(stories).filter(
      ([_, story]) => story === stories.CSF3Primary
    )[0][0];
    const Primary = composeStory(stories.CSF3Primary, stories.default, {}, exportName);
    expect(Primary.id).toBe('example-button--csf-3-primary');
  });
  it("is not unique when composeStory is used and exportsName isn't passed", () => {
    const Primary = composeStory(stories.CSF3Primary, stories.default);
    expect(Primary.id).toContain('unknown');
  });
});

// common in addons that need to communicate between manager and preview
it('should pass with decorators that need addons channel', () => {
  const PrimaryWithChannels = composeStory(stories.CSF3Primary, stories.default, {
    decorators: [
      (StoryFn: any) => {
        addons.getChannel();
        return <StoryFn />;
      },
    ],
  });
  render(<PrimaryWithChannels>Hello world</PrimaryWithChannels>);
  const buttonElement = screen.getByText(/Hello world/i);
  expect(buttonElement).not.toBeNull();
  cleanup();
});

describe('Unsupported formats', () => {
  it('should throw error if story is undefined', () => {
    const UnsupportedStory = () => <div>hello world</div>;
    UnsupportedStory.story = { parameters: {} };

    const UnsupportedStoryModule: any = {
      default: {},
      UnsupportedStory: undefined,
    };

    expect(() => {
      composeStories(UnsupportedStoryModule);
    }).toThrow();
  });
});

describe('non-story exports', () => {
  it('should filter non-story exports with excludeStories', () => {
    const StoryModuleWithNonStoryExports = {
      default: {
        title: 'Some/Component',
        excludeStories: /.*Data/,
      },
      LegitimateStory: () => <div>hello world</div>,
      mockData: {},
    };

    const result = composeStories(StoryModuleWithNonStoryExports);
    expect(Object.keys(result)).not.toContain('mockData');
  });

  it('should filter non-story exports with includeStories', () => {
    const StoryModuleWithNonStoryExports = {
      default: {
        title: 'Some/Component',
        includeStories: /.*Story/,
      },
      LegitimateStory: () => <div>hello world</div>,
      mockData: {},
    };

    const result = composeStories(StoryModuleWithNonStoryExports);
    expect(Object.keys(result)).not.toContain('mockData');
  });
});

// Batch snapshot testing
const testCases = Object.values(composeStories(stories)).map((Story) => [
  // The ! is necessary in Typescript only, as the property is part of a partial type
  Story.storyName!,
  Story,
]);
it.each(testCases)('Renders %s story', async (_storyName, Story) => {
  cleanup();
  const tree = await render(<Story />);
  expect(tree.baseElement).toMatchSnapshot();
});
