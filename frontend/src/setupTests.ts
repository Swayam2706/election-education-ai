// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (needed for Firebase)
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;

// Mock Framer Motion completely
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  motion: new Proxy(
    {},
    {
      get: (_target, prop) => {
        // Return a component that renders the element with all props
        return jest.fn(({ children, ...props }) => {
          const React = require('react');
          return React.createElement(prop as string, props, children);
        });
      },
    }
  ),
  AnimatePresence: ({ children }: any) => children,
  useReducedMotion: () => false,
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn(),
  })),
  default: {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
    })),
  },
}));

// Mock window.matchMedia (for Framer Motion) - MUST return a valid MediaQueryList
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn((callback: (event: MediaQueryListEvent) => void) => {
        listeners.push(callback);
      }),
      removeListener: jest.fn((callback: (event: MediaQueryListEvent) => void) => {
        const index = listeners.indexOf(callback);
        if (index > -1) listeners.splice(index, 1);
      }),
      addEventListener: jest.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') listeners.push(callback);
      }),
      removeEventListener: jest.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
        if (event === 'change') {
          const index = listeners.indexOf(callback);
          if (index > -1) listeners.splice(index, 1);
        }
      }),
      dispatchEvent: jest.fn(),
    };
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock Firebase
jest.mock('./lib/firebase', () => ({
  auth: {},
  googleProvider: {},
  analytics: null,
  performance: null,
}));
