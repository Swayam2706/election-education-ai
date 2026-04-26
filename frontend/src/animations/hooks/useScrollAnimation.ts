/**
 * Scroll Animation Hook
 * Enhanced scroll-based animations with performance optimization
 */

import { useEffect, useState, useRef, RefObject, useCallback } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

// ─── Legacy Hooks (Maintained for compatibility) ───

// Hook for navbar scroll behavior
export function useScrollNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    // Update isAtTop
    setIsAtTop(currentScrollY < 10);
    
    // Show/hide navbar based on scroll direction
    if (currentScrollY < lastScrollY || currentScrollY < 100) {
      // Scrolling up or near top
      setIsVisible(true);
    } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and not near top
      setIsVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { isVisible, isAtTop };
}

// Hook for scroll-triggered animations
export function useScrollTrigger(threshold: number = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, threshold]);

  return { isInView, setElement };
}

// Hook for parallax scroll effects
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
}

// Hook for scroll progress
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.pageYOffset / totalHeight) * 100;
      setProgress(Math.min(Math.max(currentProgress, 0), 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

// Hook for element visibility with callback
export function useIntersectionObserver(
  callback: (isVisible: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [element, callback, options]);

  return setElement;
}

// Hook for smooth scroll to element
export function useSmoothScroll() {
  const scrollToElement = useCallback((
    elementId: string,
    options: ScrollIntoViewOptions = {}
  ) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      });
    }
  }, []);

  const scrollToTop = useCallback((smooth: boolean = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  return { scrollToElement, scrollToTop };
}

// ─── Enhanced Framer Motion Hooks ───

// Enhanced Intersection Observer Hook
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useEnhancedIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [RefObject<HTMLElement>, boolean] => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        if (triggerOnce) {
          if (isVisible && !hasTriggered) {
            setIsIntersecting(true);
            setHasTriggered(true);
          }
        } else {
          setIsIntersecting(isVisible);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return [ref, isIntersecting];
};

// Scroll Progress Hook with Framer Motion
interface UseScrollProgressOptions {
  target?: RefObject<HTMLElement>;
  offset?: [string, string];
}

export const useEnhancedScrollProgress = (
  options: UseScrollProgressOptions = {}
): MotionValue<number> => {
  const { target, offset = ["start end", "end start"] } = options;
  const { scrollYProgress } = useScroll({ target, offset: offset as any });
  
  return scrollYProgress;
};

// Enhanced Parallax Hook
interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
}

export const useEnhancedParallax = (
  scrollProgress: MotionValue<number>,
  options: UseParallaxOptions = {}
): MotionValue<number> => {
  const { speed = 50, direction = 'up' } = options;
  const prefersReducedMotion = useReducedMotion();
  
  const range = direction === 'up' ? [0, -speed] : [0, speed];
  const y = useTransform(scrollProgress, [0, 1], prefersReducedMotion ? [0, 0] : range);
  
  return y;
};

// Scroll Velocity Hook
export const useScrollVelocity = (): MotionValue<number> => {
  const { scrollY } = useScroll();
  const [velocity, setVelocity] = useState(0);
  
  useEffect(() => {
    let lastY = scrollY.get();
    let lastTime = Date.now();
    
    const unsubscribe = scrollY.onChange((currentY) => {
      const currentTime = Date.now();
      const deltaY = currentY - lastY;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0) {
        const currentVelocity = deltaY / deltaTime;
        setVelocity(currentVelocity);
      }
      
      lastY = currentY;
      lastTime = currentTime;
    });
    
    return unsubscribe;
  }, [scrollY]);
  
  return useTransform(() => velocity);
};

// Scroll Direction Hook
export const useScrollDirection = (): 'up' | 'down' | null => {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const { scrollY } = useScroll();
  
  useEffect(() => {
    let lastScrollY = scrollY.get();
    
    const unsubscribe = scrollY.onChange((currentScrollY) => {
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      
      if (Math.abs(currentScrollY - lastScrollY) > 5) {
        setScrollDirection(direction);
      }
      
      lastScrollY = currentScrollY;
    });
    
    return unsubscribe;
  }, [scrollY]);
  
  return scrollDirection;
};

// Scroll-based Counter Hook
interface UseScrollCounterOptions {
  from: number;
  to: number;
  duration?: number;
}

export const useScrollCounter = (
  isVisible: boolean,
  options: UseScrollCounterOptions
): number => {
  const { from, to, duration = 2000 } = options;
  const [count, setCount] = useState(from);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (!isVisible) return;
    
    if (prefersReducedMotion) {
      setCount(to);
      return;
    }
    
    let startTime: number;
    const startValue = from;
    const endValue = to;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(startValue + (endValue - startValue) * easeOut);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, from, to, duration, prefersReducedMotion]);
  
  return count;
};

export default {
  useScrollNavbar,
  useScrollTrigger,
  useParallax,
  useScrollProgress,
  useIntersectionObserver,
  useSmoothScroll,
  useEnhancedIntersectionObserver,
  useEnhancedScrollProgress,
  useEnhancedParallax,
  useScrollVelocity,
  useScrollDirection,
  useScrollCounter,
};