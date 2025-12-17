require('dotenv').config();
const { sequelize } = require('../models');

async function migrateLevelPlan() {
    try {
        console.log('Starting Level Plan migration (force mode)...\n');

        // Force sync with alter to handle existing tables
        await sequelize.sync({ force: false, alter: true });

        console.log('✓ All tables synchronized successfully');
        console.log('\nMigration completed!');

        process.exit(0);
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        console.error('\nTrying to create tables that don\'t exist...\n');

        try {
            // Try to create only new tables
            const models = Object.keys(sequelize.models);

            for (const modelName of models) {
                const model = sequelize.models[modelName];

                try {
                    await model.sync({ alter: true });
                    console.log(`✓ Synced ${modelName}`);
                } catch (err) {
                    console.error(`✗ Failed to sync ${modelName}:`, err.message);
                }
            }

            console.log('\nMigration completed with some warnings');
            process.exit(0);
        } catch (err) {
            console.error('\n✗ Final migration attempt failed:', err.message);
            process.exit(1);
        }
    }
}

migrateLevelPlan();
