import type { ComponentProps, FC } from 'react';
import React, { useContext } from 'react';
import type { StoryId, PreparedStory, ModuleExport } from '@storybook/types';
import { SourceType } from '@storybook/docs-tools';

import type { SourceCodeProps } from '../components/Source';
import { Source as PureSource, SourceError } from '../components/Source';
import type { DocsContextProps } from './DocsContext';
import { DocsContext } from './DocsContext';
import type { SourceContextProps, SourceItem } from './SourceContainer';
import { SourceContext } from './SourceContainer';

import { useStories } from './useStory';

export enum SourceState {
  OPEN = 'open',
  CLOSED = 'closed',
  NONE = 'none',
}

type SourceParameters = SourceCodeProps & {
  /**
   * Where to read the source code from, see `SourceType`
   */
  type?: SourceType;
  /**
   * Transform the detected source for display
   */
  transformSource?: (code: string, story: PreparedStory) => string;
  /**
   * Internal: set by our CSF loader (`enrichCsf` in `@storybook/csf-tools`).
   */
  originalSource?: string;
};

export type SourceProps = Omit<SourceParameters, 'transformSource' | 'storySource'> & {
  /**
   * Pass the export defining a story to render its source
   *
   * ```jsx
   * import { Source } from '@storybook/blocks';
   * import * as ButtonStories from './Button.stories';
   *
   * <Source of={ButtonStories.Primary} />
   * ```
   */
  of?: ModuleExport;

  /** @deprecated use of={storyExport} instead */
  id?: string;

  /** @deprecated use of={storyExport} instead */
  ids?: string[];
};

const getSourceState = (stories: PreparedStory[]) => {
  const states = stories.map((story) => story.parameters.docs?.source?.state).filter(Boolean);
  if (states.length === 0) return SourceState.CLOSED;
  // FIXME: handling multiple stories is a pain
  return states[0];
};

const getStorySource = (storyId: StoryId, sourceContext: SourceContextProps): SourceItem => {
  const { sources } = sourceContext;
  // source rendering is async so source is unavailable at the start of the render cycle,
  // so we fail gracefully here without warning
  return sources?.[storyId] || { code: '' };
};

const getSnippet = (
  snippet: string,
  story: PreparedStory<any>,
  typeFromProps: SourceType
): string => {
  const { __isArgsStory: isArgsStory } = story.parameters;
  const sourceParameters = (story.parameters.docs?.source || {}) as SourceParameters;

  const type = typeFromProps || sourceParameters.type || SourceType.AUTO;

  // if user has hard-coded the snippet, that takes precedence
  if (sourceParameters.code !== undefined) {
    return sourceParameters.code;
  }

  const useSnippet =
    // if user has explicitly set this as dynamic, use snippet
    type === SourceType.DYNAMIC ||
    // if this is an args story and there's a snippet
    (type === SourceType.AUTO && snippet && isArgsStory);

  const code = useSnippet ? snippet : sourceParameters.originalSource || '';

  return sourceParameters.transformSource?.(code, story) || code;
};

// state is used by the Canvas block, which also calls useSourceProps
type SourceStateProps = { state: SourceState };
type PureSourceProps = ComponentProps<typeof PureSource>;

export const useSourceProps = (
  props: SourceProps,
  docsContext: DocsContextProps<any>,
  sourceContext: SourceContextProps
): PureSourceProps & SourceStateProps => {
  const storyIds = props.ids || (props.id ? [props.id] : []);
  const storiesFromIds = useStories(storyIds, docsContext);
  if (!storiesFromIds.every(Boolean)) {
    return { error: SourceError.SOURCE_UNAVAILABLE, state: SourceState.NONE };
  }

  // The check didn't actually change the type.
  let stories: PreparedStory[] = storiesFromIds as PreparedStory[];
  if (props.of) {
    const resolved = docsContext.resolveOf(props.of, ['story']);
    stories = [resolved.story];
  } else if (stories.length === 0) {
    try {
      // Always fall back to the primary story for source parameters, even if code is set.
      stories = [docsContext.storyById()];
    } catch (err) {
      // You are allowed to use <Story code="..." /> unattached.
      if (!props.code) throw err;
    }
  }

  const sourceParameters = (stories[0]?.parameters?.docs?.source || {}) as SourceParameters;
  let { code } = props; // We will fall back to `sourceParameters.code`, but per story below
  let format = props.format ?? sourceParameters.format;
  const language = props.language ?? sourceParameters.language ?? 'jsx';
  const dark = props.dark ?? sourceParameters.dark ?? false;

  if (!code) {
    code = stories
      .map((story, index) => {
        const source = getStorySource(story.id, sourceContext);
        if (index === 0) {
          // Take the format from the first story
          format = source.format ?? story.parameters.docs?.source?.format ?? false;
        }
        return getSnippet(source.code, story, props.type);
      })
      .join('\n\n');
  }

  const state = getSourceState(stories as PreparedStory[]);

  return code
    ? {
        code,
        format,
        language,
        dark,
        // state is used by the Canvas block when it calls this function
        state,
      }
    : { error: SourceError.SOURCE_UNAVAILABLE, state };
};

/**
 * Story source doc block renders source code if provided,
 * or the source for a story if `storyId` is provided, or
 * the source for the current story if nothing is provided.
 */
export const Source: FC<SourceProps> = (props) => {
  const sourceContext = useContext(SourceContext);
  const docsContext = useContext(DocsContext);
  const { state, ...sourceProps } = useSourceProps(props, docsContext, sourceContext);
  return <PureSource {...sourceProps} />;
};
