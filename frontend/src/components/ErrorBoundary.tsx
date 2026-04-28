// Enterprise Error Boundary System

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import toast from 'react-hot-toast';

// Types
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// Error fallback components
const DefaultErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
        Something went wrong
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        We're sorry, but something unexpected happened. Please try again.
      </p>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
            Error Details
          </summary>
          <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
      
      <div className="flex space-x-3">
        <button
          onClick={resetErrorBoundary}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Try Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  </div>
);

const ChunkErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
        <svg
          className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Update Available
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        A new version of the application is available. Please refresh to get the latest updates.
      </p>
      
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Refresh Now
      </button>
    </div>
  </div>
);

const NetworkErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
        <svg
          className="w-6 h-6 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Connection Error
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Unable to connect to the server. Please check your internet connection and try again.
      </p>
      
      <button
        onClick={resetErrorBoundary}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

// Error classification
const classifyError = (error: Error): 'chunk' | 'network' | 'default' => {
  const message = error.message.toLowerCase();
  
  if (message.includes('loading chunk') || message.includes('loading css chunk')) {
    return 'chunk';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'network';
  }
  
  return 'default';
};

// Error logging
const logError = (error: Error, errorInfo: ErrorInfo, context?: string) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', context);
    console.groupEnd();
  }

  // Send to error tracking service in production
  if (process.env.NODE_ENV === 'production') {
    // Error tracking service integration point
    // Example: Sentry.captureException(error, { extra: errorData });
  }

  // Show user-friendly toast
  toast.error('Something went wrong. Our team has been notified.');
};

// Main Error Boundary Component
export const AppErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  resetKeys = [],
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logError(error, errorInfo, 'AppErrorBoundary');
    onError?.(error, errorInfo);
  };

  const ErrorFallback = ({ error, resetErrorBoundary }: any) => {
    if (fallback) {
      return fallback;
    }

    const errorType = classifyError(error);
    
    switch (errorType) {
      case 'chunk':
        return <ChunkErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
      case 'network':
        return <NetworkErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
      default:
        return <DefaultErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Route-level Error Boundary
export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="min-h-96 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Page Error
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This page encountered an error. Please try refreshing or go back.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => logError(error as Error, errorInfo, 'RouteErrorBoundary')}
    >
      {children}
    </ReactErrorBoundary>
  );
};

// Component-level Error Boundary
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName?: string;
}> = ({ children, componentName }) => {
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-red-600 dark:text-red-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
          Component Error
        </h4>
      </div>
      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
        {componentName ? `The ${componentName} component` : 'This component'} encountered an error.
      </p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => 
        logError(error as Error, errorInfo, `ComponentErrorBoundary:${componentName}`)
      }
    >
      {children}
    </ReactErrorBoundary>
  );
};

// HOC for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary componentName={componentName || Component.displayName || Component.name}>
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default AppErrorBoundary;