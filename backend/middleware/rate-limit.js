const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    });
  }
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 requests per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Chat endpoint limiter
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    success: false,
    error: {
      message: 'Too many messages, please slow down.',
      code: 'CHAT_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Quiz submission limiter
const quizLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 quiz submissions per 5 minutes
  message: {
    success: false,
    error: {
      message: 'Too many quiz submissions, please try again later.',
      code: 'QUIZ_RATE_LIMIT_EXCEEDED'
    }
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  chatLimiter,
  quizLimiter
};
