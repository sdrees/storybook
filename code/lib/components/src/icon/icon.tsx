import React, { FunctionComponent, ComponentProps, memo } from 'react';
import { styled } from '@storybook/theming';
import { icons, IconKey } from './icons';

const Svg = styled.svg`
  display: inline-block;
  shape-rendering: inherit;
  transform: translate3d(0, 0, 0);
  vertical-align: middle;
  fill: currentColor;

  path {
    fill: currentColor;
  }
`;

export interface IconsProps extends ComponentProps<typeof Svg> {
  icon: IconType;
  useSymbol?: boolean;
}

export const Icons: FunctionComponent<IconsProps> = ({ icon, useSymbol, ...props }: IconsProps) => {
  return (
    <Svg viewBox="0 0 14 14" width="14px" height="14px" {...props}>
      {useSymbol ? <use xlinkHref={`#icon--${icon}`} /> : icons[icon]}
    </Svg>
  );
};

export type IconType = keyof typeof icons;

export interface SymbolsProps extends ComponentProps<typeof Svg> {
  icons?: IconKey[];
}

export const Symbols = memo<SymbolsProps>(({ icons: keys = Object.keys(icons) }) => (
  <Svg
    viewBox="0 0 14 14"
    style={{ position: 'absolute', width: 0, height: 0 }}
    data-chromatic="ignore"
  >
    {keys.map((key: IconKey) => (
      <symbol id={`icon--${key}`} key={key}>
        {icons[key]}
      </symbol>
    ))}
  </Svg>
));
