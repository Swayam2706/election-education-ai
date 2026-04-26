// Simple logging utility for backend
const winston = require('winston');
const path = require('path');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'election-education-api'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Enhanced logging methods
class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  info(message, meta = {}) {
    logger.info(message, { context: this.context, ...meta });
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
    } : {};
    
    logger.error(message, { context: this.context, ...errorMeta, ...meta });
  }

  warn(message, meta = {}) {
    logger.warn(message, { context: this.context, ...meta });
  }

  debug(message, meta = {}) {
    logger.debug(message, { context: this.context, ...meta });
  }

  auth(action, userId, meta = {}) {
    logger.info(`Auth: ${action}`, {
      context: 'Auth',
      userId,
      ...meta
    });
  }

  security(event, details = {}) {
    logger.warn(`Security: ${event}`, {
      context: 'Security',
      ...details
    });
  }

  http(message, meta = {}) {
    logger.info(message, { context: 'HTTP', ...meta });
  }
}

// Create default logger instance
const defaultLogger = new Logger();

module.exports = {
  Logger,
  logger: defaultLogger,
  createLogger: (context) => new Logger(context),
  winston: logger
};