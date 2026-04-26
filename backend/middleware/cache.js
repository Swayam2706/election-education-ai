// Simple cache middleware
const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 600, // 10 minutes
  maxKeys: 1000
});

// Cache middleware for Express
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `http:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  cacheMiddleware,
  cache
};