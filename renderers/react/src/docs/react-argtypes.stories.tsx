import React, { useState } from 'react';
import mapValues from 'lodash/mapValues';
import { PureArgsTable as ArgsTable } from '@storybook/blocks';
import type { Args } from '@storybook/csf';
import { inferControls } from '@storybook/store';

import { storiesOf } from '../public-api';
import type { StoryContext } from '../types';
import { extractArgTypes } from './extractArgTypes';

// FIXME
type Component = any;

const argsTableProps = (component: Component) => {
  const argTypes = extractArgTypes(component);
  const parameters = { __isArgsStory: true };
  const rows = inferControls({ argTypes, parameters } as unknown as StoryContext<any>);
  return { rows };
};

const ArgsStory = ({ component }: any) => {
  const { rows } = argsTableProps(component);
  const initialArgs = mapValues(rows, (argType) => argType.defaultValue) as Args;

  const [args, setArgs] = useState(initialArgs);
  return (
    <>
      <p>
        <b>NOTE:</b> these stories are to help visualise the snapshot tests in{' '}
        <code>./react-properties.test.js</code>.
      </p>
      <ArgsTable rows={rows} args={args} updateArgs={(val) => setArgs({ ...args, ...val })} />
      <table>
        <thead>
          <tr>
            <th>arg name</th>
            <th>argType</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(args).map(([key, val]) => (
            <tr key={key}>
              <td>
                <code>{key}</code>
              </td>
              <td>
                <pre>{JSON.stringify(rows[key])}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const issuesFixtures = [
  'js-class-component',
  'js-function-component',
  'js-function-component-inline-defaults',
  'js-function-component-inline-defaults-no-propTypes',
  'ts-function-component',
  'ts-function-component-inline-defaults',
  '9399-js-proptypes-shape',
  '8663-js-styled-components',
  '9626-js-default-values',
  '9668-js-proptypes-no-jsdoc',
  '8143-ts-react-fc-generics',
  '8143-ts-imported-types',
  '8279-js-styled-docgen',
  '8140-js-prop-types-oneof',
  '9023-js-hoc',
  '8740-ts-multi-props',
  '9556-ts-react-default-exports',
  '9592-ts-styled-props',
  '9591-ts-import-types',
  '9721-ts-deprecated-jsdoc',
  '9827-ts-default-values',
  '9586-js-react-memo',
  '9575-ts-camel-case',
  '9493-ts-display-name',
  '8894-9511-ts-forward-ref',
  '9465-ts-type-props',
  '8428-js-static-prop-types',
  '9764-ts-extend-props',
  '9922-ts-component-props',
];

const issuesStories = storiesOf('ArgTypes/Issues', module);
issuesFixtures.forEach((fixture) => {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const { component } = require(`./__testfixtures__/${fixture}/input`);

  issuesStories.add(fixture, () => <ArgsStory component={component} />, {
    chromatic: { disable: true },
  });
});
