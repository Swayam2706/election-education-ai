// Database query optimization utilities

/**
 * Build optimized MongoDB query with pagination
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query results with pagination
 */
async function paginatedQuery(model, filter = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { createdAt: -1 },
    select = '',
    populate = null,
    lean = true
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query
  let query = model.find(filter);

  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);
  if (lean) query = query.lean();

  // Execute queries in parallel
  const [data, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(parseInt(limit)),
    model.countDocuments(filter)
  ]);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hasNext: skip + data.length < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Build search filter with multiple fields
 * @param {string} searchTerm - Search term
 * @param {Array<string>} fields - Fields to search
 * @returns {Object} MongoDB filter
 */
function buildSearchFilter(searchTerm, fields = []) {
  if (!searchTerm || !searchTerm.trim() || fields.length === 0) {
    return {};
  }

  const regex = new RegExp(searchTerm.trim(), 'i');
  
  return {
    $or: fields.map(field => {
      // Handle array fields differently
      if (field.includes('tags') || field.includes('categories')) {
        return { [field]: { $in: [regex] } };
      }
      return { [field]: regex };
    })
  };
}

/**
 * Optimize query with indexes
 * @param {Object} model - Mongoose model
 * @param {Array<string>} fields - Fields to index
 */
async function ensureIndexes(model, fields = []) {
  const indexes = [];

  for (const field of fields) {
    if (typeof field === 'string') {
      indexes.push({ [field]: 1 });
    } else if (typeof field === 'object') {
      indexes.push(field);
    }
  }

  for (const index of indexes) {
    try {
      await model.collection.createIndex(index);
    } catch (error) {
      console.error(`Failed to create index ${JSON.stringify(index)}:`, error.message);
    }
  }
}

/**
 * Batch operations for better performance
 * @param {Array} items - Items to process
 * @param {Function} operation - Async operation to perform
 * @param {number} batchSize - Batch size
 * @returns {Promise<Array>} Results
 */
async function batchOperation(items, operation, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => operation(item))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Aggregate with pagination
 * @param {Object} model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Aggregation results with pagination
 */
async function paginatedAggregate(model, pipeline = [], options = {}) {
  const {
    page = 1,
    limit = 20
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Count total documents
  const countPipeline = [
    ...pipeline,
    { $count: 'total' }
  ];

  // Data pipeline with pagination
  const dataPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: parseInt(limit) }
  ];

  // Execute in parallel
  const [countResult, data] = await Promise.all([
    model.aggregate(countPipeline),
    model.aggregate(dataPipeline)
  ]);

  const total = countResult[0]?.total || 0;

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hasNext: skip + data.length < total,
      hasPrev: page > 1
    }
  };
}

/**
 * Query performance monitor
 */
class QueryMonitor {
  constructor() {
    this.queries = [];
    this.slowQueryThreshold = 1000; // 1 second
  }

  start(queryName) {
    return {
      name: queryName,
      startTime: Date.now()
    };
  }

  end(query) {
    const duration = Date.now() - query.startTime;
    
    this.queries.push({
      name: query.name,
      duration,
      timestamp: new Date()
    });

    if (duration > this.slowQueryThreshold) {
      console.warn(`Slow query detected: ${query.name} took ${duration}ms`);
    }

    return duration;
  }

  getStats() {
    if (this.queries.length === 0) {
      return { count: 0, avgDuration: 0, slowQueries: 0 };
    }

    const total = this.queries.reduce((sum, q) => sum + q.duration, 0);
    const slowQueries = this.queries.filter(q => q.duration > this.slowQueryThreshold);

    return {
      count: this.queries.length,
      avgDuration: Math.round(total / this.queries.length),
      slowQueries: slowQueries.length,
      slowestQuery: this.queries.reduce((max, q) => 
        q.duration > max.duration ? q : max
      )
    };
  }

  clear() {
    this.queries = [];
  }
}

// Create singleton monitor
const queryMonitor = new QueryMonitor();

module.exports = {
  paginatedQuery,
  buildSearchFilter,
  ensureIndexes,
  batchOperation,
  paginatedAggregate,
  queryMonitor,
  QueryMonitor
};
