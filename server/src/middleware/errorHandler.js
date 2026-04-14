const logger = require('../services/logger');

// 404 handler – must come after all routes
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// Global error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  if (statusCode >= 500) logger.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
