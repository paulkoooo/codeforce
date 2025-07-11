const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Custom application errors
  if (err.status) {
    return res.status(err.status).json({
      error: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
};

module.exports = errorHandler; 