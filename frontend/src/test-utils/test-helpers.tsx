/**
 * Test Utilities and Helpers
 * Comprehensive testing utilities for unit and integration tests
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';

/**
 * Creates a new QueryClient for testing
 * @returns QueryClient instance
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render function with all providers
 * @param ui - React element to render
 * @param options - Render options
 * @returns Render result
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  _id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  stats: {
    quizzesCompleted: 5,
    averageScore: 85,
    totalTimeSpent: 3600,
    chatMessages: 10,
  },
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

/**
 * Mock admin user data for testing
 */
export const mockAdminUser = {
  ...mockUser,
  _id: 'test-admin-id',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'ADMIN',
};

/**
 * Mock quiz data for testing
 */
export const mockQuiz = {
  _id: 'test-quiz-id',
  title: 'Test Quiz',
  description: 'A test quiz for unit testing',
  category: 'voting-basics',
  difficulty: 'beginner',
  questions: [
    {
      _id: 'q1',
      question: 'What is the minimum voting age?',
      options: ['16', '18', '21', '25'],
      correctAnswer: 1,
      explanation: 'The minimum voting age is 18 years old.',
    },
    {
      _id: 'q2',
      question: 'What document do you need to vote?',
      options: ['Passport', 'Driver License', 'Voter ID', 'Birth Certificate'],
      correctAnswer: 2,
      explanation: 'You need a valid Voter ID to cast your vote.',
    },
  ],
  timeLimit: 600,
  passingScore: 70,
  isActive: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

/**
 * Mock content data for testing
 */
export const mockContent = {
  _id: 'test-content-id',
  title: 'Test Content',
  slug: 'test-content',
  description: 'Test content description',
  content: 'This is test content for unit testing.',
  category: 'voting-basics',
  tags: ['test', 'voting'],
  author: mockUser,
  isPublished: true,
  views: 100,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

/**
 * Mock timeline event data for testing
 */
export const mockTimelineEvent = {
  _id: 'test-event-id',
  title: 'Test Event',
  description: 'Test event description',
  date: new Date('2024-06-01').toISOString(),
  phase: 'registration',
  icon: 'calendar',
  isCompleted: false,
  order: 1,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

/**
 * Mock FAQ data for testing
 */
export const mockFAQ = {
  _id: 'test-faq-id',
  question: 'Test Question?',
  answer: 'Test answer to the question.',
  category: 'general',
  order: 1,
  isPublished: true,
  views: 50,
  helpful: 10,
  notHelpful: 2,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

/**
 * Mock API response wrapper
 * @param data - Response data
 * @param success - Success status
 * @returns API response object
 */
export function mockApiResponse<T>(data: T, success = true) {
  return {
    success,
    data,
  };
}

/**
 * Mock API error response
 * @param message - Error message
 * @param code - Error code
 * @returns API error response
 */
export function mockApiError(message = 'Test error', code = 'TEST_ERROR') {
  return {
    success: false,
    error: {
      message,
      code,
    },
  };
}

/**
 * Wait for async operations
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

/**
 * Setup mock localStorage
 */
export function setupMockLocalStorage(): void {
  const mockLocalStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

/**
 * Mock fetch for testing
 * @param response - Response data
 * @param status - HTTP status code
 * @returns Mock fetch function
 */
export function mockFetch(response: unknown, status = 200) {
  return jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
    } as Response)
  );
}

/**
 * Mock console methods for testing
 */
export function mockConsole() {
  const originalConsole = { ...console };

  beforeEach(() => {
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    };
  });

  afterEach(() => {
    global.console = originalConsole;
  });
}

/**
 * Create mock intersection observer
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as unknown as typeof IntersectionObserver;
}

/**
 * Create mock resize observer
 */
export function mockResizeObserver() {
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
}

/**
 * Create mock match media
 */
export function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Setup all common mocks
 */
export function setupCommonMocks(): void {
  setupMockLocalStorage();
  mockIntersectionObserver();
  mockResizeObserver();
  mockMatchMedia();
}

/**
 * Cleanup after tests
 */
export function cleanup(): void {
  jest.clearAllMocks();
  jest.restoreAllMocks();
}

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
