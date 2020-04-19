import React, { FC } from 'react';
import { transparentize } from 'polished';
import { styled } from '@storybook/theming';

export interface SectionRowProps {
  section: string;
  showControls: boolean;
}

const SectionTh = styled.th<{}>(({ theme }) => ({
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  fontWeight: theme.typography.weight.black,
  fontSize: theme.typography.size.s1 - 1,
  lineHeight: '24px',
  color:
    theme.base === 'light'
      ? transparentize(0.4, theme.color.defaultText)
      : transparentize(0.6, theme.color.defaultText),
  background: `${theme.background.app} !important`,
}));

export const SectionRow: FC<SectionRowProps> = ({ section, showControls }) => (
  <tr>
    <SectionTh colSpan={showControls ? 4 : 3}>{section}</SectionTh>
  </tr>
);
