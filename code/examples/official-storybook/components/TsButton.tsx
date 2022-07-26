import React, { FC } from 'react';

export type Type = 'default' | 'action';

interface Props {
  /**
   * Click event handler
   * @default null
   */
  onClick?: () => void;

  /**
   * Button type yo
   */
  type?: Type;
}

const Button: FC<Props> = ({ children, type = 'default', onClick }) => {
  return (
    <button type="button" onClick={onClick}>
      {type}: {children}
    </button>
  );
};

export default Button;
