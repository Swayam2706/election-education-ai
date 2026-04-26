/**
 * Standardized API Response Utilities
 * Ensures consistent response format across all endpoints
 */

class ApiResponse {
  static success(res, data, message = null, statusCode = 200) {
    const response = {
      success: true,
      data
    };

    if (message) {
      response.message = message;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message, code = 'ERROR', statusCode = 500, details = null) {
    const response = {
      success: false,
      error: {
        message,
        code
      }
    };

    if (details) {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, errors) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors
      }
    });
  }

  static notFound(res, resource = 'Resource') {
    return res.status(404).json({
      success: false,
      error: {
        message: `${resource} not found`,
        code: 'NOT_FOUND'
      }
    });
  }

  static unauthorized(res, message = 'Authentication required') {
    return res.status(401).json({
      success: false,
      error: {
        message,
        code: 'UNAUTHORIZED'
      }
    });
  }

  static forbidden(res, message = 'Insufficient permissions') {
    return res.status(403).json({
      success: false,
      error: {
        message,
        code: 'FORBIDDEN'
      }
    });
  }

  static conflict(res, message = 'Resource conflict') {
    return res.status(409).json({
      success: false,
      error: {
        message,
        code: 'CONFLICT'
      }
    });
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      }
    });
  }
}

module.exports = ApiResponse;
