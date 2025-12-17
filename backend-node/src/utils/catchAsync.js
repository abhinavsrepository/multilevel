const logger = require('../config/logger');

/**
 * Wrapper for async route handlers
 * Catches errors and passes them to the global error handler
 * Prevents server crashes from unhandled promise rejections
 */
module.exports = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(err => {
            // Log the error for debugging
            logger.error('Async route handler error', {
                route: req.originalUrl,
                method: req.method,
                error: err.message,
                stack: err.stack,
                userId: req.user?.id
            });

            // Pass to error handler
            next(err);
        });
    };
};
