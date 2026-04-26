// In-memory cache utility for backend optimization

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = 300000) { // Default 5 minutes
    this.cache.set(key, value);
    
    if (ttl > 0) {
      const expiresAt = Date.now() + ttl;
      this.ttls.set(key, expiresAt);
      
      // Auto-cleanup after TTL
      setTimeout(() => {
        this.delete(key);
      }, ttl);
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(key) {
    // Check if expired
    if (this.ttls.has(key)) {
      const expiresAt = this.ttls.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return null;
      }
    }

    return this.cache.get(key) || null;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!this.cache.has(key)) return false;

    // Check expiration
    if (this.ttls.has(key)) {
      const expiresAt = this.ttls.get(key);
      if (Date.now() > expiresAt) {
        this.delete(key);
        return false;
      }
    }

    return true;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this._estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage (rough approximation)
   * @private
   */
  _estimateMemoryUsage() {
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += key.length * 2; // Rough estimate for string
      size += JSON.stringify(value).length * 2;
    }
    return `${(size / 1024).toFixed(2)} KB`;
  }

  /**
   * Wrap an async function with caching
   * @param {string} key - Cache key
   * @param {Function} fn - Async function to execute
   * @param {number} ttl - Time to live in milliseconds
   * @returns {Promise<any>}
   */
  async wrap(key, fn, ttl = 300000) {
    // Check cache first
    if (this.has(key)) {
      return this.get(key);
    }

    // Execute function and cache result
    const result = await fn();
    this.set(key, result, ttl);
    return result;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

// Cache middleware factory
const cacheMiddleware = (ttl = 300000) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl || req.url}`;
    const cached = cacheManager.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = (data) => {
      cacheManager.set(key, data, ttl);
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Invalidate cache by pattern
const invalidateCache = (pattern) => {
  const keys = Array.from(cacheManager.cache.keys());
  const regex = new RegExp(pattern);
  
  keys.forEach(key => {
    if (regex.test(key)) {
      cacheManager.delete(key);
    }
  });
};

module.exports = {
  cacheManager,
  cacheMiddleware,
  invalidateCache
};
