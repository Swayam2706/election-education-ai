// Intersection Observer hook for lazy loading and infinite scroll
import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;
  
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If already visible and frozen, don't observe
    if (freezeOnceVisible && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);

        if (isIntersecting && freezeOnceVisible) {
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, isVisible]);

  return [elementRef, isVisible];
};

// Lazy load component wrapper
export const LazyLoad: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
}> = ({ children, placeholder = null, rootMargin = '50px' }) => {
  const [ref, isVisible] = useIntersectionObserver({
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref}>
      {isVisible ? children : placeholder}
    </div>
  );
};
