// Lazy loading utilities for code splitting
import { lazy, ComponentType } from 'react';

// Retry logic for failed lazy loads
const retry = (fn: () => Promise<any>, retriesLeft = 3, interval = 1000): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }
          retry(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// Enhanced lazy with retry
export const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(() => retry(componentImport));
};

// Preload component
export const preloadComponent = (componentImport: () => Promise<any>) => {
  const component = lazy(componentImport);
  componentImport();
  return component;
};

// Lazy load routes
export const lazyLoadRoutes = {
  Home: lazyWithRetry(() => import('../pages/Home')),
  Dashboard: lazyWithRetry(() => import('../pages/Dashboard')),
  Chat: lazyWithRetry(() => import('../pages/Chat')),
  Quiz: lazyWithRetry(() => import('../pages/Quiz')),
  Learn: lazyWithRetry(() => import('../pages/Learn')),
  Timeline: lazyWithRetry(() => import('../pages/Timeline')),
  FAQ: lazyWithRetry(() => import('../pages/FAQ')),
  Eligibility: lazyWithRetry(() => import('../pages/Eligibility')),
  About: lazyWithRetry(() => import('../pages/About')),
  Contact: lazyWithRetry(() => import('../pages/Contact')),
};
