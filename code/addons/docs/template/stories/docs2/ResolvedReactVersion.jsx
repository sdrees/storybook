import React, { version as reactVersion } from 'react';
import { version as reactDomVersion } from 'react-dom';

export const ResolvedReactVersion = () => {
  return (
    <>
      <p>
        <code>react</code>: <code data-testid="component-react">{reactVersion}</code>
      </p>
      <p>
        <code>react-dom</code>: <code data-testid="component-react-dom">{reactDomVersion}</code>
      </p>
    </>
  );
};
