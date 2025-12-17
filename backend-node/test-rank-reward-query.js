const { RankReward, Rank, User } = require('./src/models');

async function testQuery() {
    try {
        console.log('Testing RankReward query with Rank association...');

        const rewards = await RankReward.findAll({
            where: { userId: 5 },
            include: [
                { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
            ],
            limit: 5
        });

        console.log('\nQuery successful!');
        console.log('Found', rewards.length, 'rewards');

        if (rewards.length > 0) {
            console.log('\nFirst reward:');
            console.log(JSON.stringify(rewards[0].toJSON(), null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Query failed:');
        console.error('Error:', error.message);
        console.error('\nStack:', error.stack);
        process.exit(1);
    }
}

testQuery();
