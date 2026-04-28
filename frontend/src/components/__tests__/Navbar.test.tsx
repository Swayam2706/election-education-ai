import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../contexts/AuthContext';

const MockedNavbar = () => (
  <BrowserRouter>
    <AuthProvider>
      <Navbar />
    </AuthProvider>
  </BrowserRouter>
);

describe('Navbar', () => {
  it('renders navigation links', () => {
    render(<MockedNavbar />);
    
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/learn/i)).toBeInTheDocument();
    expect(screen.getByText(/quiz/i)).toBeInTheDocument();
  });

  it('has accessible navigation role', () => {
    const { container } = render(<MockedNavbar />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    render(<MockedNavbar />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('is keyboard navigable', () => {
    render(<MockedNavbar />);
    const firstLink = screen.getByText(/home/i);
    firstLink.focus();
    expect(firstLink).toHaveFocus();
  });
});
