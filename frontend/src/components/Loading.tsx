// Enterprise Loading System

import React from 'react';
import { useUI } from '../store/useAppStore';

// Types
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

interface SkeletonProps {
  lines?: number;
  avatar?: boolean;
  className?: string;
}

// Size configurations
const sizeConfig = {
  sm: {
    spinner: 'w-4 h-4',
    text: 'text-sm',
    container: 'p-2',
  },
  md: {
    spinner: 'w-6 h-6',
    text: 'text-base',
    container: 'p-4',
  },
  lg: {
    spinner: 'w-8 h-8',
    text: 'text-lg',
    container: 'p-6',
  },
  xl: {
    spinner: 'w-12 h-12',
    text: 'text-xl',
    container: 'p-8',
  },
};

// Color configurations
const colorConfig = {
  primary: 'text-blue-600 dark:text-blue-400',
  secondary: 'text-gray-600 dark:text-gray-400',
  white: 'text-white',
  gray: 'text-gray-500 dark:text-gray-400',
};

// Spinner Component
const Spinner: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <svg
    className={`animate-spin ${size} ${color}`}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Dots Component
const Dots: React.FC<{ size: string; color: string }> = ({ size, color }) => {
  const dotSize = size.includes('w-4') ? 'w-2 h-2' : 
                  size.includes('w-6') ? 'w-3 h-3' :
                  size.includes('w-8') ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotSize} ${color} bg-current rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

// Pulse Component
const Pulse: React.FC<{ size: string; color: string }> = ({ size, color }) => (
  <div className={`${size} ${color} bg-current rounded-full animate-pulse`} />
);

// Main Loading Component
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  text,
  fullScreen = false,
  overlay = false,
  className = '',
}) => {
  const sizeClasses = sizeConfig[size];
  const colorClass = colorConfig[color];

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return <Dots size={sizeClasses.spinner} color={colorClass} />;
      case 'pulse':
        return <Pulse size={sizeClasses.spinner} color={colorClass} />;
      default:
        return <Spinner size={sizeClasses.spinner} color={colorClass} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${sizeClasses.container} ${className}`}>
      {renderLoadingIndicator()}
      {text && (
        <p className={`mt-2 ${sizeClasses.text} ${colorClass} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton Loading Component
export const Skeleton: React.FC<SkeletonProps> = ({
  lines = 3,
  avatar = false,
  className = '',
}) => (
  <div className={`animate-pulse ${className}`}>
    {avatar && (
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
        </div>
      </div>
    )}
    
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-300 dark:bg-gray-600 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  </div>
);

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
    <Skeleton lines={4} />
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}> = ({ items = 5, showAvatar = false, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <Skeleton lines={2} avatar={showAvatar} />
      </div>
    ))}
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
    {/* Header */}
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Page Loading Component
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <Loading size="lg" text={message} />
    </div>
  </div>
);

// Button Loading Component
export const ButtonLoading: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}> = ({ size = 'sm', color = 'white' }) => (
  <Loading size={size} variant="spinner" color={color} />
);

// Inline Loading Component
export const InlineLoading: React.FC<{ 
  text?: string;
  size?: 'sm' | 'md';
}> = ({ text = 'Loading...', size = 'sm' }) => (
  <div className="flex items-center space-x-2">
    <Loading size={size} variant="spinner" color="primary" />
    <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
  </div>
);

// Loading Overlay Hook
export const useLoadingOverlay = () => {
  const { setLoading } = useUI();

  const showLoading = (key: string) => setLoading(key, true);
  const hideLoading = (key: string) => setLoading(key, false);

  return { showLoading, hideLoading };
};

// Loading State Hook
export const useLoadingState = (key: string) => {
  const { loading } = useUI();
  return loading[key] || false;
};

// Suspense Fallback Components
export const SuspenseFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading component...' 
}) => (
  <div className="flex items-center justify-center p-8">
    <Loading size="md" text={message} />
  </div>
);

export const RouteSuspenseFallback: React.FC = () => (
  <div className="min-h-96 flex items-center justify-center">
    <Loading size="lg" text="Loading page..." />
  </div>
);

// Export all components
export default Loading;