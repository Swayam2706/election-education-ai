/**
 * Performance Monitoring Utilities
 * Tracks and reports application performance metrics
 */

import { logger } from '../utils/logger';

/**
 * Performance metric types
 */
export type MetricType = 'page-load' | 'api-call' | 'component-render' | 'user-interaction';

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  name: string;
  type: MetricType;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance monitoring class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 100;
  private marks: Map<string, number> = new Map();

  /**
   * Starts a performance measurement
   * @param name - Unique identifier for the measurement
   */
  public start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Ends a performance measurement and records the metric
   * @param name - Identifier used in start()
   * @param type - Type of metric being measured
   * @param metadata - Additional metadata to attach to the metric
   */
  public end(name: string, type: MetricType, metadata?: Record<string, unknown>): void {
    const startTime = this.marks.get(name);
    
    if (!startTime) {
      logger.warn('Performance measurement not found', { name });
      return;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    const metric: PerformanceMetric = {
      name,
      type,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.recordMetric(metric);

    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', {
        name,
        duration: `${duration.toFixed(2)}ms`,
        type,
      });
    }
  }

  /**
   * Records a metric
   * @param metric - Performance metric to record
   * @private
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log metric in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Performance metric', {
        name: metric.name,
        duration: `${metric.duration.toFixed(2)}ms`,
        type: metric.type,
      });
    }
  }

  /**
   * Gets all recorded metrics
   * @returns Array of performance metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Gets metrics by type
   * @param type - Metric type to filter by
   * @returns Array of filtered metrics
   */
  public getMetricsByType(type: MetricType): PerformanceMetric[] {
    return this.metrics.filter(m => m.type === type);
  }

  /**
   * Gets average duration for a metric type
   * @param type - Metric type
   * @returns Average duration in milliseconds
   */
  public getAverageDuration(type: MetricType): number {
    const metrics = this.getMetricsByType(type);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clears all recorded metrics
   */
  public clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Reports performance summary
   */
  public reportSummary(): void {
    const types: MetricType[] = ['page-load', 'api-call', 'component-render', 'user-interaction'];
    
    const summary = types.map(type => ({
      type,
      count: this.getMetricsByType(type).length,
      average: this.getAverageDuration(type).toFixed(2),
    }));

    logger.info('Performance Summary', { summary });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order function to measure component render time
 * @param componentName - Name of the component
 * @returns Decorator function
 */
export function measureRender(componentName: string) {
  return function <T extends React.ComponentType<unknown>>(Component: T): T {
    const MeasuredComponent = (props: React.ComponentProps<T>) => {
      React.useEffect(() => {
        performanceMonitor.start(`render-${componentName}`);
        return () => {
          performanceMonitor.end(`render-${componentName}`, 'component-render', {
            component: componentName,
          });
        };
      }, []);

      return React.createElement(Component, props);
    };

    MeasuredComponent.displayName = `Measured(${componentName})`;
    return MeasuredComponent as T;
  };
}

/**
 * Hook to measure async operations
 * @param name - Operation name
 * @param type - Metric type
 * @returns Measurement functions
 */
export function usePerformanceMeasure(name: string, type: MetricType = 'user-interaction') {
  const start = React.useCallback(() => {
    performanceMonitor.start(name);
  }, [name]);

  const end = React.useCallback((metadata?: Record<string, unknown>) => {
    performanceMonitor.end(name, type, metadata);
  }, [name, type]);

  return { start, end };
}

/**
 * Measures Web Vitals
 */
export function measureWebVitals(): void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      logger.info('LCP', {
        value: lastEntry.startTime.toFixed(2),
        rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    // LCP not supported
  }

  // First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        
        logger.info('FID', {
          value: fid.toFixed(2),
          rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor',
        });
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    // FID not supported
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as LayoutShift).hadRecentInput) {
          clsValue += (entry as LayoutShift).value;
        }
      });

      logger.info('CLS', {
        value: clsValue.toFixed(4),
        rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
      });
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    // CLS not supported
  }
}

// Type definitions for Performance API
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
