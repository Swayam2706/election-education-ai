import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimatedButton } from '../animations/motion-components/AnimatedButton';

describe('AnimatedButton', () => {
  it('renders button with text', () => {
    render(<AnimatedButton>Click me</AnimatedButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<AnimatedButton onClick={handleClick}>Click me</AnimatedButton>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<AnimatedButton disabled>Click me</AnimatedButton>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });

  it('has correct accessibility attributes', () => {
    render(<AnimatedButton aria-label="Test button">Click me</AnimatedButton>);
    expect(screen.getByLabelText('Test button')).toBeInTheDocument();
  });
});
