// Response compression utilities

const zlib = require('zlib');
const { promisify } = require('util');
const { logger } = require('./logger');

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

/**
 * Compress data using gzip
 * @param {string|Buffer} data - Data to compress
 * @returns {Promise<Buffer>}
 */
async function compressGzip(data) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return await gzip(buffer);
}

/**
 * Compress data using brotli
 * @param {string|Buffer} data - Data to compress
 * @returns {Promise<Buffer>}
 */
async function compressBrotli(data) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  return await brotli(buffer);
}

/**
 * Smart compression middleware
 * Automatically chooses best compression based on client support
 */
function smartCompression(options = {}) {
  const {
    threshold = 1024, // Only compress responses larger than 1KB
    level = 6, // Compression level (0-9)
  } = options;

  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override json method
    res.json = async function(data) {
      const jsonString = JSON.stringify(data);
      
      // Check if response is large enough to compress
      if (jsonString.length < threshold) {
        return originalJson(data);
      }

      // Check client support
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      try {
        if (acceptEncoding.includes('br')) {
          // Use Brotli (best compression)
          const compressed = await compressBrotli(jsonString);
          res.setHeader('Content-Encoding', 'br');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Vary', 'Accept-Encoding');
          res.setHeader('X-Compression', 'brotli');
          res.setHeader('X-Original-Size', jsonString.length);
          res.setHeader('X-Compressed-Size', compressed.length);
          return res.send(compressed);
        } else if (acceptEncoding.includes('gzip')) {
          // Use Gzip (good compression, widely supported)
          const compressed = await compressGzip(jsonString);
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Vary', 'Accept-Encoding');
          res.setHeader('X-Compression', 'gzip');
          res.setHeader('X-Original-Size', jsonString.length);
          res.setHeader('X-Compressed-Size', compressed.length);
          return res.send(compressed);
        }
      } catch (error) {
        logger.error('Compression error', { error });
      }

      // Fallback to uncompressed
      return originalJson(data);
    };

    next();
  };
}

/**
 * Calculate compression ratio
 * @param {number} original - Original size
 * @param {number} compressed - Compressed size
 * @returns {string} Compression ratio as percentage
 */
function compressionRatio(original, compressed) {
  const ratio = ((original - compressed) / original) * 100;
  return `${ratio.toFixed(2)}%`;
}

module.exports = {
  compressGzip,
  compressBrotli,
  smartCompression,
  compressionRatio
};
