import type { FC } from 'react';
import React from 'react';

import { Button } from '../../components/Button/Button';
import { Modal } from '../../components/Modal/Modal';
import { StorybookLogo } from './StorybookLogo';
import {
  ModalContentWrapper,
  SkipButton,
  StyledIcon,
  Title,
  Description,
  Background,
  Circle1,
  Circle2,
  Circle3,
  TopContent,
} from './WelcomeModal.styled';

interface WelcomeModalProps {
  onProceed: () => void;
  skipOnboarding: () => void;
}

export const WelcomeModal: FC<WelcomeModalProps> = ({ onProceed, skipOnboarding }) => {
  return (
    <div style={{ zIndex: 10 }}>
      <Modal width={540} height={430} defaultOpen>
        {({ Close }) => (
          <ModalContentWrapper data-chromatic="ignore">
            <TopContent>
              <StorybookLogo />
              <Title>Welcome to Storybook</Title>
              <Description>
                Storybook helps you develop UI components faster. Learn the basics in a few simple
                steps.
              </Description>
              <Button style={{ marginTop: 4 }} onClick={onProceed}>
                Start your 3 minute tour
              </Button>
            </TopContent>
            <SkipButton onClick={skipOnboarding}>
              Skip tour
              <StyledIcon />
            </SkipButton>
            <Background>
              <Circle1 />
              <Circle2 />
              <Circle3 />
            </Background>
          </ModalContentWrapper>
        )}
      </Modal>
    </div>
  );
};
