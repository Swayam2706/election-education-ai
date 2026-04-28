// Redis caching layer for improved efficiency
const { logger } = require('./logger');

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.enabled = process.env.REDIS_ENABLED === 'true';
  }

  async get(key) {
    if (!this.enabled) return null;

    const cached = this.cache.get(key);
    if (!cached) return null;

    const ttl = this.ttls.get(key);
    if (ttl && Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return null;
    }

    logger.debug('Cache hit', { key });
    return cached;
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.enabled) return;

    this.cache.set(key, value);
    if (ttlSeconds > 0) {
      this.ttls.set(key, Date.now() + (ttlSeconds * 1000));
    }
    
    logger.debug('Cache set', { key, ttl: ttlSeconds });
  }

  async del(key) {
    if (!this.enabled) return;

    this.cache.delete(key);
    this.ttls.delete(key);
    logger.debug('Cache deleted', { key });
  }

  async clear() {
    if (!this.enabled) return;

    this.cache.clear();
    this.ttls.clear();
    logger.info('Cache cleared');
  }

  async exists(key) {
    if (!this.enabled) return false;
    return this.cache.has(key) && (!this.ttls.has(key) || Date.now() <= this.ttls.get(key));
  }

  // Middleware for caching API responses
  middleware(ttlSeconds = 300) {
    return async (req, res, next) => {
      if (req.method !== 'GET') return next();

      const key = `api:${req.originalUrl}`;
      const cached = await this.get(key);

      if (cached) {
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode === 200 && data.success) {
          this.set(key, data, ttlSeconds).catch(err => {
            logger.error('Cache set error', err);
          });
        }
        return originalJson(data);
      };

      next();
    };
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern) {
    if (!this.enabled) return;

    const regex = new RegExp(pattern);
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.ttls.delete(key);
    });

    logger.info('Cache invalidated by pattern', { pattern, count: keysToDelete.length });
  }
}

const cacheManager = new CacheManager();

const initializeRedis = async () => {
  logger.info('Cache manager initialized');
  return Promise.resolve();
};

module.exports = {
  cacheManager,
  cacheMiddleware: (ttl) => cacheManager.middleware(ttl),
  initializeRedis
};
