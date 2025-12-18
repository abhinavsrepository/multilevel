require('dotenv').config();
const { sequelize } = require('./src/models');
const logger = require('./src/config/logger');

async function syncDatabase() {
    try {
        logger.info('Starting database synchronization...');

        // Connect to database
        await sequelize.authenticate();
        logger.info('✓ Database connection established');

        // Sync all models with alter: true to update existing tables
        // This will add missing tables and columns without dropping data
        await sequelize.sync({ alter: true, force: false });
        logger.info('✓ Database synchronized successfully');

        logger.info('All tables have been created/updated:');
        const tables = await sequelize.getQueryInterface().showAllTables();
        tables.forEach(table => logger.info(`  - ${table}`));

        logger.info('✓ Database sync completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('✗ Database sync failed:', error);
        console.error(error);
        process.exit(1);
    }
}

syncDatabase();
