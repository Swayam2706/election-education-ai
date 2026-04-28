import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  const userMessage = {
    id: '1',
    role: 'USER' as const,
    content: 'Hello',
    createdAt: new Date().toISOString(),
  };

  const assistantMessage = {
    id: '2',
    role: 'ASSISTANT' as const,
    content: 'Hi there',
    createdAt: new Date().toISOString(),
  };

  it('renders user message correctly', () => {
    render(<ChatMessage message={userMessage} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={assistantMessage} />);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('displays timestamp', () => {
    render(<ChatMessage message={userMessage} />);
    const time = new Date(userMessage.createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    expect(screen.getByText(time)).toBeInTheDocument();
  });

  it('shows error styling for error messages', () => {
    const errorMessage = {
      ...assistantMessage,
      isError: true,
    };
    const { container } = render(<ChatMessage message={errorMessage} />);
    expect(container.querySelector('.bg-destructive\\/10')).toBeInTheDocument();
  });
});
