/**
 * Input Sanitization Utilities
 * Prevents XSS and injection attacks by sanitizing user input
 */

import { logger } from './logger';

/**
 * Sanitization options
 */
export interface SanitizationOptions {
  /** Allow HTML tags */
  allowHTML?: boolean;
  /** Maximum length */
  maxLength?: number;
  /** Trim whitespace */
  trim?: boolean;
  /** Convert to lowercase */
  lowercase?: boolean;
  /** Remove special characters */
  removeSpecialChars?: boolean;
}

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML entities to prevent XSS
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeHTML(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }

  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Unescapes HTML entities
 * @param str - String to unescape
 * @returns Unescaped string
 */
export function unescapeHTML(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Sanitizes user input
 * @param input - Input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(input: string, options: SanitizationOptions = {}): string {
  if (typeof input !== 'string') {
    logger.warn('Invalid input type for sanitization', { type: typeof input });
    return '';
  }

  let sanitized = input;

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Escape HTML if not allowed
  if (!options.allowHTML) {
    sanitized = escapeHTML(sanitized);
  }

  // Convert to lowercase
  if (options.lowercase) {
    sanitized = sanitized.toLowerCase();
  }

  // Remove special characters
  if (options.removeSpecialChars) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s-_]/g, '');
  }

  // Enforce maximum length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
    logger.debug('Input truncated to max length', { maxLength: options.maxLength });
  }

  return sanitized;
}

/**
 * Sanitizes email address
 * @param email - Email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email, {
    trim: true,
    lowercase: true,
    maxLength: 254, // RFC 5321
  });

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    logger.warn('Invalid email format', { email: sanitized.substring(0, 20) });
    return '';
  }

  return sanitized;
}

/**
 * Sanitizes URL
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  const sanitized = sanitizeInput(url, { trim: true });

  try {
    const urlObj = new URL(sanitized);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      logger.warn('Invalid URL protocol', { protocol: urlObj.protocol });
      return '';
    }

    return urlObj.toString();
  } catch (error) {
    logger.warn('Invalid URL format', { url: sanitized.substring(0, 50) });
    return '';
  }
}

/**
 * Sanitizes filename
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  let sanitized = sanitizeInput(filename, { trim: true });

  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.substring(0, 255 - ext.length - 1);
    sanitized = `${name}.${ext}`;
  }

  return sanitized;
}

/**
 * Sanitizes phone number
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number (digits only)
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters
  const sanitized = phone.replace(/\D/g, '');

  // Validate length (10-15 digits for international numbers)
  if (sanitized.length < 10 || sanitized.length > 15) {
    logger.warn('Invalid phone number length', { length: sanitized.length });
    return '';
  }

  return sanitized;
}

/**
 * Sanitizes object by sanitizing all string values
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizationOptions = {}
): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item, options) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validates and sanitizes search query
 * @param query - Search query
 * @returns Sanitized query
 */
export function sanitizeSearchQuery(query: string): string {
  let sanitized = sanitizeInput(query, {
    trim: true,
    maxLength: 200,
  });

  // Remove SQL injection attempts
  const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'UNION'];
  const upperQuery = sanitized.toUpperCase();
  
  for (const keyword of sqlKeywords) {
    if (upperQuery.includes(keyword)) {
      logger.security('SQL injection attempt detected', { query: sanitized.substring(0, 50) });
      sanitized = sanitized.replace(new RegExp(keyword, 'gi'), '');
    }
  }

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return sanitized;
}

/**
 * Checks if string contains potential XSS
 * @param str - String to check
 * @returns True if potential XSS detected
 */
export function containsXSS(str: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i,
  ];

  return xssPatterns.some(pattern => pattern.test(str));
}

/**
 * Sanitizes markdown content
 * @param markdown - Markdown content
 * @returns Sanitized markdown
 */
export function sanitizeMarkdown(markdown: string): string {
  let sanitized = markdown;

  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}

/**
 * Rate limiting for input validation
 */
class InputRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 10;
  private readonly windowMs = 60000; // 1 minute

  /**
   * Checks if input is rate limited
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @returns True if rate limited
   */
  public isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];

    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);

    if (recentAttempts.length >= this.maxAttempts) {
      logger.security('Input rate limit exceeded', { identifier });
      return true;
    }

    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);

    return false;
  }

  /**
   * Clears rate limit for identifier
   * @param identifier - Identifier to clear
   */
  public clear(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const inputRateLimiter = new InputRateLimiter();
