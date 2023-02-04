import type { FC, SyntheticEvent } from 'react';
import React, { useCallback } from 'react';
import { styled } from '@storybook/theming';

import type { LinkWrapperType, ListItemProps } from './ListItem';
import ListItem from './ListItem';

const List = styled.div(
  {
    minWidth: 180,
    overflow: 'hidden',
    overflowY: 'auto',
    maxHeight: 15.5 * 32, // 11.5 items
  },
  ({ theme }) => ({
    borderRadius: theme.appBorderRadius * 2,
  })
);

export interface Link extends Omit<ListItemProps, 'onClick'> {
  id: string;
  isGatsby?: boolean;
  onClick?: (event: SyntheticEvent, item: ListItemProps) => void;
}

export interface TooltipLinkListProps {
  links: Link[];
  LinkWrapper?: LinkWrapperType;
}

const Item: FC<TooltipLinkListProps['links'][number]> = (props) => {
  const { LinkWrapper, onClick: onClickFromProps, id, ...rest } = props;
  const { title, href, active } = rest;
  const onClick = useCallback(
    (event: SyntheticEvent) => {
      onClickFromProps(event, rest);
    },
    [onClickFromProps]
  );

  const hasOnClick = !!onClickFromProps;

  return (
    <ListItem
      title={title}
      active={active}
      href={href}
      id={`list-item-${id}`}
      LinkWrapper={LinkWrapper}
      {...rest}
      {...(hasOnClick ? { onClick } : {})}
    />
  );
};

export const TooltipLinkList: FC<TooltipLinkListProps> = ({ links, LinkWrapper }) => (
  <List>
    {links.map(({ isGatsby, ...p }) => (
      <Item key={p.id} LinkWrapper={isGatsby ? LinkWrapper : null} {...p} />
    ))}
  </List>
);

TooltipLinkList.defaultProps = {
  LinkWrapper: ListItem.defaultProps.LinkWrapper,
};
