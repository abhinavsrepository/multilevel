const logger = require('../config/logger');

/**
 * Request logging middleware
 * Logs all incoming requests with details
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log request
    const requestLog = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    };

    // Don't log sensitive data
    if (req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = { ...req.body };
        // Remove sensitive fields
        delete sanitizedBody.password;
        delete sanitizedBody.confirmPassword;
        delete sanitizedBody.currentPassword;
        delete sanitizedBody.newPassword;
        delete sanitizedBody.token;
        delete sanitizedBody.refreshToken;
        delete sanitizedBody.apiKey;

        if (Object.keys(sanitizedBody).length > 0) {
            requestLog.body = sanitizedBody;
        }
    }

    logger.info('Incoming Request', requestLog);

    // Capture response
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;

        const responseLog = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id
        };

        // Log based on status code
        if (res.statusCode >= 500) {
            logger.error('Server Error Response', responseLog);
        } else if (res.statusCode >= 400) {
            logger.warn('Client Error Response', responseLog);
        } else {
            logger.info('Successful Response', responseLog);
        }

        res.send = originalSend;
        return originalSend.call(this, data);
    };

    next();
};

/**
 * Performance monitoring middleware
 */
const performanceLogger = (req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Log slow requests (> 1 second)
        if (duration > 1000) {
            logger.warn('Slow Request Detected', {
                method: req.method,
                url: req.originalUrl,
                duration: `${duration.toFixed(2)}ms`,
                statusCode: res.statusCode,
                userId: req.user?.id
            });
        }

        // Log very slow requests (> 5 seconds)
        if (duration > 5000) {
            logger.error('Very Slow Request Detected', {
                method: req.method,
                url: req.originalUrl,
                duration: `${duration.toFixed(2)}ms`,
                statusCode: res.statusCode,
                userId: req.user?.id,
                query: req.query,
                params: req.params
            });
        }
    });

    next();
};

/**
 * Security event logger
 */
const securityLogger = (event) => {
    return (req, res, next) => {
        logger.logSecurityEvent(event, req, {
            timestamp: new Date().toISOString()
        });
        next();
    };
};

/**
 * Rate limit logger
 */
const rateLimitLogger = (req, res, next) => {
    if (req.rateLimit) {
        const { limit, current, remaining } = req.rateLimit;

        if (remaining < 10) {
            logger.warn('Rate Limit Warning', {
                ip: req.ip,
                userId: req.user?.id,
                limit,
                current,
                remaining,
                url: req.originalUrl
            });
        }

        if (remaining === 0) {
            logger.error('Rate Limit Exceeded', {
                ip: req.ip,
                userId: req.user?.id,
                limit,
                url: req.originalUrl
            });
        }
    }

    next();
};

/**
 * Database query logger
 */
const queryLogger = (query, options) => {
    if (process.env.NODE_ENV !== 'production') {
        const duration = options?.benchmark || 0;

        if (duration > 1000) {
            logger.warn('Slow Database Query', {
                duration: `${duration}ms`,
                query: query.substring(0, 200) // Truncate long queries
            });
        }
    }
};

module.exports = {
    requestLogger,
    performanceLogger,
    securityLogger,
    rateLimitLogger,
    queryLogger
};
