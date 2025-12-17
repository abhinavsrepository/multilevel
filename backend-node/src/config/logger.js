const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }

        // Add stack trace for errors
        if (stack) {
            msg += `\n${stack}`;
        }

        return msg;
    })
);

// Console format with colors
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        let msg = `${timestamp} ${level}: ${message}`;
        if (stack) {
            msg += `\n${stack}`;
        }
        return msg;
    })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Configure transports
const transports = [
    // Console transport
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),

    // Error logs - daily rotation
    new DailyRotateFile({
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '30d',
        zippedArchive: true
    }),

    // Combined logs - daily rotation
    new DailyRotateFile({
        filename: path.join(logsDir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '14d',
        zippedArchive: true
    }),

    // Application logs - daily rotation
    new DailyRotateFile({
        filename: path.join(logsDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        format: logFormat,
        maxSize: '20m',
        maxFiles: '7d',
        zippedArchive: true
    })
];

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports,
    exitOnError: false, // Do not exit on handled exceptions
    exceptionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            format: logFormat,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            filename: path.join(logsDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            format: logFormat,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ]
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Helper functions for structured logging
logger.logRequest = (req, message = 'HTTP Request') => {
    logger.info(message, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user?.id,
        userAgent: req.get('user-agent')
    });
};

logger.logError = (error, req = null, additionalInfo = {}) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...additionalInfo
    };

    if (req) {
        errorLog.request = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user?.id,
            body: req.body,
            params: req.params,
            query: req.query
        };
    }

    logger.error('Application Error', errorLog);
};

logger.logDatabaseError = (error, operation, additionalInfo = {}) => {
    logger.error('Database Error', {
        operation,
        message: error.message,
        stack: error.stack,
        ...additionalInfo
    });
};

logger.logSecurityEvent = (event, req, details = {}) => {
    logger.warn('Security Event', {
        event,
        ip: req?.ip,
        userId: req?.user?.id,
        url: req?.originalUrl,
        ...details
    });
};

// Production environment specific configuration
if (process.env.NODE_ENV === 'production') {
    // Add additional production-specific transports if needed
    logger.info('Logger initialized in PRODUCTION mode');
} else {
    logger.info('Logger initialized in DEVELOPMENT mode');
}

module.exports = logger;
