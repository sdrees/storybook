import type { Framework, StoryContextForEnhancers } from '@storybook/types';
import { combineParameters } from '@storybook/store';

export const enhanceArgTypes = <TFramework extends Framework>(
  context: StoryContextForEnhancers<TFramework>
) => {
  const {
    component,
    argTypes: userArgTypes,
    parameters: { docs = {} },
  } = context;
  const { extractArgTypes } = docs;

  const extractedArgTypes = extractArgTypes && component ? extractArgTypes(component) : {};
  const withExtractedTypes = extractedArgTypes
    ? (combineParameters(extractedArgTypes, userArgTypes) as typeof userArgTypes)
    : userArgTypes;

  return withExtractedTypes;
};
