import type { FC, PropsWithChildren } from 'react';
import React, { createContext, useContext, useState } from 'react';
import { useMediaQuery } from '../hooks/useMedia';
import { BREAKPOINT } from '../../constants';

type LayoutContextType = {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileAboutOpen: boolean;
  setMobileAboutOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobilePanelOpen: boolean;
  setMobilePanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDesktop: boolean;
  isMobile: boolean;
};

const LayoutContext = createContext<LayoutContextType>({
  isMobileMenuOpen: false,
  setMobileMenuOpen: () => {},
  isMobileAboutOpen: false,
  setMobileAboutOpen: () => {},
  isMobilePanelOpen: false,
  setMobilePanelOpen: () => {},
  isDesktop: false,
  isMobile: false,
});

export const LayoutProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [isMobilePanelOpen, setMobilePanelOpen] = useState(false);
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINT}px)`);
  const isMobile = !isDesktop;

  return (
    <LayoutContext.Provider
      value={{
        isMobileMenuOpen,
        setMobileMenuOpen,
        isMobileAboutOpen,
        setMobileAboutOpen,
        isMobilePanelOpen,
        setMobilePanelOpen,
        isDesktop,
        isMobile,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
