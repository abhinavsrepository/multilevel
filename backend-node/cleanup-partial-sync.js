require('dotenv').config();
const { sequelize } = require('./src/models');

async function cleanup() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('✓ Connected');

        // Drop problematic tables that exist but are blocking sync
        const tablesToDrop = ['deposits', 'BonanzaQualifications'];

        for (const table of tablesToDrop) {
            try {
                await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
                console.log(`✓ Dropped table: ${table}`);
            } catch (error) {
                console.log(`⚠ Could not drop ${table}: ${error.message}`);
            }
        }

        console.log('✓ Cleanup completed! Now run: npm run sync:db:safe');
        process.exit(0);
    } catch (error) {
        console.error('✗ Cleanup failed:', error.message);
        process.exit(1);
    }
}

cleanup();
