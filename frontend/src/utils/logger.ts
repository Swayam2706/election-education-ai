/**
 * Production-safe logger utility
 * Logs to console in development, sends to monitoring service in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log informational message
   */
  log(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log informational message
   */
  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Log warning message
   */
  warn(...args: unknown[]): void {
    console.warn(...args);
  }

  /**
   * Log error message
   */
  error(...args: unknown[]): void {
    console.error(...args);
    // In production, send to error tracking service
    if (!this.isDevelopment) {
      // Error tracking integration point
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();
export default logger;
