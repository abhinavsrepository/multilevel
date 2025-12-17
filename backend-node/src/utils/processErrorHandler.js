const logger = require('../config/logger');

/**
 * Handles uncaught exceptions and unhandled promise rejections
 * Ensures the server never crashes and continues in production
 */

class ProcessErrorHandler {
    constructor() {
        this.setupHandlers();
    }

    setupHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('UNCAUGHT EXCEPTION - Server will continue', {
                error: error.message,
                stack: error.stack,
                type: 'uncaughtException',
                timestamp: new Date().toISOString()
            });

            // In production, log and continue
            if (process.env.NODE_ENV === 'production') {
                logger.error('Uncaught exception in production - server continues');
            } else {
                // In development, you might want more visibility
                console.error('Uncaught Exception:', error);
            }

            // DO NOT exit - let the server continue
            // This is critical for fault tolerance
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('UNHANDLED PROMISE REJECTION - Server will continue', {
                reason: reason?.message || reason,
                stack: reason?.stack,
                promise: promise.toString(),
                type: 'unhandledRejection',
                timestamp: new Date().toISOString()
            });

            // In production, log and continue
            if (process.env.NODE_ENV === 'production') {
                logger.error('Unhandled rejection in production - server continues');
            } else {
                console.error('Unhandled Rejection:', reason);
            }

            // DO NOT exit - let the server continue
        });

        // Handle warning events
        process.on('warning', (warning) => {
            logger.warn('Process Warning', {
                name: warning.name,
                message: warning.message,
                stack: warning.stack
            });
        });

        // Handle SIGTERM gracefully
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received - Starting graceful shutdown');
            this.gracefulShutdown();
        });

        // Handle SIGINT gracefully (Ctrl+C)
        process.on('SIGINT', () => {
            logger.info('SIGINT signal received - Starting graceful shutdown');
            this.gracefulShutdown();
        });

        // Log process exit
        process.on('exit', (code) => {
            logger.info(`Process exiting with code: ${code}`);
        });

        logger.info('Process error handlers initialized');
    }

    gracefulShutdown() {
        logger.info('Graceful shutdown initiated...');

        // Give ongoing requests time to complete
        setTimeout(() => {
            logger.info('Forcing shutdown after timeout');
            process.exit(0);
        }, 10000); // 10 seconds timeout

        // In a real application, you would:
        // 1. Stop accepting new requests
        // 2. Wait for ongoing requests to complete
        // 3. Close database connections
        // 4. Close other resources
    }

    /**
     * Safely execute async operation with error recovery
     */
    static async safeExecute(operation, fallback = null, context = '') {
        try {
            return await operation();
        } catch (error) {
            logger.error(`Safe execute failed: ${context}`, {
                error: error.message,
                stack: error.stack,
                context,
                hasFallback: !!fallback
            });

            if (fallback !== null) {
                return typeof fallback === 'function' ? fallback() : fallback;
            }

            throw error;
        }
    }

    /**
     * Wrap a function to catch and log errors without crashing
     */
    static wrapSafe(fn, errorCallback = null) {
        return async function (...args) {
            try {
                return await fn(...args);
            } catch (error) {
                logger.error('Wrapped function error', {
                    error: error.message,
                    stack: error.stack,
                    functionName: fn.name
                });

                if (errorCallback) {
                    return errorCallback(error, ...args);
                }

                // Don't throw - just return null/undefined
                return null;
            }
        };
    }

    /**
     * Retry mechanism for critical operations
     */
    static async retryOperation(operation, maxRetries = 3, delay = 1000, context = '') {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                logger.warn(`Operation failed - Attempt ${attempt}/${maxRetries}`, {
                    context,
                    error: error.message,
                    attempt,
                    maxRetries
                });

                if (attempt < maxRetries) {
                    // Wait before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }

        // All retries failed
        logger.error(`Operation failed after ${maxRetries} attempts`, {
            context,
            error: lastError.message,
            stack: lastError.stack
        });

        throw lastError;
    }

    /**
     * Circuit breaker pattern for external services
     */
    static createCircuitBreaker(operation, options = {}) {
        const {
            failureThreshold = 5,
            resetTimeout = 60000, // 1 minute
            name = 'CircuitBreaker'
        } = options;

        let failureCount = 0;
        let lastFailureTime = null;
        let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN

        return async function (...args) {
            // If circuit is open and timeout has passed, try half-open
            if (state === 'OPEN') {
                if (Date.now() - lastFailureTime >= resetTimeout) {
                    state = 'HALF_OPEN';
                    logger.info(`Circuit breaker ${name} entering HALF_OPEN state`);
                } else {
                    throw new Error(`Circuit breaker ${name} is OPEN`);
                }
            }

            try {
                const result = await operation(...args);

                // Success - reset if in half-open state
                if (state === 'HALF_OPEN') {
                    state = 'CLOSED';
                    failureCount = 0;
                    logger.info(`Circuit breaker ${name} CLOSED after successful call`);
                }

                return result;
            } catch (error) {
                failureCount++;
                lastFailureTime = Date.now();

                logger.warn(`Circuit breaker ${name} failure`, {
                    failureCount,
                    threshold: failureThreshold,
                    error: error.message
                });

                if (failureCount >= failureThreshold) {
                    state = 'OPEN';
                    logger.error(`Circuit breaker ${name} OPENED`, {
                        failureCount,
                        threshold: failureThreshold
                    });
                }

                throw error;
            }
        };
    }
}

// Initialize the error handler
const processErrorHandler = new ProcessErrorHandler();

module.exports = {
    ProcessErrorHandler,
    safeExecute: ProcessErrorHandler.safeExecute,
    wrapSafe: ProcessErrorHandler.wrapSafe,
    retryOperation: ProcessErrorHandler.retryOperation,
    createCircuitBreaker: ProcessErrorHandler.createCircuitBreaker
};
