const { Wallet, Transaction } = require('./src/models');
const { Op } = require('sequelize');

async function testTrends() {
    try {
        const period = 'MONTH';
        const userId = 1; // Use an actual user ID from your database

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);

        // Build where clause
        const where = {
            userId: userId,
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        };

        console.log('Querying with where:', JSON.stringify(where, null, 2));

        // Fetch transactions
        const transactions = await Transaction.findAll({
            where,
            order: [['createdAt', 'ASC']]
        });

        console.log(`Found ${transactions.length} transactions`);

        // Group transactions by date
        const trendMap = {};

        transactions.forEach(transaction => {
            const date = new Date(transaction.createdAt).toISOString().split('T')[0];

            if (!trendMap[date]) {
                trendMap[date] = {
                    date,
                    credits: 0,
                    debits: 0,
                    net: 0
                };
            }

            console.log(`Transaction type: ${transaction.type}, amount: ${transaction.amount}`);

            if (transaction.type === 'CREDIT') {
                trendMap[date].credits += parseFloat(transaction.amount);
            } else if (transaction.type === 'DEBIT') {
                trendMap[date].debits += parseFloat(transaction.amount);
            }
        });

        // Calculate net for each date
        const trends = Object.values(trendMap).map(item => ({
            ...item,
            net: item.credits - item.debits
        }));

        console.log('Trends:', JSON.stringify(trends, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testTrends();
