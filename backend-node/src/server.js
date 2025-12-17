require('dotenv').config();
const logger = require('./config/logger');
const app = require('./app');
const { sequelize } = require('./models');
const { retryOperation } = require('./utils/processErrorHandler');

// Initialize process error handlers - MUST be first
require('./utils/processErrorHandler');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        logger.info('='.repeat(50));
        logger.info('Starting MLM Backend Server...');
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Port: ${PORT}`);
        logger.info('='.repeat(50));

        // Test database connection with retry
        await retryOperation(
            async () => {
                await sequelize.authenticate();
                logger.info('✓ Database connection established successfully');
            },
            3,
            2000,
            'Database Connection'
        );

        // Sync database - use force:false to avoid data loss
        // In production, use migrations instead of sync
        try {
            await sequelize.sync({ force: false, alter: false });
            logger.info('✓ Database synchronized successfully');
        } catch (syncError) {
            logger.warn('Database sync warning (continuing anyway)', {
                error: syncError.message
            });
            // Continue even if sync has issues - tables might already exist
        }

        // Start server
        const server = app.listen(PORT, () => {
            logger.info('='.repeat(50));
            logger.info(`✓ Server is running on port ${PORT}`);
            logger.info(`✓ API URL: http://localhost:${PORT}/api/v1`);
            logger.info('✓ Server is ready to accept connections');
            logger.info('='.repeat(50));
        });

        // Graceful shutdown handler
        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} signal received - Starting graceful shutdown`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await sequelize.close();
                    logger.info('Database connections closed');
                    logger.info('Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown', { error: error.message });
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        logger.error('FATAL ERROR - Failed to start server', {
            error: error.message,
            stack: error.stack
        });

        // In production, try to recover or notify admins
        if (process.env.NODE_ENV === 'production') {
            logger.error('Server failed to start in production - attempting recovery...');
            // You could implement recovery logic here
            // For now, we'll exit
            process.exit(1);
        } else {
            console.error('Unable to start server:', error);
            process.exit(1);
        }
    }
}

// Start the server
startServer();

// Log Node.js version
logger.info(`Node.js version: ${process.version}`);
