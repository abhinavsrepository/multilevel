require('dotenv').config();
const { sequelize } = require('../models');

async function migrateLevelPlan() {
    try {
        console.log('Starting Level Plan migration...\n');

        // Sync all models to create tables
        await sequelize.sync({ alter: true });

        console.log('✓ All tables synchronized successfully');
        console.log('\nMigration completed!');

        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error);
        process.exit(1);
    }
}

migrateLevelPlan();
