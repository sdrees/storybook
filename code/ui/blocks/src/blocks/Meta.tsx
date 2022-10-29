import type { FC } from 'react';
import React, { useContext } from 'react';
import type { BaseAnnotations, Store_ModuleExports } from '@storybook/types';

import { Anchor } from './Anchor';
import { DocsContext } from './DocsContext';

type MetaProps = BaseAnnotations & { of?: Store_ModuleExports };

/**
 * This component is used to declare component metadata in docs
 * and gets transformed into a default export underneath the hood.
 */
export const Meta: FC<MetaProps> = ({ of }) => {
  const context = useContext(DocsContext);
  if (of) {
    context.setMeta(of);
  }

  try {
    const primary = context.storyById();
    return <Anchor storyId={primary.id} />;
  } catch (err) {
    // It is possible to use <Meta> in a standalone entry without referencing any story file
    return null;
  }
};
