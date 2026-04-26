/**
 * Reduced Motion Hook
 * Respects user's motion preferences for accessibility
 */

import { useEffect, useState } from 'react';

export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create handler for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

// ─── Motion-Safe Wrapper Hook ───
export const useMotionSafe = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
    
    // Get motion-safe variants
    getVariants: (normalVariants: any, reducedVariants?: any) => {
      if (prefersReducedMotion && reducedVariants) {
        return reducedVariants;
      }
      return prefersReducedMotion ? {} : normalVariants;
    },
    
    // Get motion-safe transition
    getTransition: (normalTransition: any, reducedTransition?: any) => {
      if (prefersReducedMotion) {
        return reducedTransition || { duration: 0 };
      }
      return normalTransition;
    }
  };
};

// ─── Animation Config Hook ───
export const useAnimationConfig = () => {
  const { prefersReducedMotion, shouldAnimate, getVariants, getTransition } = useMotionSafe();
  
  return {
    prefersReducedMotion,
    shouldAnimate,
    
    // Common reduced motion variants
    reducedMotionVariants: {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.1 } }
    },
    
    // Helper functions
    fadeIn: (variants: any) => getVariants(variants, {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.1 } }
    }),
    
    slideUp: (variants: any) => getVariants(variants, {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.1 } }
    }),
    
    scaleIn: (variants: any) => getVariants(variants, {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.1 } }
    }),
    
    // Transition helpers
    fastTransition: (transition: any) => getTransition(transition, { duration: 0.1 }),
    noTransition: () => getTransition({}, { duration: 0 })
  };
};