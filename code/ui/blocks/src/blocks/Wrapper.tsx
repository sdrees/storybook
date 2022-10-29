import type { FC } from 'react';
import React from 'react';

export const Wrapper: FC = ({ children }) => (
  <div style={{ fontFamily: 'sans-serif' }}>{children}</div>
);
