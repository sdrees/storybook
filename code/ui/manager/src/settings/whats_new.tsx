import type { FC, ComponentProps } from 'react';
import React, { useEffect, useState, Fragment } from 'react';
import { styled } from '@storybook/theming';
import { Icons, Loader } from '@storybook/components';
import { useStorybookApi } from '@storybook/manager-api';

const Centered = styled.div({
  top: '50%',
  position: 'absolute',
  transform: 'translateY(-50%)',
  width: '100%',
  textAlign: 'center',
});

const LoaderWrapper = styled.div({
  position: 'relative',
  height: '32px',
});

const Message = styled.div(({ theme }) => ({
  paddingTop: '12px',
  color: theme.textMutedColor,
  maxWidth: '295px',
  margin: '0 auto',
  fontSize: `${theme.typography.size.s1}px`,
  lineHeight: `16px`,
}));

const Iframe = styled.iframe<{ isLoaded: boolean }>(
  {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 0,
    margin: 0,
    padding: 0,
    width: '100%',
    height: '100%',
  },
  ({ isLoaded }) => ({ visibility: isLoaded ? 'visible' : 'hidden' })
);

const AlertIcon = styled(((props) => <Icons icon="alert" {...props} />) as FC<
  Omit<ComponentProps<typeof Icons>, 'icon'>
>)(({ theme }) => ({
  color: theme.textMutedColor,
  width: 32,
  height: 32,
  margin: '0 auto',
}));

const WhatsNewLoader: FC = () => (
  <Centered>
    <LoaderWrapper>
      <Loader />
    </LoaderWrapper>
    <Message>Loading...</Message>
  </Centered>
);

const MaxWaitTimeMessaging: FC = () => (
  <Centered>
    <AlertIcon />
    <Message>The page couldn't be loaded. Check your internet connection and try again.</Message>
  </Centered>
);

export interface WhatsNewProps {
  didHitMaxWaitTime: boolean;
  isLoaded: boolean;
  onLoad: () => void;
  url?: string;
}

const PureWhatsNewScreen: FC<WhatsNewProps> = ({ didHitMaxWaitTime, isLoaded, onLoad, url }) => (
  <Fragment>
    {!isLoaded && !didHitMaxWaitTime && <WhatsNewLoader />}
    {didHitMaxWaitTime ? (
      <MaxWaitTimeMessaging />
    ) : (
      <Iframe isLoaded={isLoaded} onLoad={onLoad} src={url} title={`What's new?`} />
    )}
  </Fragment>
);

const MAX_WAIT_TIME = 10000; // 10 seconds

const WhatsNewScreen: FC<Omit<WhatsNewProps, 'isLoaded' | 'onLoad' | 'didHitMaxWaitTime'>> = ({
  url,
}) => {
  const api = useStorybookApi();
  const [isLoaded, setLoaded] = useState(false);
  const [didHitMaxWaitTime, setDidHitMaxWaitTime] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => !isLoaded && setDidHitMaxWaitTime(true), MAX_WAIT_TIME);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <PureWhatsNewScreen
      didHitMaxWaitTime={didHitMaxWaitTime}
      isLoaded={isLoaded}
      onLoad={() => {
        api.whatsNewHasBeenRead();
        setLoaded(true);
      }}
      url={url}
    />
  );
};

export { WhatsNewScreen, PureWhatsNewScreen };
