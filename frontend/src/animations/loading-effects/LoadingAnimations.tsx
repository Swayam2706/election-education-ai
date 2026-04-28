/**
 * Loading Animation Components
 * Premium loading states and skeleton animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../hooks/useReducedMotion';

// ─── Skeleton Loader ───
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full aspect-square';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
      default:
        return 'rounded';
    }
  };

  const shimmerVariants = shouldAnimate ? {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  } : {};

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            animate={shouldAnimate ? 'shimmer' : ''}
            variants={shimmerVariants}
            className={cn(
              'bg-gradient-to-r from-muted via-muted/50 to-muted',
              getVariantClasses(),
              i === lines - 1 && 'w-3/4' // Last line shorter
            )}
            style={{
              width: width,
              height: height,
              backgroundSize: '200% 100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      animate={shouldAnimate ? 'shimmer' : ''}
      variants={shimmerVariants}
      className={cn(
        'bg-gradient-to-r from-muted via-muted/50 to-muted',
        getVariantClasses(),
        className
      )}
      style={{
        width: width,
        height: height,
        backgroundSize: '200% 100%'
      }}
    />
  );
};

// ─── Spinner ───
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'primary'
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'md':
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'secondary':
        return 'text-secondary';
      case 'muted':
        return 'text-muted-foreground';
      case 'primary':
      default:
        return 'text-primary';
    }
  };

  return (
    <motion.svg
      animate={shouldAnimate ? { rotate: 360 } : {}}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(getSizeClasses(), getColorClasses(), className)}
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
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </motion.svg>
  );
};

// ─── Dots Loader ───
interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({ 
  size = 'md', 
  className 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-1 h-1';
      case 'lg':
        return 'w-3 h-3';
      case 'md':
      default:
        return 'w-2 h-2';
    }
  };

  const dotVariants = shouldAnimate ? {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  } : {};

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={dotVariants}
          animate="animate"
          transition={{ delay: i * 0.1 }}
          className={cn(
            'bg-primary rounded-full',
            getSizeClasses()
          )}
        />
      ))}
    </div>
  );
};

// ─── Progress Bar ───
interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className,
  showLabel = false,
  animated = true
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const progressVariants = shouldAnimate && animated ? {
    hidden: { scaleX: 0, originX: 0 },
    show: { 
      scaleX: progress / 100,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  } : {};

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          initial="hidden"
          animate="show"
          variants={progressVariants}
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          style={!shouldAnimate ? { width: `${progress}%` } : {}}
        />
      </div>
    </div>
  );
};

// ─── Pulse Loader ───
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({ 
  size = 'md', 
  className 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-16 h-16';
      case 'md':
      default:
        return 'w-12 h-12';
    }
  };

  const pulseVariants = shouldAnimate ? {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  } : {};

  return (
    <motion.div
      variants={pulseVariants}
      animate="pulse"
      className={cn(
        'bg-primary rounded-full',
        getSizeClasses(),
        className
      )}
    />
  );
};

// ─── Typing Indicator ───
interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
  const { shouldAnimate } = useAnimationConfig();

  const dotVariants = shouldAnimate ? {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  } : {};

  return (
    <div className={cn('flex items-center gap-1 px-3 py-2', className)}>
      <span className="text-sm text-muted-foreground mr-2">AI is typing</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          variants={dotVariants}
          animate="animate"
          transition={{ delay: i * 0.2 }}
          className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
        />
      ))}
    </div>
  );
};

// ─── Card Skeleton ───
interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  className,
  showAvatar = false,
  lines = 3
}) => {
  return (
    <div className={cn('glass-card rounded-2xl p-6', className)}>
      {showAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" className="mb-1" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      )}
      
      <Skeleton variant="text" lines={lines} className="mb-4" />
      
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={60} height={32} />
      </div>
    </div>
  );
};

// ─── Loading Screen ───
interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  className 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const containerVariants = shouldAnimate ? {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  } : {};

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50',
        className
      )}
    >
      <div className="text-center">
        <Spinner size="lg" className="mb-4 mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
};

// ─── Shimmer Effect ───
interface ShimmerEffectProps {
  className?: string;
  children: React.ReactNode;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({ 
  className, 
  children 
}) => {
  const { shouldAnimate } = useAnimationConfig();

  const shimmerVariants = shouldAnimate ? {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  } : {};

  return (
    <motion.div
      animate="shimmer"
      variants={shimmerVariants}
      className={cn(
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        className
      )}
      style={{ backgroundSize: '200% 100%' }}
    >
      {children}
    </motion.div>
  );
};