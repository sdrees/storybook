import React from 'react';
import { ArgRow } from './ArgRow';
import { TableWrapper } from './ArgsTable';
import { ResetWrapper } from '../../typography/DocumentFormatting';

export default {
  component: ArgRow,
  title: 'Docs/ArgRow',
  excludeStories: /.*Type$/,
  decorators: [
    (getStory) => (
      <ResetWrapper>
        <TableWrapper>
          <tbody>{getStory()}</tbody>
        </TableWrapper>
      </ResetWrapper>
    ),
  ],
};

export const stringType = {
  name: 'someString',
  description: 'someString description',
  type: { required: true },
  table: {
    type: { summary: 'string' },
    defaultValue: { summary: 'fixme' },
  },
};

export const longNameType = {
  ...stringType,
  name: 'reallyLongStringThatTakesUpSpace',
};

export const longDescType = {
  ...stringType,
  description: 'really long description that takes up a lot of space. sometimes this happens.',
};

export const numberType = {
  name: 'someNumber',
  description: 'someNumber description',
  type: { required: false },
  table: {
    type: { summary: 'number' },
    defaultValue: { summary: '0' },
  },
};

export const objectType = {
  name: 'someObject',
  description: 'A simple `objectOf` propType.',
  table: {
    type: { summary: 'objectOf(number)' },
    defaultValue: { summary: '{ key: 1 }' },
  },
};

export const arrayType = {
  name: 'someArray',
  description: 'array of a certain type',
  table: {
    type: { summary: 'number[]' },
    defaultValue: { summary: '[1, 2, 3]' },
  },
};

export const complexType = {
  name: 'someComplex',
  description: 'A very complex `objectOf` propType.',
  table: {
    type: {
      summary: 'object',
      detail: `[{
    id: number,
    func: func,
    arr: [{ index: number }]
  }]`,
    },
    defaultValue: {
      summary: 'object',
      detail: `[{
    id: 1,
    func: () => {},
    arr: [{ index: 1 }]
  }]`,
    },
  },
};

export const funcType = {
  name: 'concat',
  description: 'concat 2 string values.',
  type: { required: true },
  table: {
    type: { summary: '(a: string, b: string) => string' },
    defaultValue: { summary: 'func', detail: '(a, b) => { return a + b; }' },
    jsDocTags: {
      params: [
        { name: 'a', description: 'The first string' },
        { name: 'b', description: 'The second string' },
      ],
      returns: { description: 'The concatenation of both strings' },
    },
  },
};

export const markdownType = {
  name: 'someString',
  description:
    'A `prop` can *support* __markdown__ syntax. This was ship in ~~5.2~~ 5.3. [Find more info in the storybook docs.](https://storybook.js.org/)',
  table: {
    type: { summary: 'string' },
  },
};

export const string = () => <ArgRow row={stringType} />;
export const longName = () => <ArgRow row={longNameType} />;
export const longDesc = () => <ArgRow row={longDescType} />;
export const number = () => <ArgRow row={numberType} />;
export const objectOf = () => <ArgRow row={objectType} />;
export const arrayOf = () => <ArgRow row={arrayType} />;
export const complexObject = () => <ArgRow row={complexType} />;
export const func = () => <ArgRow row={funcType} />;
export const markdown = () => <ArgRow row={markdownType} />;
