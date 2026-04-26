const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, AuthorizationError, asyncHandler } = require('../utils/errors');
const { logger } = require('../utils/logger');
const config = require('../utils/config');

// Enhanced authentication middleware
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Access token required');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, config.getJWTConfig().secret);
    
    // Verify user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    // Log authentication
    logger.auth('User authenticated', user._id, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token expired');
    }
    throw error;
  }
});

// Optional authentication (doesn't throw error if no token)
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, config.getJWTConfig().secret);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      };
    }
  } catch (error) {
    // Silently fail for optional auth
    logger.debug('Optional auth failed', { error: error.message });
  }
  
  next();
});

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      logger.security('Authorization failed', {
        userId: req.user.userId,
        requiredRoles: roles,
        userRole: req.user.role,
        endpoint: req.originalUrl
      });
      
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
};

// Admin only middleware
const adminOnly = authorize('ADMIN');

// User or admin middleware
const userOrAdmin = authorize('USER', 'ADMIN');

// Resource ownership check
const checkOwnership = (resourceField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Admin can access any resource
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (resourceUserId && resourceUserId !== req.user.userId.toString()) {
      logger.security('Ownership check failed', {
        userId: req.user.userId,
        resourceUserId,
        endpoint: req.originalUrl
      });
      
      throw new AuthorizationError('Access denied to this resource');
    }

    next();
  });
};

// Rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 900000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.userId.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get user's request history
    let requests = userRequests.get(userId) || [];
    
    // Remove old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      logger.security('User rate limit exceeded', {
        userId,
        requests: requests.length,
        maxRequests,
        windowMs
      });
      
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'USER_RATE_LIMIT_EXCEEDED'
        }
      });
    }

    // Add current request
    requests.push(now);
    userRequests.set(userId, requests);

    next();
  };
};

// API key authentication (for external services)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'API key required',
        code: 'API_KEY_REQUIRED'
      }
    });
  }

  // Validate API key (implement your logic here)
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.security('Invalid API key', { apiKey: apiKey.substring(0, 8) + '...' });
    
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid API key',
        code: 'INVALID_API_KEY'
      }
    });
  }

  req.apiKey = apiKey;
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  userOrAdmin,
  checkOwnership,
  userRateLimit,
  apiKeyAuth
};