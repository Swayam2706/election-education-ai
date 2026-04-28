// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder (needed for Firebase)
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'stream/web';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
global.ReadableStream = ReadableStream as any;

// Mock useReducedMotion hook BEFORE Framer Motion
jest.mock('./animations/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
  useMotionSafe: () => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
    getVariants: (normalVariants: any) => normalVariants,
    getTransition: (normalTransition: any) => normalTransition,
  }),
  useAnimationConfig: () => ({
    prefersReducedMotion: false,
    shouldAnimate: true,
    reducedMotionVariants: {},
    fadeIn: (variants: any) => variants,
    slideUp: (variants: any) => variants,
    scaleIn: (variants: any) => variants,
    fastTransition: (transition: any) => transition,
    noTransition: () => ({}),
  }),
}));

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

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
    onAuthStateChanged: jest.fn(),
  })),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Call callback immediately with null user
    callback(null);
    // Return unsubscribe function
    return jest.fn();
  }),
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
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
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((callback: any) => {
      callback(null);
      return jest.fn();
    }),
  },
  googleProvider: {},
  analytics: null,
  performance: null,
}));
