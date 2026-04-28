// Load environment variables first
require('dotenv').config();

// Enterprise imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Shared utilities
const config = require('./utils/config');
const { logger, createLogger } = require('./utils/logger');
const { errorHandler, asyncHandler } = require('./utils/errors');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const quizRoutes = require('./routes/quiz');
const contentRoutes = require('./routes/content');
const timelineRoutes = require('./routes/timeline');
const faqRoutes = require('./routes/faq');
const eligibilityRoutes = require('./routes/eligibility-india');
const adminRoutes = require('./routes/admin');
const siteRoutes = require('./routes/site');
const analyticsRoutes = require('./routes/analytics');
const dashboardRoutes = require('./routes/dashboard');

// Import middleware
const { authenticate } = require('./middleware/auth');
const { validate } = require('./middleware/validation');
const { cacheMiddleware } = require('./middleware/cache');
const { cacheMiddleware: redisCacheMiddleware, initializeRedis } = require('./utils/redis-cache');
const { securityHeaders, requestId, xssProtection } = require('./middleware/security');
const { requestTiming, metricsCollector } = require('./middleware/performance');
const { 
  advancedXSSProtection, 
  mongoSanitize, 
  hpp, 
  preventSQLInjection,
  secureHeaders: enhancedSecureHeaders
} = require('./middleware/security-enhanced');

const app = express();
const serverLogger = createLogger('Server');

// Initialize Redis if available
if (process.env.REDIS_URL) {
  initializeRedis().catch(err => {
    serverLogger.warn('Redis initialization failed, using in-memory cache', { error: err.message });
  });
}

// Enterprise middleware setup
const setupMiddleware = (app) => {
  // Trust proxy for accurate IP addresses
  if (config.get('server.trustProxy')) {
    app.set('trust proxy', 1);
  }

  // Compression middleware
  if (config.get('performance.compression')) {
    app.use(compression({
      level: config.get('performance.compressionLevel'),
      threshold: 1024,
    }));
  }

  // Security middleware
  app.use(helmet(config.getSecurityConfig().helmet));
  app.use(enhancedSecureHeaders);
  app.use(securityHeaders);
  app.use(requestId);
  app.use(mongoSanitize);
  app.use(hpp);
  app.use(advancedXSSProtection);
  app.use(preventSQLInjection);
  app.use(xssProtection);

  // Performance monitoring
  app.use(requestTiming);
  app.use(metricsCollector());

  // CORS configuration
  const corsOrigins = config.get('server.corsOrigin').split(',').map(origin => origin.trim());
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-Request-ID',
      'x-request-id',
      'x-session-id',
      'X-Session-ID'
    ],
    exposedHeaders: ['X-Request-ID', 'x-request-id'],
  }));

  // Request parsing
  app.use(express.json({ 
    limit: config.get('performance.bodyLimit'),
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: config.get('performance.bodyLimit') 
  }));

  // Request logging
  const morganFormat = config.isDevelopment() ? 'dev' : 'combined';
  app.use(morgan(morganFormat, {
    stream: {
      write: (message) => {
        logger.http(message.trim());
      }
    }
  }));

  // Rate limiting
  const rateLimitConfig = config.getRateLimitConfig();
  const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    message: {
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: rateLimitConfig.skipSuccessfulRequests,
    handler: (req, res) => {
      logger.security('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        }
      });
    }
  });

  app.use(limiter);

  // Request timeout
  app.use((req, res, next) => {
    req.setTimeout(config.get('performance.requestTimeout'), () => {
      logger.warn('Request timeout', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
      });
      
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: {
            message: 'Request timeout',
            code: 'REQUEST_TIMEOUT'
          }
        });
      }
    });
    next();
  });

  // Request ID middleware
  app.use((req, res, next) => {
    req.id = require('crypto').randomUUID();
    res.setHeader('X-Request-ID', req.id);
    next();
  });
};

// Setup routes with caching
const setupRoutes = (app) => {
  // Health check endpoint
  app.get('/health', asyncHandler(async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      memory: process.memoryUsage(),
      environment: config.get('NODE_ENV'),
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(health);
  }));

  // API status endpoint
  app.get('/api/status', asyncHandler(async (req, res) => {
    const status = {
      api: 'Election Education API',
      version: '2.0.0',
      status: 'operational',
      features: {
        authentication: true,
        firebase: config.get('firebase.enabled'),
        chatbot: config.isFeatureEnabled('chatbot'),
        analytics: config.isFeatureEnabled('analytics'),
      },
      endpoints: {
        auth: '/api/auth',
        content: '/api/content',
        quiz: '/api/quiz',
        chat: '/api/chat',
        timeline: '/api/timeline',
        faq: '/api/faq',
        admin: '/api/admin'
      }
    };

    res.json(status);
  }));

  // Apply caching to appropriate routes
  app.use('/api/site', redisCacheMiddleware(600), cacheMiddleware(600)); // 10 minutes
  app.use('/api/content', redisCacheMiddleware(300), cacheMiddleware(300)); // 5 minutes
  app.use('/api/faq', redisCacheMiddleware(300), cacheMiddleware(300)); // 5 minutes
  app.use('/api/timeline', redisCacheMiddleware(300), cacheMiddleware(300)); // 5 minutes

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/quiz', quizRoutes);
  app.use('/api/content', contentRoutes);
  app.use('/api/timeline', timelineRoutes);
  app.use('/api/faq', faqRoutes);
  app.use('/api/eligibility', eligibilityRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/site', siteRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: 'API endpoint not found',
        code: 'ENDPOINT_NOT_FOUND',
        path: req.originalUrl
      }
    });
  });

  // Global error handler
  app.use(errorHandler);
};

// Database connection with retry logic
const connectDatabase = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(config.get('database.uri'), {
        ...config.get('database.options'),
        bufferCommands: false,
      });

      serverLogger.info('✅ Connected to MongoDB', {
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });

      // Setup database event listeners
      mongoose.connection.on('error', (error) => {
        serverLogger.error('MongoDB connection error', error);
      });

      mongoose.connection.on('disconnected', () => {
        serverLogger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        serverLogger.info('MongoDB reconnected');
      });

      return;
    } catch (error) {
      retries++;
      serverLogger.error(`MongoDB connection attempt ${retries}/${maxRetries} failed`, error);

      if (retries === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    }
  }
};

// Graceful shutdown
const setupGracefulShutdown = (server) => {
  const shutdown = (signal) => {
    serverLogger.info(`Received ${signal}, starting graceful shutdown`);

    server.close(() => {
      serverLogger.info('HTTP server closed');

      mongoose.connection.close(() => {
        serverLogger.info('MongoDB connection closed');
        process.exit(0);
      });
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      serverLogger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Initialize application
const initializeApp = async () => {
  try {
    // Setup middleware
    setupMiddleware(app);

    // Connect to database
    await connectDatabase();

    // Setup routes
    setupRoutes(app);

    // Start server - Use Cloud Run's PORT or fallback to config
    const PORT = process.env.PORT || config.get('server.port');
    const server = app.listen(PORT, () => {
      serverLogger.info('🚀 Server started successfully', {
        port: PORT,
        environment: config.get('NODE_ENV'),
        features: {
          firebase: config.get('firebase.enabled'),
          chatbot: config.isFeatureEnabled('chatbot'),
          analytics: config.isFeatureEnabled('analytics'),
        }
      });
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);

    return server;
  } catch (error) {
    serverLogger.error('Failed to initialize application', error);
    process.exit(1);
  }
};

// Start the application
if (require.main === module) {
  initializeApp();
}

module.exports = { app, initializeApp };