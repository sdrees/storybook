import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { WithCounter } from './button.stories';

describe('module story embedding', () => {
  it('should test story state', () => {
    const comp = render(<WithCounter />);
    fireEvent.click(comp.getByText('Testing: 0'));
    expect(comp.getByText('Testing: 1')).toBeTruthy();
  });
});
