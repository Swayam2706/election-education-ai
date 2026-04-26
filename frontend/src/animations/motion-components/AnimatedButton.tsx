/**
 * Animated Button Components
 * Premium button animations with micro-interactions
 */

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../hooks/useReducedMotion';
import { buttonTap, buttonPulse, iconBounce } from '../variants';
import { transitions } from '../transitions';

// ─── Base Animated Button ───
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  effect?: 'tap' | 'pulse' | 'glow' | 'none';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    variant = 'default', 
    size = 'md', 
    effect = 'tap',
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const getVariants = () => {
      if (!shouldAnimate || disabled || loading) return {};
      
      switch (effect) {
        case 'tap':
          return buttonTap;
        case 'pulse':
          return buttonPulse;
        case 'glow':
          return {
            rest: { 
              boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)',
              transition: transitions.button
            },
            hover: { 
              boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.15)',
              transition: transitions.button
            }
          };
        case 'none':
        default:
          return {};
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm h-8';
        case 'lg':
          return 'px-8 py-3 text-base h-12';
        case 'md':
        default:
          return 'px-4 py-2 text-sm h-10';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md';
        case 'secondary':
          return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
        case 'outline':
          return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
        case 'ghost':
          return 'hover:bg-accent hover:text-accent-foreground';
        case 'default':
        default:
          return 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground border border-input';
      }
    };

    const buttonVariants = getVariants();

    const LoadingSpinner = () => (
      <motion.svg
        className="w-4 h-4"
        animate={{ rotate: shouldAnimate ? 360 : 0 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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

    const IconWrapper = ({ children }: { children: React.ReactNode }) => (
      <motion.span
        variants={shouldAnimate ? iconBounce : {}}
        className="inline-flex"
      >
        {children}
      </motion.span>
    );

    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover={!disabled && !loading ? "hover" : "rest"}
        whileTap={!disabled && !loading ? "tap" : "rest"}
        variants={buttonVariants}
        transition={transitions.button}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          fullWidth && 'w-full',
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <IconWrapper>{icon}</IconWrapper>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <IconWrapper>{icon}</IconWrapper>
            )}
          </>
        )}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// ─── CTA Button ───
interface CTAButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
  ({ children, icon, loading = false, className, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const variants = shouldAnimate ? {
      rest: { 
        scale: 1,
        boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.2)',
        transition: transitions.button
      },
      hover: { 
        scale: 1.02,
        boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.3)',
        transition: transitions.button
      },
      tap: { 
        scale: 0.98,
        transition: { duration: 0.1 }
      }
    } : {};

    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover={!loading ? "hover" : "rest"}
        whileTap={!loading ? "tap" : "rest"}
        variants={variants}
        className={cn(
          'btn-premium h-12 px-8 text-base gap-2 rounded-xl relative overflow-hidden',
          className
        )}
        disabled={loading}
        {...props}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary"
          animate={shouldAnimate ? {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 100%' }}
        />
        
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <motion.svg
              className="w-4 h-4"
              animate={{ rotate: shouldAnimate ? 360 : 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
          ) : (
            <>
              {children}
              {icon && (
                <motion.span
                  animate={shouldAnimate ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {icon}
                </motion.span>
              )}
            </>
          )}
        </span>
      </motion.button>
    );
  }
);

CTAButton.displayName = 'CTAButton';

// ─── Icon Button ───
interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'default', className, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'w-8 h-8';
        case 'lg':
          return 'w-12 h-12';
        case 'md':
        default:
          return 'w-10 h-10';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-primary text-primary-foreground hover:bg-primary/90';
        case 'ghost':
          return 'hover:bg-accent hover:text-accent-foreground';
        case 'default':
        default:
          return 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground border border-input';
      }
    };

    const variants = shouldAnimate ? {
      rest: { 
        scale: 1,
        rotate: 0,
        transition: transitions.button
      },
      hover: { 
        scale: 1.05,
        transition: transitions.button
      },
      tap: { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }
    } : {};

    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={variants}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          getSizeClasses(),
          getVariantClasses(),
          className
        )}
        {...props}
      >
        <motion.span
          variants={shouldAnimate ? iconBounce : {}}
        >
          {icon}
        </motion.span>
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ─── Floating Action Button ───
interface FABProps extends HTMLMotionProps<'button'> {
  icon: React.ReactNode;
  children?: React.ReactNode;
  expanded?: boolean;
}

export const FloatingActionButton = forwardRef<HTMLButtonElement, FABProps>(
  ({ icon, children, expanded = false, className, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    
    const variants = shouldAnimate ? {
      rest: { 
        scale: 1,
        boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
        transition: transitions.button
      },
      hover: { 
        scale: 1.05,
        boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
        transition: transitions.button
      },
      tap: { 
        scale: 0.95,
        transition: { duration: 0.1 }
      }
    } : {};

    return (
      <motion.button
        ref={ref}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={variants}
        layout={shouldAnimate}
        className={cn(
          'fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full shadow-lg z-50 flex items-center gap-3 transition-colors',
          expanded ? 'px-6 py-4' : 'w-14 h-14 justify-center',
          className
        )}
        {...props}
      >
        <motion.span
          variants={shouldAnimate ? iconBounce : {}}
        >
          {icon}
        </motion.span>
        
        {expanded && children && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="font-medium whitespace-nowrap"
          >
            {children}
          </motion.span>
        )}
      </motion.button>
    );
  }
);

FloatingActionButton.displayName = 'FloatingActionButton';

// ─── Primary Button (alias) ───
export const PrimaryButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (props, ref) => <AnimatedButton ref={ref} variant="primary" {...props} />
);
PrimaryButton.displayName = 'PrimaryButton';
