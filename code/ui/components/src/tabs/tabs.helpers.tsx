import { styled } from '@storybook/theming';
import type { ReactElement } from 'react';
import React, { Children } from 'react';

export interface VisuallyHiddenProps {
  active?: boolean;
}

export const VisuallyHidden = styled.div<VisuallyHiddenProps>(({ active }) =>
  active ? { display: 'block' } : { display: 'none' }
);

export const childrenToList = (children: any, selected: string) =>
  Children.toArray(children).map(
    ({ props: { title, id, color, children: childrenOfChild } }: ReactElement, index) => {
      const content = Array.isArray(childrenOfChild) ? childrenOfChild[0] : childrenOfChild;
      return {
        active: selected ? id === selected : index === 0,
        title,
        id,
        color,
        render:
          typeof content === 'function'
            ? content
            : ({ active, key }: any) => (
                <VisuallyHidden key={key} active={active} role="tabpanel">
                  {content}
                </VisuallyHidden>
              ),
      };
    }
  );

export type ChildrenList = ReturnType<typeof childrenToList>;
