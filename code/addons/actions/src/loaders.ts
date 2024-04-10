/* eslint-disable no-underscore-dangle */
import type { LoaderFunction } from '@storybook/types';
import { global } from '@storybook/global';
import type { onMockCall as onMockCallType } from '@storybook/test';
import { action } from './runtime';

let subscribed = false;

const logActionsWhenMockCalled: LoaderFunction = (context) => {
  const {
    parameters: { actions },
  } = context;
  if (actions?.disable) return;

  if (
    !subscribed &&
    '__STORYBOOK_TEST_ON_MOCK_CALL__' in global &&
    typeof global.__STORYBOOK_TEST_ON_MOCK_CALL__ === 'function'
  ) {
    const onMockCall = global.__STORYBOOK_TEST_ON_MOCK_CALL__ as typeof onMockCallType;
    onMockCall((mock, args) => action(mock.getMockName())(args));
    subscribed = true;
  }
};

export const loaders: LoaderFunction[] = [logActionsWhenMockCalled];
