const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const code =
    err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
  const message =
    err.message ||
    (statusCode === 500 ? 'An unexpected error occurred' : 'Request failed');

  if (statusCode >= 500) {
    logger.error(err);
  }

  const payload = {
    error: {
      code,
      message,
    },
  };

  if (err.details) {
    payload.error.details = err.details;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorMiddleware;
