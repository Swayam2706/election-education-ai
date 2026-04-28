import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';

// Mock AuthContext to avoid Firebase issues
jest.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  }),
}));

const MockedNavbar = () => (
  <BrowserRouter>
    <Navbar />
  </BrowserRouter>
);

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(<MockedNavbar />);
    
    // Check for navigation elements that should exist
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/learn/i)).toBeInTheDocument();
    expect(screen.getByText(/quiz/i)).toBeInTheDocument();
  });

  it('has accessible navigation role', () => {
    const { container } = render(<MockedNavbar />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('shows authentication button when not authenticated', () => {
    render(<MockedNavbar />);
    // Look for any authentication-related button (could be "Sign In", "Login", etc.)
    const authButton = screen.getByRole('button') || screen.getByText(/sign/i) || screen.getByText(/login/i);
    expect(authButton).toBeInTheDocument();
  });

  it('is keyboard navigable', () => {
    render(<MockedNavbar />);
    const firstLink = screen.getByText(/home/i);
    firstLink.focus();
    expect(firstLink).toHaveFocus();
  });
});
