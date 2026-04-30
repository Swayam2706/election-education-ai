/**
 * API Documentation Middleware
 * Provides comprehensive API documentation and health monitoring
 */

const { logger } = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * API documentation endpoint
 * Returns comprehensive API documentation
 */
const getAPIDocumentation = (req, res) => {
  const documentation = {
    api: 'Election Education Platform API',
    version: '2.0.0',
    description: 'Enterprise-grade REST API for election education and civic engagement',
    baseURL: process.env.API_URL || 'http://localhost:5001/api',
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      endpoints: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        googleAuth: 'POST /api/auth/google',
        refresh: 'POST /api/auth/refresh',
      },
    },
    endpoints: {
      auth: {
        login: {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate user with email and password',
          body: {
            email: 'string (required)',
            password: 'string (required)',
          },
          response: {
            success: 'boolean',
            data: {
              token: 'string',
              user: 'object',
            },
          },
        },
        register: {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register new user account',
          body: {
            name: 'string (required)',
            email: 'string (required)',
            password: 'string (required)',
            confirmPassword: 'string (required)',
          },
          response: {
            success: 'boolean',
            data: {
              token: 'string',
              user: 'object',
            },
          },
        },
      },
      content: {
        list: {
          method: 'GET',
          path: '/api/content',
          description: 'Get list of educational content',
          query: {
            page: 'number (optional, default: 1)',
            limit: 'number (optional, default: 20)',
            category: 'string (optional)',
            search: 'string (optional)',
          },
          response: {
            success: 'boolean',
            data: {
              content: 'array',
              pagination: 'object',
            },
          },
        },
        detail: {
          method: 'GET',
          path: '/api/content/:slug',
          description: 'Get specific content by slug',
          params: {
            slug: 'string (required)',
          },
          response: {
            success: 'boolean',
            data: {
              content: 'object',
            },
          },
        },
      },
      quiz: {
        list: {
          method: 'GET',
          path: '/api/quiz',
          description: 'Get list of quizzes',
          query: {
            category: 'string (optional)',
            difficulty: 'string (optional)',
          },
          response: {
            success: 'boolean',
            data: {
              quizzes: 'array',
            },
          },
        },
        detail: {
          method: 'GET',
          path: '/api/quiz/:id',
          description: 'Get specific quiz',
          params: {
            id: 'string (required)',
          },
          response: {
            success: 'boolean',
            data: {
              quiz: 'object',
            },
          },
        },
        submit: {
          method: 'POST',
          path: '/api/quiz/:id/submit',
          description: 'Submit quiz answers',
          authentication: 'required',
          params: {
            id: 'string (required)',
          },
          body: {
            answers: 'array (required)',
            timeSpent: 'number (required)',
          },
          response: {
            success: 'boolean',
            data: {
              score: 'number',
              percentage: 'number',
              passed: 'boolean',
              results: 'array',
            },
          },
        },
      },
      chat: {
        send: {
          method: 'POST',
          path: '/api/chat/send',
          description: 'Send message to AI assistant',
          authentication: 'required',
          body: {
            message: 'string (required)',
            chatId: 'string (optional)',
          },
          response: {
            success: 'boolean',
            data: {
              message: 'string',
              sessionId: 'string',
            },
          },
        },
        history: {
          method: 'GET',
          path: '/api/chat/history',
          description: 'Get chat history',
          authentication: 'required',
          response: {
            success: 'boolean',
            data: {
              chats: 'array',
            },
          },
        },
      },
      timeline: {
        list: {
          method: 'GET',
          path: '/api/timeline',
          description: 'Get election timeline events',
          response: {
            success: 'boolean',
            data: {
              events: 'array',
            },
          },
        },
      },
      faq: {
        list: {
          method: 'GET',
          path: '/api/faq',
          description: 'Get frequently asked questions',
          query: {
            category: 'string (optional)',
            search: 'string (optional)',
          },
          response: {
            success: 'boolean',
            data: {
              faqs: 'array',
            },
          },
        },
      },
      eligibility: {
        check: {
          method: 'POST',
          path: '/api/eligibility/check',
          description: 'Check voter eligibility',
          body: {
            age: 'number (optional)',
            citizenship: 'string (optional)',
            state: 'string (optional)',
            registrationStatus: 'string (optional)',
          },
          response: {
            success: 'boolean',
            data: {
              eligible: 'boolean',
              reasons: 'array',
              recommendations: 'array',
              nextSteps: 'array',
              resources: 'array',
            },
          },
        },
      },
    },
    errorCodes: {
      VALIDATION_ERROR: 'Request validation failed',
      AUTHENTICATION_ERROR: 'Authentication failed',
      AUTHORIZATION_ERROR: 'Insufficient permissions',
      NOT_FOUND: 'Resource not found',
      RATE_LIMIT_EXCEEDED: 'Too many requests',
      SERVER_ERROR: 'Internal server error',
    },
    rateLimits: {
      default: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes',
      chat: '20 requests per minute',
    },
    support: {
      email: 'support@electedu.com',
      documentation: 'https://docs.electedu.com',
      github: 'https://github.com/Swayam2706/election-education-ai',
    },
  };

  res.json(documentation);
};

/**
 * Enhanced health check endpoint
 * Returns comprehensive system health information
 */
const getHealthCheck = async (req, res) => {
  const startTime = Date.now();

  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbLatency = await measureDatabaseLatency();

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    };

    // Check CPU usage
    const cpuUsage = process.cpuUsage();

    // Calculate uptime
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);

    // Get environment info
    const environment = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV || 'development',
    };

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Determine overall health status
    const isHealthy = dbStatus === 'connected' && 
                      memoryUsageMB.heapUsed < 500 && 
                      dbLatency < 100;

    const health = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptime),
      responseTime: `${responseTime}ms`,
      version: '2.0.0',
      environment,
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`,
        host: mongoose.connection.host || 'unknown',
        name: mongoose.connection.name || 'unknown',
      },
      memory: {
        ...memoryUsageMB,
        unit: 'MB',
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000),
        unit: 'microseconds',
      },
      features: {
        authentication: true,
        firebase: !!process.env.FIREBASE_PROJECT_ID,
        geminiAI: !!process.env.GEMINI_API_KEY,
        redis: !!process.env.REDIS_URL,
        analytics: true,
      },
    };

    // Log health check
    logger.debug('Health check performed', {
      status: health.status,
      responseTime,
      dbLatency,
    });

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed', { error });

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Measures database latency
 * @returns {Promise<number>} Latency in milliseconds
 */
async function measureDatabaseLatency() {
  const start = Date.now();
  
  try {
    await mongoose.connection.db.admin().ping();
    return Date.now() - start;
  } catch (error) {
    logger.error('Database ping failed', { error });
    return -1;
  }
}

/**
 * Formats uptime in human-readable format
 * @param {number} seconds - Uptime in seconds
 * @returns {string} Formatted uptime
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Readiness check endpoint
 * Returns whether the service is ready to accept traffic
 */
const getReadinessCheck = async (req, res) => {
  try {
    // Check if database is connected
    const dbReady = mongoose.connection.readyState === 1;

    // Check if critical services are available
    const servicesReady = {
      database: dbReady,
      geminiAI: !!process.env.GEMINI_API_KEY,
    };

    const isReady = Object.values(servicesReady).every(status => status);

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      timestamp: new Date().toISOString(),
      services: servicesReady,
    });
  } catch (error) {
    logger.error('Readiness check failed', { error });

    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Liveness check endpoint
 * Returns whether the service is alive
 */
const getLivenessCheck = (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Metrics endpoint
 * Returns application metrics
 */
const getMetrics = async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      database: {
        status: mongoose.connection.readyState,
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
      },
    };

    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed', { error });

    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message,
    });
  }
};

module.exports = {
  getAPIDocumentation,
  getHealthCheck,
  getReadinessCheck,
  getLivenessCheck,
  getMetrics,
};
