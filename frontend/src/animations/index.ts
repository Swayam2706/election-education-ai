/**
 * Animation System Index
 * Central export for all animation components and utilities
 */

// ─── Core Animation System ───
export * from './variants';
export * from './transitions';

// ─── Hooks ───
export * from './hooks/useReducedMotion';
export * from './hooks/useScrollAnimation';

// ─── Motion Components ───
export * from './motion-components/AnimatedContainer';
export * from './motion-components/AnimatedCard';
export * from './motion-components/AnimatedButton';

// ─── Page Transitions ───
export * from './page-transitions/PageTransition';

// ─── Loading Effects ───
export * from './loading-effects/LoadingAnimations';

// ─── Scroll Effects ───
export * from './scroll-effects/ScrollAnimations';

// ─── Form Components ───
export * from '../components/forms/AnimatedForm';

// ─── Animation Presets ───
export const animationPresets = {
  // Fast interactions
  fast: {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1]
  },
  
  // Standard UI animations
  smooth: {
    duration: 0.4,
    ease: [0.22, 1, 0.36, 1]
  },
  
  // Page transitions
  page: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1]
  },
  
  // Bouncy animations
  bouncy: {
    duration: 0.5,
    ease: [0.68, -0.55, 0.265, 1.55]
  },
  
  // Spring physics
  spring: {
    type: "spring" as const,
    damping: 25,
    stiffness: 300,
    mass: 0.8
  }
};

// ─── Common Animation Utilities ───
export const createStaggerAnimation = (
  staggerDelay: number = 0.1,
  childDelay: number = 0.1
) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: childDelay
    }
  }
});

export const createDelayedAnimation = (
  delay: number,
  baseAnimation: any = { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
) => ({
  ...baseAnimation,
  delay
});

// ─── Performance Optimized Animations ───
export const performanceAnimations = {
  // GPU-accelerated transforms only
  fadeTransform: {
    hidden: { opacity: 0, transform: 'translateY(20px)' },
    show: { opacity: 1, transform: 'translateY(0px)' }
  },
  
  // Scale animations
  scaleTransform: {
    hidden: { opacity: 0, transform: 'scale(0.95)' },
    show: { opacity: 1, transform: 'scale(1)' }
  },
  
  // Slide animations
  slideTransform: {
    hidden: { opacity: 0, transform: 'translateX(30px)' },
    show: { opacity: 1, transform: 'translateX(0px)' }
  }
};

// ─── Accessibility Safe Animations ───
export const a11yAnimations = {
  // Reduced motion variants
  reducedMotion: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.1 } }
  },
  
  // No animation
  none: {
    hidden: {},
    show: {}
  },
  
  // Minimal animation
  minimal: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.2 } }
  }
};

// ─── Animation Configuration ───
export const animationConfig = {
  // Global settings
  defaultDuration: 0.4,
  defaultEasing: [0.22, 1, 0.36, 1] as const,
  
  // Performance settings
  useGPUAcceleration: true,
  respectReducedMotion: true,
  
  // Timing settings
  staggerDelay: 0.1,
  pageTransitionDuration: 0.6,
  microInteractionDuration: 0.2,
  
  // Easing presets
  easings: {
    smooth: [0.22, 1, 0.36, 1] as const,
    bouncy: [0.68, -0.55, 0.265, 1.55] as const,
    snappy: [0.25, 0.46, 0.45, 0.94] as const,
    gentle: [0.25, 0.1, 0.25, 1] as const
  }
};

// ─── Theme-aware Animations ───
export const createThemeAnimation = (lightVariant: any, darkVariant: any) => ({
  light: lightVariant,
  dark: darkVariant
});

// ─── Responsive Animations ───
export const createResponsiveAnimation = (
  mobile: any,
  tablet: any,
  desktop: any
) => ({
  mobile,
  tablet,
  desktop
});

// ─── Animation Debugging ───
export const debugAnimation = (name: string, variants: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Animation Debug - ${name}:`, variants);
  }
  return variants;
};