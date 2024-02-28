import { motion } from 'framer-motion';
import { Fragment, forwardRef } from 'react';
import { SnippetWrapper } from './Snippet.styled';
import React from 'react';
import { SyntaxHighlighter as StorybookSyntaxHighlighter } from '@storybook/components';

interface Props {
  content: { snippet: string; toggle?: boolean }[];
  active: boolean;
  open?: boolean;
}

const wrapperVariants = {
  default: {
    filter: 'grayscale(1)',
    opacity: 0.5,
  },
  active: {
    filter: 'grayscale(0)',
    opacity: 1,
  },
};

export const Snippet = forwardRef<HTMLDivElement, Props>(function Snippet(
  { active, content, open },
  ref
) {
  const customStyle = {
    fontSize: '0.8125rem',
    lineHeight: '1.1875rem',
  };

  return (
    <SnippetWrapper
      ref={ref}
      initial="default"
      animate={active ? 'active' : 'default'}
      aria-hidden={!active}
      variants={wrapperVariants}
      transition={{ ease: 'easeInOut', duration: 0.6 }}
    >
      {content.map(({ toggle, snippet }, i) => (
        <Fragment key={i}>
          {toggle === undefined && (
            <StorybookSyntaxHighlighter language="typescript" customStyle={customStyle}>
              {snippet}
            </StorybookSyntaxHighlighter>
          )}

          {toggle && !open && (
            <StorybookSyntaxHighlighter language="typescript" customStyle={customStyle}>
              {`  // ...`}
            </StorybookSyntaxHighlighter>
          )}

          {toggle && open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <StorybookSyntaxHighlighter
                language="typescript"
                customStyle={customStyle}
                codeTagProps={{ style: { paddingLeft: '15px' } }}
              >
                {snippet}
              </StorybookSyntaxHighlighter>
            </motion.div>
          )}
        </Fragment>
      ))}
    </SnippetWrapper>
  );
});
