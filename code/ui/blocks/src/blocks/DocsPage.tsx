import type { FC } from 'react';
import React from 'react';
import { Title } from './Title';
import { Subtitle } from './Subtitle';
import { Description } from './Description';
import { Primary } from './Primary';
import { Controls } from './Controls';
import { Stories } from './Stories';

export const DocsPage: FC = () => (
  <>
    <Title />
    <Subtitle />
    <Description />
    <Primary />
    <Controls />
    <Stories />
  </>
);
