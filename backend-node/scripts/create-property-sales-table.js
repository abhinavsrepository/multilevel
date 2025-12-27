#!/usr/bin/env node

/**
 * Create Property Sales Table
 * Safely creates the property_sales table in production without altering existing tables
 */

require('dotenv').config();
const { PropertySale } = require('../src/models');
const { sequelize } = require('../src/models');
const logger = require('../src/config/logger');

async function createPropertySalesTable() {
    try {
        logger.info('==================================================');
        logger.info('Creating Property Sales Table');
        logger.info('==================================================');

        // Test connection
        await sequelize.authenticate();
        logger.info('✓ Database connection established');

        // Check if table already exists
        const tableExists = await sequelize.getQueryInterface().showAllTables()
            .then(tables => tables.includes('property_sales'));

        if (tableExists) {
            logger.info('✓ property_sales table already exists');

            // Just sync the model to ensure all columns are present
            await PropertySale.sync({ alter: true });
            logger.info('✓ property_sales table synced (columns updated if needed)');
        } else {
            // Create the table
            await PropertySale.sync();
            logger.info('✓ property_sales table created successfully');
        }

        logger.info('==================================================');
        logger.info('Property Sales table is ready!');
        logger.info('==================================================');

        process.exit(0);
    } catch (error) {
        logger.error('Failed to create property_sales table:', error);
        console.error('Error details:', error);
        process.exit(1);
    }
}

createPropertySalesTable();
