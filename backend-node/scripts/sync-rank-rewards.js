const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, RankReward, Rank } = require('../src/models');

async function sync() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected to DB.');

        console.log('Syncing Rank...');
        await Rank.sync({ alter: true });
        console.log('Rank synced.');

        console.log('Syncing RankReward...');
        await RankReward.sync({ alter: true });
        console.log('RankReward synced.');

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

sync();
