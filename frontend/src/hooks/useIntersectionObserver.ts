import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Hook for lazy loading and infinite scroll
 * @param options - Intersection observer options
 * @returns Ref and visibility state
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Don't observe if already visible and frozen
    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
}

/**
 * Hook for infinite scroll pagination
 * @param callback - Function to call when element is visible
 * @param options - Intersection observer options
 * @returns Ref for the sentinel element
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: UseIntersectionObserverOptions = {}
): React.RefObject<T> {
  const [ref, isVisible] = useIntersectionObserver<T>(options);

  useEffect(() => {
    if (isVisible) {
      callback();
    }
  }, [isVisible, callback]);

  return ref;
}
