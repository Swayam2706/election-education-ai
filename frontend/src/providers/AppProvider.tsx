// Enterprise Application Provider

import React, { ReactNode, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppErrorBoundary } from '../components/ErrorBoundary';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from './ThemeProvider';
import { PageLoading } from '../components/Loading';
import { queryClient } from '../lib/react-query';

interface AppProviderProps {
  children: ReactNode;
}

const toastConfig = {
  position: 'top-right' as const,
  toastOptions: {
    duration: 4000,
    style: {
      background: '#363636',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '14px',
    },
    success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
  },
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<PageLoading message="Initializing application..." />}>
              {children}
            </Suspense>
            <Toaster {...toastConfig} />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default AppProvider;
