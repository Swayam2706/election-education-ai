// Performance monitoring middleware

const { logger } = require('../utils/logger');

/**
 * Request timing middleware
 */
function requestTiming(req, res, next) {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to log timing
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Add timing header
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip
      });
    }
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
}

/**
 * Memory usage monitoring
 */
function memoryMonitor() {
  const threshold = 500 * 1024 * 1024; // 500MB
  
  return (req, res, next) => {
    const usage = process.memoryUsage();
    
    if (usage.heapUsed > threshold) {
      logger.warn('High memory usage detected', {
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`
      });
    }
    
    next();
  };
}

/**
 * Request size limiter
 */
function requestSizeLimiter(maxSize = 10 * 1024 * 1024) { // 10MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: {
          message: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize: `${maxSize / 1024 / 1024}MB`
        }
      });
    }
    
    next();
  };
}

/**
 * Response caching headers
 */
function cacheHeaders(maxAge = 300) { // 5 minutes default
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    
    next();
  };
}

/**
 * ETag support for conditional requests
 */
function etagSupport() {
  const crypto = require('crypto');
  
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Generate ETag
      const etag = crypto
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');
      
      res.setHeader('ETag', `"${etag}"`);
      
      // Check if client has cached version
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag === `"${etag}"`) {
        return res.status(304).end();
      }
      
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Connection pooling stats
 */
function connectionStats() {
  const connections = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const current = connections.get(ip) || 0;
    
    connections.set(ip, current + 1);
    
    // Clean up on response end
    res.on('finish', () => {
      const count = connections.get(ip) || 0;
      if (count <= 1) {
        connections.delete(ip);
      } else {
        connections.set(ip, count - 1);
      }
    });
    
    // Warn on too many connections from single IP
    if (current > 10) {
      logger.warn('High connection count from IP', {
        ip,
        connections: current
      });
    }
    
    next();
  };
}

/**
 * Query complexity analyzer
 */
function queryComplexity(maxDepth = 5) {
  return (req, res, next) => {
    const query = req.query;
    
    // Calculate query depth
    const depth = getObjectDepth(query);
    
    if (depth > maxDepth) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Query too complex',
          code: 'QUERY_TOO_COMPLEX',
          maxDepth
        }
      });
    }
    
    next();
  };
}

function getObjectDepth(obj, currentDepth = 0) {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth;
  }
  
  const depths = Object.values(obj).map(value => 
    getObjectDepth(value, currentDepth + 1)
  );
  
  return Math.max(currentDepth, ...depths);
}

/**
 * Performance metrics collector
 */
class PerformanceMetrics {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalDuration: 0,
      slowRequests: 0,
      avgResponseTime: 0
    };
  }
  
  record(duration, isError = false) {
    this.metrics.requests++;
    this.metrics.totalDuration += duration;
    
    if (isError) {
      this.metrics.errors++;
    }
    
    if (duration > 1000) {
      this.metrics.slowRequests++;
    }
    
    this.metrics.avgResponseTime = 
      this.metrics.totalDuration / this.metrics.requests;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      avgResponseTime: Math.round(this.metrics.avgResponseTime),
      errorRate: ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%',
      slowRequestRate: ((this.metrics.slowRequests / this.metrics.requests) * 100).toFixed(2) + '%'
    };
  }
  
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      totalDuration: 0,
      slowRequests: 0,
      avgResponseTime: 0
    };
  }
}

const performanceMetrics = new PerformanceMetrics();

/**
 * Metrics collection middleware
 */
function metricsCollector() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const isError = res.statusCode >= 400;
      performanceMetrics.record(duration, isError);
    });
    
    next();
  };
}

module.exports = {
  requestTiming,
  memoryMonitor,
  requestSizeLimiter,
  cacheHeaders,
  etagSupport,
  connectionStats,
  queryComplexity,
  metricsCollector,
  performanceMetrics,
  PerformanceMetrics
};
