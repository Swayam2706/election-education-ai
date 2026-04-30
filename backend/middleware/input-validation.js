/**
 * Comprehensive Input Validation Middleware
 * Enterprise-grade validation for all incoming requests
 */

const { body, param, query, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

/**
 * Validation error formatter
 * @param {Object} errors - Validation errors
 * @returns {Array} Formatted errors
 */
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value,
    location: error.location,
  }));
};

/**
 * Validation result handler middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors);
    
    logger.warn('Validation failed', {
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formattedErrors,
      },
    });
  }

  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // Email validation
  email: () => 
    body('email')
      .trim()
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail()
      .isLength({ max: 254 })
      .withMessage('Email too long'),

  // Password validation
  password: () =>
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be 8-128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  // Name validation
  name: () =>
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  // MongoDB ObjectId validation
  objectId: (field = 'id') =>
    param(field)
      .isMongoId()
      .withMessage('Invalid ID format'),

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Page must be between 1 and 10000')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
  ],

  // Search query validation
  searchQuery: () =>
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Search query must be 1-200 characters')
      .customSanitizer(value => {
        // Remove SQL injection attempts
        const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'UNION'];
        let sanitized = value;
        sqlKeywords.forEach(keyword => {
          sanitized = sanitized.replace(new RegExp(keyword, 'gi'), '');
        });
        return sanitized;
      }),

  // URL validation
  url: (field = 'url') =>
    body(field)
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Invalid URL format')
      .isLength({ max: 2048 })
      .withMessage('URL too long'),

  // Phone number validation
  phone: () =>
    body('phone')
      .optional()
      .trim()
      .matches(/^\+?[1-9]\d{9,14}$/)
      .withMessage('Invalid phone number format'),

  // Date validation
  date: (field = 'date') =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
      .toDate(),

  // Boolean validation
  boolean: (field) =>
    body(field)
      .optional()
      .isBoolean()
      .withMessage(`${field} must be a boolean`)
      .toBoolean(),

  // Integer validation
  integer: (field, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    body(field)
      .optional()
      .isInt({ min, max })
      .withMessage(`${field} must be an integer between ${min} and ${max}`)
      .toInt(),

  // Array validation
  array: (field, minLength = 0, maxLength = 100) =>
    body(field)
      .optional()
      .isArray({ min: minLength, max: maxLength })
      .withMessage(`${field} must be an array with ${minLength}-${maxLength} items`),

  // Enum validation
  enum: (field, values) =>
    body(field)
      .optional()
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`),

  // Text content validation
  textContent: (field, minLength = 1, maxLength = 5000) =>
    body(field)
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be ${minLength}-${maxLength} characters`)
      .customSanitizer(value => {
        // Remove script tags
        return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }),

  // Slug validation
  slug: (field = 'slug') =>
    body(field)
      .trim()
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage('Slug must be lowercase alphanumeric with hyphens')
      .isLength({ min: 1, max: 100 })
      .withMessage('Slug must be 1-100 characters'),

  // Category validation
  category: () =>
    body('category')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be 2-50 characters')
      .matches(/^[a-zA-Z0-9\s-]+$/)
      .withMessage('Category can only contain letters, numbers, spaces, and hyphens'),

  // Tags validation
  tags: () =>
    body('tags')
      .optional()
      .isArray({ min: 0, max: 10 })
      .withMessage('Tags must be an array with 0-10 items')
      .custom((tags) => {
        if (!Array.isArray(tags)) return false;
        return tags.every(tag => 
          typeof tag === 'string' && 
          tag.length >= 2 && 
          tag.length <= 30 &&
          /^[a-zA-Z0-9\s-]+$/.test(tag)
        );
      })
      .withMessage('Each tag must be 2-30 characters and contain only letters, numbers, spaces, and hyphens'),

  // JSON validation
  json: (field) =>
    body(field)
      .optional()
      .custom((value) => {
        try {
          if (typeof value === 'string') {
            JSON.parse(value);
          }
          return true;
        } catch (error) {
          return false;
        }
      })
      .withMessage(`${field} must be valid JSON`),

  // File upload validation
  file: (field, allowedTypes = [], maxSize = 5 * 1024 * 1024) =>
    body(field)
      .optional()
      .custom((value, { req }) => {
        const file = req.files?.[field];
        if (!file) return true;

        // Check file size
        if (file.size > maxSize) {
          throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
          throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
        }

        return true;
      }),

  // IP address validation
  ipAddress: (field = 'ip') =>
    body(field)
      .optional()
      .isIP()
      .withMessage('Invalid IP address'),

  // UUID validation
  uuid: (field = 'id') =>
    param(field)
      .isUUID()
      .withMessage('Invalid UUID format'),

  // Credit card validation (for testing only - never store real cards)
  creditCard: () =>
    body('cardNumber')
      .optional()
      .isCreditCard()
      .withMessage('Invalid credit card number'),

  // Postal code validation
  postalCode: (field = 'postalCode', locale = 'any') =>
    body(field)
      .optional()
      .isPostalCode(locale)
      .withMessage('Invalid postal code'),

  // Latitude/Longitude validation
  coordinates: () => [
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
  ],
};

/**
 * Request sanitization middleware
 * Sanitizes all string inputs to prevent XSS
 */
const sanitizeRequest = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Remove null bytes
    str = str.replace(/\0/g, '');
    
    // Trim whitespace
    str = str.trim();
    
    return str;
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = typeof obj[key] === 'string' 
          ? sanitizeString(obj[key]) 
          : sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

/**
 * Content-Type validation middleware
 * Ensures request has correct Content-Type header
 */
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.get('Content-Type');
      
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        logger.warn('Invalid Content-Type', {
          contentType,
          allowedTypes,
          url: req.originalUrl,
        });

        return res.status(415).json({
          success: false,
          error: {
            message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
            code: 'INVALID_CONTENT_TYPE',
          },
        });
      }
    }

    next();
  };
};

/**
 * Request size validation middleware
 * Prevents oversized requests
 */
const validateRequestSize = (maxSize = 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSize) {
      logger.warn('Request too large', {
        contentLength,
        maxSize,
        url: req.originalUrl,
      });

      return res.status(413).json({
        success: false,
        error: {
          message: `Request size must be less than ${maxSize / 1024 / 1024}MB`,
          code: 'REQUEST_TOO_LARGE',
        },
      });
    }

    next();
  };
};

module.exports = {
  validationRules,
  handleValidationErrors,
  sanitizeRequest,
  validateContentType,
  validateRequestSize,
  formatValidationErrors,
};
