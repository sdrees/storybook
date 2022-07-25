import React, { FC, useContext } from 'react';
import { str } from '@storybook/docs-tools';
import { Description, DescriptionProps as PureDescriptionProps } from '../components';

import { DocsContext, DocsContextProps } from './DocsContext';
import { Component, CURRENT_SELECTION, currentSelectionWarning, PRIMARY_STORY } from './types';

export enum DescriptionType {
  INFO = 'info',
  NOTES = 'notes',
  DOCGEN = 'docgen',
  LEGACY_5_2 = 'legacy-5.2',
  AUTO = 'auto',
}

type Notes = string | any;
type Info = string | any;

interface DescriptionProps {
  of?: '.' | Component;
  type?: DescriptionType;
  markdown?: string;
  children?: string;
}

const getNotes = (notes?: Notes) =>
  notes && (typeof notes === 'string' ? notes : str(notes.markdown) || str(notes.text));

const getInfo = (info?: Info) => info && (typeof info === 'string' ? info : str(info.text));

const noDescription = (component?: Component): string | null => null;

export const getDescriptionProps = (
  { of, type, markdown, children }: DescriptionProps,
  { storyById }: DocsContextProps<any>
): PureDescriptionProps => {
  const { component, parameters } = storyById();
  if (children || markdown) {
    return { markdown: children || markdown };
  }
  const { notes, info, docs } = parameters;
  const { extractComponentDescription = noDescription, description } = docs || {};
  if (of === CURRENT_SELECTION) currentSelectionWarning();
  const target = [CURRENT_SELECTION, PRIMARY_STORY].includes(of) ? component : of;

  // override component description
  const componentDescriptionParameter = description?.component;
  if (componentDescriptionParameter) {
    return { markdown: componentDescriptionParameter };
  }

  switch (type) {
    case DescriptionType.INFO:
      return { markdown: getInfo(info) };
    case DescriptionType.NOTES:
      return { markdown: getNotes(notes) };
    // FIXME: remove in 6.0
    case DescriptionType.LEGACY_5_2:
      return {
        markdown: `
${getNotes(notes) || getInfo(info) || ''}

${extractComponentDescription(target) || ''}
`.trim(),
      };
    case DescriptionType.DOCGEN:
    case DescriptionType.AUTO:
    default:
      return { markdown: extractComponentDescription(target, { component, ...parameters }) };
  }
};

const DescriptionContainer: FC<DescriptionProps> = (props) => {
  const context = useContext(DocsContext);
  const { markdown } = getDescriptionProps(props, context);
  return markdown ? <Description markdown={markdown} /> : null;
};

// since we are in the docs blocks, assume default description if for primary component story
DescriptionContainer.defaultProps = {
  of: PRIMARY_STORY,
};

export { DescriptionContainer as Description };
