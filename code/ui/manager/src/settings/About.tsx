import type { FC } from 'react';
import React from 'react';
import { styled } from '@storybook/theming';

import { Button as BaseButton, Link, StorybookIcon } from '@storybook/components';
import { DocumentIcon, GithubIcon } from '@storybook/icons';
import { UpgradeBlock } from '../components/upgrade/UpgradeBlock';

const Header = styled.header(({ theme }) => ({
  marginBottom: 32,
  fontSize: theme.typography.size.l2,
  color: theme.base === 'light' ? theme.color.darkest : theme.color.lightest,
  fontWeight: theme.typography.weight.bold,
  alignItems: 'center',
  display: 'flex',

  '> svg': {
    height: 48,
    width: 'auto',
    marginRight: 8,
  },
}));

const Container = styled.div({
  display: `flex`,
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100% - 40px)',
  flexDirection: 'column',
});

const Footer = styled.div(({ theme }) => ({
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: theme.base === 'light' ? theme.color.dark : theme.color.lightest,
  fontWeight: theme.typography.weight.regular,
  fontSize: theme.typography.size.s2,
}));

const SquareButton = styled(BaseButton)(({ theme }) => ({
  '&&': {
    borderRadius: 4,
    fontSize: '13px',
    lineHeight: '14px',
    color: theme.base === 'light' ? theme.color.darker : theme.color.lightest,
    padding: '9px 12px',
    svg: {
      marginRight: 6,
    },
  },
}));

const StyledLink = styled(Link as any)(({ theme }) => ({
  '&&': {
    fontWeight: theme.typography.weight.bold,
    color: theme.base === 'light' ? theme.color.dark : theme.color.light,
  },
  '&:hover': {
    color: theme.base === 'light' ? theme.color.darkest : theme.color.lightest,
  },
}));

const AboutScreen: FC<{ onNavigateToWhatsNew?: () => void }> = ({ onNavigateToWhatsNew }) => {
  return (
    <Container>
      <div style={{ flex: '1' }} />
      <Header>
        <StorybookIcon /> Storybook
      </Header>
      <UpgradeBlock onNavigateToWhatsNew={onNavigateToWhatsNew} />
      <div style={{ flex: '1.2' }} />
      <Footer>
        <div style={{ marginBottom: 12 }}>
          <SquareButton asChild style={{ marginRight: 12 }}>
            <a href="https://github.com/storybookjs/storybook">
              <GithubIcon />
              GitHub
            </a>
          </SquareButton>

          <SquareButton asChild>
            <a href="https://storybook.js.org/docs">
              <DocumentIcon style={{ display: 'inline', marginRight: 5 }} />
              Documentation
            </a>
          </SquareButton>
        </div>
        <div>
          Open source software maintained by{' '}
          <StyledLink href="https://www.chromatic.com/">Chromatic</StyledLink> and the{' '}
          <StyledLink href="https://github.com/storybookjs/storybook/graphs/contributors">
            Storybook Community
          </StyledLink>
        </div>
      </Footer>
    </Container>
  );
};

export { AboutScreen };
