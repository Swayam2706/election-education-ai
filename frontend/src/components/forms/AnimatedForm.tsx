/**
 * Animated Form Components
 * Premium form elements with smooth animations and micro-interactions
 */

import React, { useState, forwardRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAnimationConfig } from '../../animations/hooks/useReducedMotion';
import { inputFocus, errorShake, successPop } from '../../animations/variants';
import { transitions } from '../../animations/transitions';

// ─── Animated Input ───
interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, success, icon, helperText, className, type = 'text', ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { shouldAnimate } = useAnimationConfig();
    const id = useId();

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasValue = props.value || props.defaultValue;

    const inputVariants = shouldAnimate ? {
      rest: {
        scale: 1,
        borderColor: error ? 'rgb(239 68 68)' : 'hsl(var(--border))',
        transition: transitions.inputFocus
      },
      focus: {
        scale: 1.01,
        borderColor: error ? 'rgb(239 68 68)' : 'hsl(var(--primary))',
        transition: transitions.inputFocus
      }
    } : {};

    const labelVariants = shouldAnimate ? {
      rest: {
        y: 0,
        scale: 1,
        color: 'hsl(var(--muted-foreground))',
        transition: transitions.inputFocus
      },
      focus: {
        y: -24,
        scale: 0.85,
        color: error ? 'rgb(239 68 68)' : 'hsl(var(--primary))',
        transition: transitions.inputFocus
      }
    } : {};

    const shouldFloatLabel = isFocused || hasValue;

    return (
      <div className="relative">
        {/* Input Container */}
        <motion.div
          variants={inputVariants}
          animate={isFocused ? 'focus' : 'rest'}
          className="relative"
        >
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full px-4 py-3 bg-background border rounded-xl text-sm transition-all duration-200 focus:outline-none',
              icon && 'pl-10',
              isPassword && 'pr-10',
              error && 'border-destructive ring-2 ring-destructive/20',
              success && 'border-green-500 ring-2 ring-green-500/20',
              !error && !success && 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          {label && (
            <motion.label
              htmlFor={id}
              variants={labelVariants}
              animate={shouldFloatLabel ? 'focus' : 'rest'}
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none origin-left',
                icon && 'left-10'
              )}
            >
              {label}
            </motion.label>
          )}

          {/* Password Toggle */}
          {isPassword && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              whileHover={shouldAnimate ? { scale: 1.1 } : {}}
              whileTap={shouldAnimate ? { scale: 0.9 } : {}}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
          )}

          {/* Success Icon */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              variants={shouldAnimate ? successPop : {}}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>

        {/* Helper Text / Error */}
        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transitions.validation}
              className={cn(
                'mt-2 text-sm flex items-center gap-1',
                error ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {error && <AlertCircle className="w-3 h-3" />}
              {error || helperText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

// ─── Animated Textarea ───
interface AnimatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
}

export const AnimatedTextarea = forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({ label, error, success, helperText, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const { shouldAnimate } = useAnimationConfig();
    const id = useId();

    const hasValue = props.value || props.defaultValue;
    const shouldFloatLabel = isFocused || hasValue;

    const textareaVariants = shouldAnimate ? {
      rest: {
        scale: 1,
        borderColor: error ? 'rgb(239 68 68)' : 'hsl(var(--border))',
        transition: transitions.inputFocus
      },
      focus: {
        scale: 1.01,
        borderColor: error ? 'rgb(239 68 68)' : 'hsl(var(--primary))',
        transition: transitions.inputFocus
      }
    } : {};

    const labelVariants = shouldAnimate ? {
      rest: {
        y: 0,
        scale: 1,
        color: 'hsl(var(--muted-foreground))',
        transition: transitions.inputFocus
      },
      focus: {
        y: -24,
        scale: 0.85,
        color: error ? 'rgb(239 68 68)' : 'hsl(var(--primary))',
        transition: transitions.inputFocus
      }
    } : {};

    return (
      <div className="relative">
        <motion.div
          variants={textareaVariants}
          animate={isFocused ? 'focus' : 'rest'}
          className="relative"
        >
          <textarea
            ref={ref}
            id={id}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full px-4 py-3 bg-background border rounded-xl text-sm transition-all duration-200 focus:outline-none resize-none',
              error && 'border-destructive ring-2 ring-destructive/20',
              success && 'border-green-500 ring-2 ring-green-500/20',
              !error && !success && 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
              className
            )}
            {...props}
          />

          {label && (
            <motion.label
              htmlFor={id}
              variants={labelVariants}
              animate={shouldFloatLabel ? 'focus' : 'rest'}
              className="absolute left-4 top-3 pointer-events-none origin-left"
            >
              {label}
            </motion.label>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              variants={shouldAnimate ? successPop : {}}
              className="absolute right-3 top-3 text-green-500"
            >
              <Check className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={transitions.validation}
              className={cn(
                'mt-2 text-sm flex items-center gap-1',
                error ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {error && <AlertCircle className="w-3 h-3" />}
              {error || helperText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

AnimatedTextarea.displayName = 'AnimatedTextarea';

// ─── Animated Checkbox ───
interface AnimatedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const AnimatedCheckbox = forwardRef<HTMLInputElement, AnimatedCheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();
    const id = useId();

    const checkboxVariants = shouldAnimate ? {
      unchecked: {
        scale: 1,
        backgroundColor: 'transparent',
        borderColor: 'hsl(var(--border))',
        transition: transitions.button
      },
      checked: {
        scale: 1.05,
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary))',
        transition: transitions.button
      }
    } : {};

    const checkVariants = shouldAnimate ? {
      unchecked: {
        pathLength: 0,
        opacity: 0,
        transition: { duration: 0.2 }
      },
      checked: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.3, delay: 0.1 }
      }
    } : {};

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0 mt-0.5">
          <motion.div
            variants={checkboxVariants}
            animate={props.checked ? 'checked' : 'unchecked'}
            className="w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer"
          >
            <input
              ref={ref}
              id={id}
              type="checkbox"
              className="sr-only"
              {...props}
            />
            
            <motion.svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                variants={checkVariants}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
        </div>

        {(label || description) && (
          <div className="flex-1">
            {label && (
              <motion.label
                htmlFor={id}
                className="text-sm font-medium text-foreground cursor-pointer"
                whileHover={shouldAnimate ? { x: 2 } : {}}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

AnimatedCheckbox.displayName = 'AnimatedCheckbox';

// ─── Form Container ───
interface AnimatedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const AnimatedForm = forwardRef<HTMLFormElement, AnimatedFormProps>(
  ({ children, title, description, className, ...props }, ref) => {
    const { shouldAnimate } = useAnimationConfig();

    const formVariants = shouldAnimate ? {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
          staggerChildren: 0.1
        }
      }
    } : {};

    const itemVariants = shouldAnimate ? {
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0 }
    } : {};

    return (
      <motion.div
        initial="hidden"
        animate="show"
        variants={formVariants}
      >
        <form
          ref={ref}
          className={cn('space-y-6', className)}
          {...props}
        >
          {(title || description) && (
            <motion.div variants={itemVariants} className="text-center">
              {title && (
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-muted-foreground">
                  {description}
                </p>
              )}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="space-y-4">
            {children}
          </motion.div>
        </form>
      </motion.div>
    );
  }
);

AnimatedForm.displayName = 'AnimatedForm';