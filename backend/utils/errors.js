// Error handling utilities for backend
const { logger } = require('./logger');

// Custom Error Classes
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

class ValidationError extends AppError {
  constructor(message, field = null, value = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
    this.value = value;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.resource = resource;
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-AppError instances to AppError
  if (!(error instanceof AppError)) {
    if (error.name === 'ValidationError') {
      error = new ValidationError(error.message);
    } else if (error.name === 'CastError') {
      error = new ValidationError('Invalid ID format');
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = new ConflictError(`${field} already exists`);
    } else if (error.name === 'JsonWebTokenError') {
      error = new AuthenticationError('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      error = new AuthenticationError('Token expired');
    } else {
      error = new AppError(
        process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
        500,
        'INTERNAL_ERROR'
      );
    }
  }

  // Log error
  logger.error('Request Error', error, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId
  });

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        details: error
      })
    }
  });
};

// Async Error Handler Wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler,
  asyncHandler
};