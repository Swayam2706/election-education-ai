/**
 * Global Animation Transitions
 * Optimized transition configurations for consistent timing and easing
 */

import { Transition } from 'framer-motion';

// ─── Easing Functions ───
export const easings = {
  // Premium easing curves
  smooth: [0.22, 1, 0.36, 1] as const,
  bouncy: [0.68, -0.55, 0.265, 1.55] as const,
  snappy: [0.25, 0.46, 0.45, 0.94] as const,
  gentle: [0.25, 0.1, 0.25, 1] as const,
  
  // Standard easing
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  
  // Spring physics
  spring: {
    type: "spring" as const,
    damping: 25,
    stiffness: 300,
    mass: 0.8
  },
  
  springBouncy: {
    type: "spring" as const,
    damping: 15,
    stiffness: 400,
    mass: 0.6
  },
  
  springGentle: {
    type: "spring" as const,
    damping: 30,
    stiffness: 200,
    mass: 1
  }
};

// ─── Duration Presets ───
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  medium: 0.4,
  slow: 0.6,
  slower: 0.8,
  slowest: 1.2
} as const;

// ─── Common Transitions ───
export const transitions = {
  // Fast interactions
  button: {
    duration: durations.fast,
    ease: easings.smooth
  } as Transition,
  
  hover: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition,
  
  tap: {
    duration: durations.instant,
    ease: easings.smooth
  } as Transition,
  
  // UI Elements
  modal: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  tooltip: {
    duration: durations.fast,
    ease: easings.smooth
  } as Transition,
  
  dropdown: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition,
  
  // Page transitions
  page: {
    duration: durations.slow,
    ease: easings.smooth
  } as Transition,
  
  route: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  // Content animations
  fadeIn: {
    duration: durations.slow,
    ease: easings.smooth
  } as Transition,
  
  slideUp: {
    duration: durations.slow,
    ease: easings.smooth
  } as Transition,
  
  scaleIn: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  // Loading states
  skeleton: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  } as Transition,
  
  pulse: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  } as Transition,
  
  shimmer: {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  } as Transition,
  
  // Success/Error states
  success: {
    duration: durations.medium,
    ease: easings.bouncy
  } as Transition,
  
  error: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  shake: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  // Form interactions
  inputFocus: {
    duration: durations.fast,
    ease: easings.smooth
  } as Transition,
  
  validation: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition,
  
  // Navigation
  navbar: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  mobileMenu: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  // Stagger configurations
  stagger: {
    fast: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    },
    normal: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    },
    slow: {
      staggerChildren: 0.2,
      delayChildren: 0.15
    }
  },
  
  // Spring presets
  spring: easings.spring,
  springBouncy: easings.springBouncy,
  springGentle: easings.springGentle
} as const;

// ─── Layout Transitions ───
export const layoutTransitions = {
  // Smooth layout changes
  default: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition,
  
  // Fast layout updates
  fast: {
    duration: durations.fast,
    ease: easings.smooth
  } as Transition,
  
  // Bouncy layout changes
  bouncy: {
    duration: durations.medium,
    ease: easings.bouncy
  } as Transition
};

// ─── Performance Optimized Transitions ───
export const performanceTransitions = {
  // GPU-accelerated only
  transform: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition,
  
  // Opacity only
  fade: {
    duration: durations.medium,
    ease: easings.smooth
  } as Transition,
  
  // Scale only
  scale: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition
};

// ─── Accessibility Transitions ───
export const a11yTransitions = {
  // Reduced motion safe
  reducedMotion: {
    duration: durations.fast,
    ease: easings.gentle
  } as Transition,
  
  // No animation
  none: {
    duration: 0
  } as Transition,
  
  // Minimal animation
  minimal: {
    duration: durations.instant,
    ease: easings.gentle
  } as Transition
};

// ─── Utility Functions ───
export const createStaggerTransition = (
  staggerDelay: number = 0.1,
  childDelay: number = 0.1
): Transition => ({
  staggerChildren: staggerDelay,
  delayChildren: childDelay
});

export const createDelayedTransition = (
  delay: number,
  baseTransition: Transition = transitions.fadeIn
): Transition => ({
  ...baseTransition,
  delay
});

export const createSpringTransition = (
  damping: number = 25,
  stiffness: number = 300,
  mass: number = 0.8
): Transition => ({
  type: "spring",
  damping,
  stiffness,
  mass
});

// ─── Export Collections ───
export const fastTransitions = {
  button: transitions.button,
  hover: transitions.hover,
  tap: transitions.tap,
  tooltip: transitions.tooltip
};

export const smoothTransitions = {
  modal: transitions.modal,
  page: transitions.page,
  fadeIn: transitions.fadeIn,
  slideUp: transitions.slideUp
};

export const springTransitions = {
  spring: transitions.spring,
  springBouncy: transitions.springBouncy,
  springGentle: transitions.springGentle
};