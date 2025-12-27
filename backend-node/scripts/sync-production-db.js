#!/usr/bin/env node

/**
 * Production Database Sync Script
 * Safely syncs all models to the production database
 * Run this on Render after deployment to create missing tables
 */

require('dotenv').config();
const { sequelize } = require('../src/models');
const logger = require('../src/config/logger');

async function syncProductionDatabase() {
    try {
        logger.info('==================================================');
        logger.info('Starting Production Database Sync');
        logger.info('==================================================');

        // Test connection
        await sequelize.authenticate();
        logger.info('✓ Database connection established');

        // Sync all models (alter: true will update existing tables without dropping them)
        await sequelize.sync({ alter: true });
        logger.info('✓ All models synced successfully');

        logger.info('==================================================');
        logger.info('Database sync completed successfully!');
        logger.info('==================================================');

        process.exit(0);
    } catch (error) {
        logger.error('Database sync failed:', error);
        console.error('Error details:', error);
        process.exit(1);
    }
}

syncProductionDatabase();
