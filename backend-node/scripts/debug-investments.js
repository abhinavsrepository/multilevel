const { Investment, User, sequelize } = require('../src/models');

async function debugInvestments() {
    try {
        console.log('Authenticating database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Running query similar to getPropertyRecentInvestments...');

        const page = 1;
        const limit = 10;
        const offset = 0;
        const propertyId = 2; // From user report

        const { count, rows } = await Investment.findAndCountAll({
            where: { propertyId: propertyId },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'firstName', 'lastName'] }],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        console.log(`Success! Found ${count} records.`);

    } catch (error) {
        console.error('---------------- ERROR ----------------');
        console.error('Message:', error.message);
        if (error.original) {
            console.error('SQL Error Code:', error.original.code);
            console.error('SQL Message:', error.original.message);
            console.error('SQL:', error.sql);
        }
        console.error('---------------------------------------');
    } finally {
        await sequelize.close();
    }
}

debugInvestments();
