// Performance optimization hooks
import { useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Hook for debounced callbacks
 * @template T - Function type
 * @param callback - Callback function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback function
 */
export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * Hook for throttled callbacks
 * @template T - Function type
 * @param callback - Callback function to throttle
 * @param delay - Minimum delay between executions in milliseconds
 * @returns Throttled callback function
 */
export const useThrottledCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastRan = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  );
};

/**
 * Hook for memoized values with deep comparison
 * @template T - Value type
 * @param factory - Factory function to create value
 * @param deps - Dependencies array
 * @returns Memoized value
 */
export const useDeepMemo = <T>(factory: () => T, deps: unknown[]): T => {
  const ref = useRef<{ deps: unknown[]; value: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
};

/**
 * Deep equality check for comparing values
 * @param a - First value
 * @param b - Second value
 * @returns True if values are deeply equal
 */
const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Hook for optimized event handlers with memoization
 * @template T - Function type
 * @param handler - Event handler function
 * @param deps - Dependencies array
 * @returns Memoized event handler
 */
export const useOptimizedEventHandler = <T extends (...args: unknown[]) => unknown>(
  handler: T,
  deps: unknown[] = []
): T => {
  return useCallback(handler, deps) as T;
};

// Memoized component props
export const useMemoizedProps = <T extends object>(props: T): T => {
  return useMemo(() => props, [JSON.stringify(props)]);
};
