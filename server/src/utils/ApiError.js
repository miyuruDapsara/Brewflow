class ApiError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'AUTHENTICATION_ERROR', message);
  }

  static forbidden(message = 'Insufficient permissions') {
    return new ApiError(403, 'AUTHORIZATION_ERROR', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message, details) {
    return new ApiError(409, 'CONFLICT_ERROR', message, details);
  }

  static internal(message = 'An unexpected error occurred') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

module.exports = ApiError;
