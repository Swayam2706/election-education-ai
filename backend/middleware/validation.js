const Joi = require('joi');
const { ValidationError, asyncHandler } = require('../utils/errors');
const { logger } = require('../utils/logger');

// Validation constants
const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  CONTENT_TITLE_MAX_LENGTH: 200,
  CONTENT_EXCERPT_MAX_LENGTH: 500
};

// Enhanced validation middleware
const validate = (schema, options = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { body = true, params = false, query = false } = options;
    
    const validationData = {};
    
    if (body && schema.body) {
      validationData.body = req.body;
    }
    
    if (params && schema.params) {
      validationData.params = req.params;
    }
    
    if (query && schema.query) {
      validationData.query = req.query;
    }

    // If no specific schema parts, validate body by default
    if (!schema.body && !schema.params && !schema.query) {
      validationData.body = req.body;
      schema = { body: schema };
    }

    try {
      const validated = {};
      
      for (const [key, data] of Object.entries(validationData)) {
        if (schema[key]) {
          const { error, value } = schema[key].validate(data, {
            abortEarly: false,
            stripUnknown: true,
            ...options
          });
          
          if (error) {
            const details = error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message,
              value: detail.context?.value
            }));
            
            logger.warn('Validation failed', {
              endpoint: req.originalUrl,
              method: req.method,
              errors: details
            });
            
            throw new ValidationError('Validation failed', details);
          }
          
          validated[key] = value;
        }
      }
      
      // Replace request data with validated data
      Object.assign(req, validated);
      
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new ValidationError(error.message);
    }
  });
};

// Common validation schemas
const commonSchemas = {
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid ID format'
  }),
  
  email: Joi.string().email().lowercase().required().messages({
    'string.email': 'Invalid email format'
  }),
  
  password: Joi.string().min(VALIDATION.PASSWORD_MIN_LENGTH).required().messages({
    'string.min': `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`
  }),
  
  name: Joi.string()
    .min(VALIDATION.NAME_MIN_LENGTH)
    .max(VALIDATION.NAME_MAX_LENGTH)
    .trim()
    .required()
    .messages({
      'string.min': `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`,
      'string.max': `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`
    }),
  
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('createdAt', '-createdAt', 'name', '-name', 'updatedAt', '-updatedAt').default('-createdAt')
  }
};

// Authentication validation schemas
const authValidation = {
  register: {
    body: Joi.object({
      email: commonSchemas.email,
      password: commonSchemas.password,
      name: commonSchemas.name,
      confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match'
      })
    }).unknown(false)
  },
  
  login: {
    body: Joi.object({
      email: commonSchemas.email,
      password: Joi.string().required()
    }).unknown(false)
  },
  
  firebaseSync: {
    body: Joi.object({
      firebaseUid: Joi.string().required(),
      email: commonSchemas.email,
      name: Joi.string().allow('').default('User'),
      image: Joi.string().uri().allow(null, ''),
      token: Joi.string().required()
    }).unknown(false)
  },
  
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: commonSchemas.password,
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Passwords do not match'
      })
    }).unknown(false)
  },
  
  updateProfile: {
    body: Joi.object({
      name: commonSchemas.name.optional(),
      image: Joi.string().uri().allow(null, '').optional(),
      preferences: Joi.object({
        language: Joi.string().valid('en', 'es', 'fr', 'de').optional(),
        theme: Joi.string().valid('light', 'dark', 'system').optional(),
        notifications: Joi.boolean().optional()
      }).optional()
    }).unknown(false)
  }
};

// Content validation schemas
const contentValidation = {
  create: {
    body: Joi.object({
      title: Joi.string().max(VALIDATION.CONTENT_TITLE_MAX_LENGTH).required(),
      content: Joi.string().required(),
      excerpt: Joi.string().max(VALIDATION.CONTENT_EXCERPT_MAX_LENGTH).optional(),
      type: Joi.string().valid('article', 'quiz', 'timeline', 'faq', 'announcement').required(),
      status: Joi.string().valid('draft', 'published', 'archived', 'scheduled').default('draft'),
      tags: Joi.array().items(Joi.string()).optional(),
      metadata: Joi.object().optional(),
      publishedAt: Joi.date().optional()
    }).unknown(false)
  },
  
  update: {
    body: Joi.object({
      title: Joi.string().max(VALIDATION.CONTENT_TITLE_MAX_LENGTH).optional(),
      content: Joi.string().optional(),
      excerpt: Joi.string().max(VALIDATION.CONTENT_EXCERPT_MAX_LENGTH).optional(),
      status: Joi.string().valid('draft', 'published', 'archived', 'scheduled').optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      metadata: Joi.object().optional(),
      publishedAt: Joi.date().optional()
    }).unknown(false)
  },
  
  list: {
    query: Joi.object({
      ...commonSchemas.pagination,
      type: Joi.string().valid('article', 'quiz', 'timeline', 'faq', 'announcement').optional(),
      status: Joi.string().valid('draft', 'published', 'archived', 'scheduled').optional(),
      search: Joi.string().optional(),
      tags: Joi.string().optional()
    })
  }
};

// Quiz validation schemas
const quizValidation = {
  create: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced').required(),
      timeLimit: Joi.number().integer().min(60).optional(), // seconds
      questions: Joi.array().items(
        Joi.object({
          question: Joi.string().required(),
          type: Joi.string().valid('multiple_choice', 'true_false', 'fill_blank').required(),
          options: Joi.array().items(Joi.string()).when('type', {
            is: 'multiple_choice',
            then: Joi.array().min(2).required(),
            otherwise: Joi.array().optional()
          }),
          correctAnswer: Joi.alternatives().try(
            Joi.string(),
            Joi.number().integer(),
            Joi.boolean()
          ).required(),
          explanation: Joi.string().optional(),
          points: Joi.number().integer().min(1).default(1)
        })
      ).min(1).required()
    }).unknown(false)
  },
  
  submit: {
    body: Joi.object({
      answers: Joi.array().items(
        Joi.object({
          questionId: commonSchemas.id,
          answer: Joi.alternatives().try(
            Joi.string(),
            Joi.number().integer(),
            Joi.boolean()
          ).required()
        })
      ).required()
    }).unknown(false)
  },
  
  submitAttempt: {
    body: Joi.object({
      quizId: Joi.string().required(),
      answers: Joi.array().items(
        Joi.object({
          questionIndex: Joi.number().integer().min(0).required(),
          selectedAnswer: Joi.number().integer().min(0).required(),
          timeSpent: Joi.number().integer().min(0).optional()
        })
      ).required(),
      timeSpent: Joi.number().integer().min(0).required()
    }).unknown(false)
  }
};

// Chat validation schemas
const chatValidation = {
  sendMessage: {
    body: Joi.object({
      message: Joi.string().min(1).max(5000).required(),
      chatId: Joi.string().allow(null, '').optional(),
      context: Joi.object().optional()
    })
  },
  message: {
    body: Joi.object({
      message: Joi.string().min(1).max(1000).required(),
      context: Joi.object().optional()
    }).unknown(false)
  }
};

// Admin validation schemas
const adminValidation = {
  updateUser: {
    body: Joi.object({
      name: commonSchemas.name.optional(),
      email: commonSchemas.email.optional(),
      role: Joi.string().valid('USER', 'ADMIN').optional(),
      status: Joi.string().valid('active', 'suspended', 'banned').optional()
    }).unknown(false)
  },
  
  siteSettings: {
    body: Joi.object({
      siteName: Joi.string().optional(),
      siteDescription: Joi.string().optional(),
      maintenanceMode: Joi.boolean().optional(),
      registrationEnabled: Joi.boolean().optional(),
      features: Joi.object({
        chatbot: Joi.boolean().optional(),
        analytics: Joi.boolean().optional(),
        notifications: Joi.boolean().optional()
      }).optional(),
      theme: Joi.object({
        primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        logo: Joi.string().uri().optional()
      }).optional()
    }).unknown(false)
  }
};

// Sanitization helpers
const sanitizeHtml = (text) => {
  if (typeof text !== 'string') return text;
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj.trim());
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

module.exports = {
  validate,
  sanitizeInput,
  commonSchemas,
  authValidation,
  contentValidation,
  quizValidation,
  chatValidation,
  adminValidation
};