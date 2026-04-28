import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('renders input field', () => {
    render(
      <ChatInput
        value=""
        onChange={jest.fn()}
        onSubmit={jest.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(
      <ChatInput
        value=""
        onChange={handleChange}
        onSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' },
    });

    expect(handleChange).toHaveBeenCalledWith('Hello');
  });

  it('calls onSubmit when clicking send button', () => {
    const handleSubmit = jest.fn();
    render(
      <ChatInput
        value="Hello"
        onChange={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByLabelText(/send message/i));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('calls onSubmit when pressing Enter', () => {
    const handleSubmit = jest.fn();
    render(
      <ChatInput
        value="Hello"
        onChange={jest.fn()}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.keyPress(screen.getByRole('textbox'), {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });

    expect(handleSubmit).toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <ChatInput
        value=""
        onChange={jest.fn()}
        onSubmit={jest.fn()}
        disabled
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows loading state', () => {
    render(
      <ChatInput
        value=""
        onChange={jest.fn()}
        onSubmit={jest.fn()}
        loading
      />
    );

    expect(screen.getByLabelText(/sending message/i)).toBeInTheDocument();
  });
});
