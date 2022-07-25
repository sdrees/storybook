import React, {
  FC,
  ReactNode,
  ElementType,
  ComponentProps,
  useContext,
  useRef,
  useEffect,
  useState,
} from 'react';
import { StoryId, StoryAnnotations, AnyFramework } from '@storybook/csf';
import type { ModuleExport, ModuleExports, Story as StoryType } from '@storybook/store';

import { Story as PureStory, StorySkeleton } from '../components';
import { DocsContext, DocsContextProps } from './DocsContext';
import { useStory } from './useStory';
import { CURRENT_SELECTION, currentSelectionWarning } from './types';

export const storyBlockIdFromId = (storyId: string) => `story--${storyId}`;

type PureStoryProps = ComponentProps<typeof PureStory>;

type CommonProps = StoryAnnotations & {
  height?: string;
  inline?: boolean;
};

type StoryDefProps = {
  name: string;
  children: ReactNode;
};

type StoryRefProps = {
  id?: string;
  of?: ModuleExport;
  meta?: ModuleExports;
};

type StoryImportProps = {
  name: string;
  story: ElementType;
};

export type StoryProps = (StoryDefProps | StoryRefProps | StoryImportProps) & CommonProps;

export const getStoryId = (props: StoryProps, context: DocsContextProps): StoryId => {
  const { id, of, meta } = props as StoryRefProps;

  if (of) {
    return context.storyIdByModuleExport(of, meta);
  }

  const { name } = props as StoryDefProps;
  if (id === CURRENT_SELECTION) currentSelectionWarning();
  const inputId = id === CURRENT_SELECTION ? context.storyById().id : id;
  return inputId || context.storyIdByName(name);
};

export const getStoryProps = <TFramework extends AnyFramework>(
  { height, inline }: StoryProps,
  story: StoryType<TFramework>
): PureStoryProps => {
  const { name: storyName, parameters = {} } = story || {};
  const { docs = {} } = parameters;

  if (docs.disable) {
    return null;
  }

  // prefer block props, then story parameters defined by the framework-specific settings and optionally overridden by users
  const { inlineStories = false, iframeHeight = 100 } = docs;
  const storyIsInline = typeof inline === 'boolean' ? inline : inlineStories;

  return {
    inline: storyIsInline,
    id: story?.id,
    height: height || (storyIsInline ? undefined : iframeHeight),
    title: storyName,
    ...(storyIsInline && {
      parameters,
    }),
  };
};

const Story: FC<StoryProps> = (props) => {
  const context = useContext(DocsContext);
  const storyRef = useRef();
  const storyId = getStoryId(props, context);
  const story = useStory(storyId, context);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    let cleanup: () => void;
    if (story && storyRef.current) {
      const element = storyRef.current as HTMLElement;
      cleanup = context.renderStoryToElement(story, element);
      setShowLoader(false);
    }
    return () => cleanup && cleanup();
  }, [story]);

  if (!story) {
    return <StorySkeleton />;
  }

  const storyProps = getStoryProps(props, story);
  if (!storyProps) {
    return null;
  }

  if (storyProps.inline) {
    // We do this so React doesn't complain when we replace the span in a secondary render
    const htmlContents = `<span></span>`;

    // FIXME: height/style/etc. lifted from PureStory
    const { height } = storyProps;
    return (
      <div id={storyBlockIdFromId(story.id)}>
        {height ? (
          <style>{`#story--${story.id} { min-height: ${height}px; transform: translateZ(0); overflow: auto }`}</style>
        ) : null}
        {showLoader && <StorySkeleton />}
        <div
          ref={storyRef}
          data-name={story.name}
          dangerouslySetInnerHTML={{ __html: htmlContents }}
        />
      </div>
    );
  }

  return (
    <div id={storyBlockIdFromId(story.id)}>
      <PureStory {...storyProps} />
    </div>
  );
};

Story.defaultProps = {
  children: null,
  name: null,
};

export { Story };
