const logger = require('../config/logger');
const AppError = require('../utils/appError');

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate response
 * NEVER crashes the server - always recovers gracefully
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.logError(err, req, {
        timestamp: new Date().toISOString(),
        errorType: err.constructor.name
    });

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let isOperational = err.isOperational || false;

    // Handle specific error types
    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        const errors = err.errors?.map(e => ({
            field: e.path,
            message: e.message
        }));

        return res.status(statusCode).json({
            success: false,
            error: 'VALIDATION_ERROR',
            message,
            errors
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Duplicate Entry';
        const field = err.errors?.[0]?.path || 'unknown';

        return res.status(statusCode).json({
            success: false,
            error: 'DUPLICATE_ERROR',
            message: `${field} already exists`,
            field
        });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Invalid reference';

        return res.status(statusCode).json({
            success: false,
            error: 'FOREIGN_KEY_ERROR',
            message: 'Referenced record does not exist'
        });
    }

    if (err.name === 'SequelizeDatabaseError') {
        statusCode = 500;
        message = 'Database operation failed';

        logger.logDatabaseError(err, 'Database Error', {
            sql: err.sql,
            parameters: err.parameters
        });

        return res.status(statusCode).json({
            success: false,
            error: 'DATABASE_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'Database operation failed'
                : err.message
        });
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';

        return res.status(statusCode).json({
            success: false,
            error: 'INVALID_TOKEN',
            message
        });
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';

        return res.status(statusCode).json({
            success: false,
            error: 'TOKEN_EXPIRED',
            message
        });
    }

    if (err.name === 'MulterError') {
        statusCode = 400;
        const multerErrors = {
            'LIMIT_FILE_SIZE': 'File size too large',
            'LIMIT_FILE_COUNT': 'Too many files',
            'LIMIT_UNEXPECTED_FILE': 'Unexpected file field'
        };
        message = multerErrors[err.code] || 'File upload error';

        return res.status(statusCode).json({
            success: false,
            error: 'FILE_UPLOAD_ERROR',
            message
        });
    }

    if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON in request body';

        return res.status(statusCode).json({
            success: false,
            error: 'INVALID_JSON',
            message
        });
    }

    // Handle custom AppError
    if (err instanceof AppError) {
        return res.status(statusCode).json({
            success: false,
            error: err.code || 'APPLICATION_ERROR',
            message: err.message
        });
    }

    // Log critical errors (non-operational errors)
    if (!isOperational) {
        logger.error('CRITICAL ERROR - Non-operational error occurred', {
            error: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userId: req.user?.id
        });
    }

    // Send error response
    const response = {
        success: false,
        error: 'SERVER_ERROR',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred while processing your request'
            : message
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
        response.details = {
            name: err.name,
            isOperational,
            originalMessage: err.message
        };
    }

    res.status(statusCode).json(response);
};

/**
 * Handle 404 - Not Found errors
 */
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);

    logger.warn('404 Not Found', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Route ${req.originalUrl} not found`
    });
};

/**
 * Async error wrapper - wraps async route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Safe async wrapper with automatic error recovery
 */
const safeAsync = (fn, fallbackResponse = null) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            logger.logError(error, req, {
                handler: 'safeAsync',
                fallbackProvided: !!fallbackResponse
            });

            // If response already sent, just log and continue
            if (res.headersSent) {
                logger.warn('Headers already sent, cannot send error response');
                return;
            }

            // If fallback response provided, use it
            if (fallbackResponse) {
                return res.status(500).json({
                    success: false,
                    error: 'OPERATION_FAILED',
                    message: 'Operation failed but service continues',
                    ...fallbackResponse
                });
            }

            // Otherwise, pass to error handler
            next(error);
        }
    };
};

/**
 * Validate request body/params with custom validator
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        try {
            const { error, value } = schema.validate(req[property], {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }));

                return res.status(400).json({
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    errors
                });
            }

            // Replace with validated value
            req[property] = value;
            next();
        } catch (err) {
            logger.logError(err, req, { middleware: 'validate' });
            next(err);
        }
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    safeAsync,
    validate
};
