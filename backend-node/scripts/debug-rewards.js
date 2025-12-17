const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, RankReward, Rank } = require('../src/models');

async function debugRewards() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Attempting RankReward.findAll...');
        const rewards = await RankReward.findAll({
            where: { userId: 1 }, // Dummy user ID
            include: [
                { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('Success! Found rewards:', rewards.length);
        process.exit(0);
    } catch (err) {
        console.error('FULL ERROR OBJECT:', err);
        console.error('ERROR MESSAGE:', err.message);
        if (err.original) {
            console.error('ORIGINAL SQL ERROR:', err.original);
        }
        process.exit(1);
    }
}

debugRewards();
