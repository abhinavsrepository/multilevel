const { PropertySale, Property, User, sequelize } = require('../src/models');

async function debugSales() {
    try {
        console.log('Authenticating database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Running query similar to getMySales...');

        // Mock filters
        const limit = 20;
        const offset = 0;

        const { count, rows } = await PropertySale.findAndCountAll({
            include: [
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'propertyType', 'city'],
                    required: false
                },
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'username', 'fullName', 'email', 'mobile'],
                    required: false
                },
                {
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'username', 'fullName', 'email'],
                    required: false
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'fullName'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        console.log(`Success! Found ${count} records.`);
        console.log('First record sample:', rows[0] ? JSON.stringify(rows[0].toJSON(), null, 2) : 'No records');

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

debugSales();
