const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize } = require('../src/models');

async function checkSchema() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected.');

        const [results, metadata] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'rank_rewards';
        `);

        console.log('Columns in rank_rewards:', results);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSchema();
