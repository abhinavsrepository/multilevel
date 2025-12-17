const { Payout, User, sequelize } = require('../src/models');

async function testQuery() {
    try {
        console.log('Testing Payout query...');
        const payouts = await Payout.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username']
            }],
            limit: 1
        });
        console.log('Query successful:', payouts.length);
    } catch (error) {
        console.error('Query failed:', error.message);
    } finally {
        await sequelize.close();
    }
}

testQuery();
