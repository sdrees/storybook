import React from 'react';
import { storiesOf } from '@storybook/react';
import { Badge } from './Badge';

storiesOf('Basics/Badge', module).add('all badges', () => (
  <div>
    <Badge status="neutral">Neutral</Badge>
    <Badge status="positive">Positive</Badge>
    <Badge status="warning">Warning</Badge>
    <Badge status="negative">Negative</Badge>
    <Badge status="critical">Critical</Badge>
  </div>
));
