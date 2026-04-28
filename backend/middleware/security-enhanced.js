// Enhanced Security Middleware - Enterprise Grade
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

// Advanced XSS Protection
const advancedXSSProtection = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove script tags and event handlers
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:text\/html/gi, '');
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = typeof obj[key] === 'object' 
          ? sanitizeObject(obj[key])
          : sanitizeValue(obj[key]);
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// CSRF Protection for state-changing operations
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API endpoints with Bearer token (already authenticated)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // For other requests, validate CSRF token
  const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    logger.security('CSRF token validation failed', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      hasToken: !!csrfToken,
      hasSession: !!sessionToken
    });

    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid CSRF token',
        code: 'CSRF_VALIDATION_FAILED'
      }
    });
  }

  next();
};

// Generate CSRF token
const generateCSRFToken = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  res.locals.csrfToken = req.session.csrfToken;
  next();
};

// Audit logging for sensitive operations
const auditLog = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log after response
      setImmediate(() => {
        logger.audit(action, {
          userId: req.user?.userId,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          success: data?.success !== false,
          timestamp: new Date().toISOString()
        });
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

// Track failed authentication attempts
const failedAuthTracker = (() => {
  const attempts = new Map();
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  return {
    track: (identifier) => {
      const now = Date.now();
      const record = attempts.get(identifier) || { count: 0, blockedUntil: 0 };

      // Check if still blocked
      if (record.blockedUntil > now) {
        return {
          blocked: true,
          remainingTime: Math.ceil((record.blockedUntil - now) / 1000)
        };
      }

      // Reset if block expired
      if (record.blockedUntil > 0 && record.blockedUntil <= now) {
        record.count = 0;
        record.blockedUntil = 0;
      }

      // Increment attempts
      record.count++;
      record.lastAttempt = now;

      // Block if exceeded
      if (record.count >= MAX_ATTEMPTS) {
        record.blockedUntil = now + BLOCK_DURATION;
        logger.security('Account temporarily blocked due to failed login attempts', {
          identifier,
          attempts: record.count,
          blockedUntil: new Date(record.blockedUntil).toISOString()
        });
      }

      attempts.set(identifier, record);

      return {
        blocked: record.count >= MAX_ATTEMPTS,
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
        remainingTime: record.blockedUntil > now ? Math.ceil((record.blockedUntil - now) / 1000) : 0
      };
    },

    reset: (identifier) => {
      attempts.delete(identifier);
    },

    middleware: (req, res, next) => {
      const identifier = req.body?.email || req.ip;
      const status = failedAuthTracker.track(identifier);

      if (status.blocked) {
        return res.status(429).json({
          success: false,
          error: {
            message: `Too many failed attempts. Please try again in ${status.remainingTime} seconds.`,
            code: 'AUTH_RATE_LIMITED',
            remainingTime: status.remainingTime
          }
        });
      }

      // Store for use in route
      req.authAttemptStatus = status;
      next();
    }
  };
})();

// Secure headers middleware
const secureHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https:; " +
    "frame-ancestors 'none';"
  );

  // HSTS (HTTP Strict Transport Security)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

// Input validation helper
const validateInput = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      logger.warn('Input validation failed', {
        path: req.path,
        errors: error.errors,
        ip: req.ip
      });

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors?.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      });
    }
  };
};

// SQL Injection prevention (for raw queries)
const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*|;|'|"|\||&|\$)/g,
    /(\bOR\b|\bAND\b).*=.*=/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (checkValue(obj[key]) || (typeof obj[key] === 'object' && checkObject(obj[key]))) {
          return true;
        }
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    logger.security('Potential SQL injection attempt detected', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });

    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid input detected',
        code: 'INVALID_INPUT'
      }
    });
  }

  next();
};

// Error masking - don't expose internal errors
const errorMasking = (err, req, res, next) => {
  // Log full error internally
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Send generic error to client
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: {
      message: isProduction ? 'An error occurred' : err.message,
      code: err.code || 'INTERNAL_ERROR',
      ...(isProduction ? {} : { stack: err.stack })
    }
  });
};

module.exports = {
  advancedXSSProtection,
  csrfProtection,
  generateCSRFToken,
  auditLog,
  failedAuthTracker,
  secureHeaders,
  validateInput,
  preventSQLInjection,
  errorMasking,
  mongoSanitize: mongoSanitize(),
  hpp: hpp()
};
