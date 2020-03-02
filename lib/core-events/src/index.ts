enum events {
  CHANNEL_CREATED = 'channelCreated',
  // Set the current story selection in the preview
  SET_CURRENT_STORY = 'setCurrentStory',
  // The current story changed due to the above
  CURRENT_STORY_WAS_SET = 'currentStoryWasSet',
  // Emitted by the preview whenever the list of stories changes (in batches)
  SET_STORIES = 'setStories',
  // Emitted by the preview when the current story (or error) should be rendered
  RENDER_CURRENT_STORY = 'renderCurrentStory',
  // Deprecated version of the above
  STORY_RENDER = 'storyRender',
  // Force the current story to re-render
  FORCE_RE_RENDER = 'forceReRender',
  // The next 6 events are emitted by the StoryRenderer when rendering the current story
  STORY_CHANGED = 'storyChanged',
  STORY_UNCHANGED = 'storyUnchanged',
  STORY_RENDERED = 'storyRendered',
  STORY_MISSING = 'storyMissing',
  STORY_ERRORED = 'storyErrored',
  STORY_THREW_EXCEPTION = 'storyThrewException',
  REGISTER_SUBSCRIPTION = 'registerSubscription',
  // Tell the manager that the user pressed a key in the preview
  PREVIEW_KEYDOWN = 'previewKeydown',
  // Used in the manager to change the story selection
  SELECT_STORY = 'selectStory',
  STORIES_COLLAPSE_ALL = 'storiesCollapseAll',
  STORIES_EXPAND_ALL = 'storiesExpandAll',
  DOCS_RENDERED = 'docsRendered',
  SHARED_STATE_CHANGED = 'sharedStateChanged',
  SHARED_STATE_SET = 'sharedStateSet',
  NAVIGATE_URL = 'navigateUrl',
}

// Enables: `import Events from ...`
export default events;

// Enables: `import * as Events from ...` or `import { CHANNEL_CREATED } as Events from ...`
// This is the preferred method
export const {
  CHANNEL_CREATED,
  SET_CURRENT_STORY,
  SET_STORIES,
  RENDER_CURRENT_STORY,
  STORY_RENDER,
  FORCE_RE_RENDER,
  STORY_CHANGED,
  STORY_UNCHANGED,
  STORY_RENDERED,
  STORY_MISSING,
  STORY_ERRORED,
  STORY_THREW_EXCEPTION,
  REGISTER_SUBSCRIPTION,
  PREVIEW_KEYDOWN,
  SELECT_STORY,
  STORIES_COLLAPSE_ALL,
  STORIES_EXPAND_ALL,
  DOCS_RENDERED,
  SHARED_STATE_CHANGED,
  SHARED_STATE_SET,
  NAVIGATE_URL,
} = events;
