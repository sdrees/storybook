import type { FunctionComponent, MouseEvent, ReactElement } from 'react';
import React, { Children, cloneElement } from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta } from '@storybook/react';
import { WithTooltip } from './WithTooltip';
import { TooltipLinkList } from './TooltipLinkList';

const onLinkClick = action('onLinkClick');

interface StoryLinkWrapperProps {
  href: string;
  passHref?: boolean;
}

const StoryLinkWrapper: FunctionComponent<StoryLinkWrapperProps> = ({
  href,
  passHref = false,
  children,
}) => {
  const child = Children.only(children) as ReactElement;
  return cloneElement(child, {
    href: passHref && href,
    onClick: (e: MouseEvent) => {
      e.preventDefault();
      onLinkClick(href);
    },
  });
};

export const links = [
  {
    id: '1',
    title: 'Link',
    href: 'http://google.com',
  },
  {
    id: '2',
    title: 'Link',
    href: 'http://google.com',
  },
  {
    id: '3',
    title: 'callback',
    onClick: action('onClick'),
  },
];

export default {
  component: TooltipLinkList,
  decorators: [
    (storyFn) => (
      <div
        style={{
          height: '300px',
        }}
      >
        <WithTooltip placement="top" trigger="click" startOpen tooltip={storyFn()}>
          <div>Tooltip</div>
        </WithTooltip>
      </div>
    ),
  ],
  excludeStories: ['links'],
} as Meta;

export const Links = {
  args: {
    links: links.slice(0, 2),
    LinkWrapper: StoryLinkWrapper,
  },
};

export const LinksAndCallback = {
  args: {
    links,
    LinkWrapper: StoryLinkWrapper,
  },
};
