const { sequelize, Package } = require('./src/models');

async function seedPackages() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync to ensure table exists
        await Package.sync();

        const count = await Package.count();
        if (count === 0) {
            console.log('Seeding packages...');
            await Package.bulkCreate([
                {
                    name: 'Basic Package',
                    amount: 100.00,
                    bv: 10,
                    referralCommission: 5.0,
                    description: 'Entry level package',
                    isActive: true
                },
                {
                    name: 'Standard Package',
                    amount: 500.00,
                    bv: 50,
                    referralCommission: 7.0,
                    description: 'Standard level package',
                    isActive: true
                },
                {
                    name: 'Premium Package',
                    amount: 1000.00,
                    bv: 100,
                    referralCommission: 10.0,
                    description: 'Premium level package',
                    isActive: true
                },
                {
                    name: 'Elite Package',
                    amount: 5000.00,
                    bv: 500,
                    referralCommission: 12.0,
                    description: 'Elite level package',
                    isActive: true
                }
            ]);
            console.log('Packages seeded successfully.');
        } else {
            console.log('Packages already exist. Skipping seed.');
        }
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
}

seedPackages();
