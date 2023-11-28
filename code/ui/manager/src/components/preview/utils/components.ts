import { styled } from '@storybook/theming';
import { Link } from '@storybook/router';

export const PreviewContainer = styled.main({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
});

export const FrameWrap = styled.div({
  overflow: 'auto',
  width: '100%',
  zIndex: 3,
  background: 'transparent',
  flex: 1,
});

export const UnstyledLink = styled(Link)({
  color: 'inherit',
  textDecoration: 'inherit',
  display: 'inline-block',
});

export const DesktopOnly = styled.span({
  // Hides full screen icon at mobile breakpoint defined in app.js
  '@media (max-width: 599px)': {
    display: 'none',
  },
});

export const IframeWrapper = styled.div(({ theme }) => ({
  alignContent: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  justifyItems: 'center',
  overflow: 'auto',

  display: 'grid',
  gridTemplateColumns: '100%',
  gridTemplateRows: '100%',

  position: 'relative',
  width: '100%',
  height: '100%',
}));

export const LoaderWrapper = styled.div(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  background: theme.background.preview,
  zIndex: 1,
}));
