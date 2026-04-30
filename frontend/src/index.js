/**
 * Application Entry Point
 * Initializes React application with performance monitoring
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';

import './index.css';
import App from './App';
import { queryClient } from './lib/react-query';
import { measureWebVitals } from './monitoring/performance';
import { logger } from './utils/logger';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

/**
 * Global error fallback component
 */
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Application Error
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Something went wrong. Please try refreshing the page.
        </p>
        <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto mb-4">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

/**
 * Error handler for global errors
 */
function handleError(error, errorInfo) {
  logger.error('Application Error', { error, errorInfo });
  
  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
}

/**
 * Initialize application
 */
function initializeApp() {
  const root = ReactDOM.createRoot(document.getElementById('root'));

  root.render(
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
          )}
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Initialize app
initializeApp();

// Measure Web Vitals
if (typeof window !== 'undefined') {
  measureWebVitals();
}

// Register service worker for PWA capabilities
serviceWorkerRegistration.register({
  onSuccess: () => {
    logger.info('Service worker registered successfully');
  },
  onUpdate: (registration) => {
    logger.info('New service worker available');
    
    // Notify user about update
    if (window.confirm('New version available! Reload to update?')) {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    }
  },
});

// Log application start
logger.info('Application initialized', {
  version: '2.0.0',
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
});
