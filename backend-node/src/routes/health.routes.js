const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

/**
 * Health Check Endpoint
 * GET /api/v1/health
 *
 * Returns the health status of the application and database connection
 */
router.get('/', async (req, res) => {
    try {
        // Test database connection
        await sequelize.authenticate();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'MLM Backend API',
            version: '1.0.0',
            database: {
                status: 'connected',
                type: 'PostgreSQL'
            },
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            service: 'MLM Backend API',
            database: {
                status: 'disconnected',
                error: error.message
            },
            uptime: process.uptime()
        });
    }
});

/**
 * Detailed Health Check (for monitoring services)
 * GET /api/v1/health/detailed
 */
router.get('/detailed', async (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {}
    };

    // Database check
    try {
        await sequelize.authenticate();
        healthData.checks.database = {
            status: 'up',
            responseTime: 0
        };
    } catch (error) {
        healthData.status = 'degraded';
        healthData.checks.database = {
            status: 'down',
            error: error.message
        };
    }

    // Memory check
    const memoryUsage = process.memoryUsage();
    healthData.checks.memory = {
        status: memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9 ? 'up' : 'warning',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
    };

    // System info
    healthData.system = {
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = healthData.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthData);
});

module.exports = router;
