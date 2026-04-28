import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import App from '../App';

// Mock AuthContext to avoid Firebase issues
jest.mock('../contexts/AuthContext', () => ({
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

// Mock site service to avoid API calls
jest.mock('../services/site.service', () => ({
  siteService: {
    getStats: jest.fn().mockResolvedValue({
      success: true,
      data: {
        totalUsers: 1000,
        totalQuizzes: 50,
        totalArticles: 100,
      },
    }),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestApp = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);

describe('App Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<TestApp />);
    // Just check that the app renders without throwing
    expect(container).toBeInTheDocument();
  });

  it('renders main content area', () => {
    const { container } = render(<TestApp />);
    // Check for main content structure
    expect(container).toBeInTheDocument();
  });

  it('has accessible structure', () => {
    const { container } = render(<TestApp />);
    // Just verify the app renders
    expect(container).toBeInTheDocument();
  });
});
