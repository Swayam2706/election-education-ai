import { getPerformance, trace } from 'firebase/performance';
import { app } from './firebase';

let performance: ReturnType<typeof getPerformance> | null = null;

try {
  performance = getPerformance(app);
} catch (error) {
  if (typeof window !== 'undefined') {
    import('../utils/logger').then(({ logger }) => {
      logger.warn('Firebase Performance not available', error);
    });
  }
}

export const trackPageLoad = (pageName: string) => {
  if (!performance) return;

  const pageTrace = trace(performance, `page_${pageName}`);
  pageTrace.start();

  // Stop trace after page is fully loaded
  window.addEventListener('load', () => {
    pageTrace.stop();
  });

  return pageTrace;
};

export const trackApiCall = async <T>(
  apiName: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  if (!performance) return apiCall();

  const apiTrace = trace(performance, `api_${apiName}`);
  apiTrace.start();

  try {
    const result = await apiCall();
    apiTrace.putAttribute('status', 'success');
    return result;
  } catch (error) {
    apiTrace.putAttribute('status', 'error');
    throw error;
  } finally {
    apiTrace.stop();
  }
};

export const trackCustomMetric = (metricName: string, value: number) => {
  if (!performance) return;

  const customTrace = trace(performance, metricName);
  customTrace.start();
  customTrace.putMetric(metricName, value);
  customTrace.stop();
};

export { performance };
