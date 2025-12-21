const { User, Property, SiteVisit, sequelize } = require('./src/models');

async function seedSiteVisits() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // 1. Find User
        const user = await User.findOne({ where: { email: 'customer@test.com' } });
        if (!user) {
            console.error('User customer@test.com not found. Run seed_customer.js first.');
            return;
        }

        // 2. Find Property
        const property = await Property.findOne();
        if (!property) {
            console.error('No property found. Run seed_investment.js first.');
            return;
        }

        // 3. Create Site Visit
        await SiteVisit.create({
            clientId: user.id,
            propertyId: property.id,
            associateId: user.id, // Assigning to self for demo
            visitDate: new Date(),
            visitTime: '10:00:00',
            status: 'SCHEDULED',
            notes: 'Interested in the villa.'
        });

        console.log('Site Visit seeded');

    } catch (err) {
        console.error('SEED ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

seedSiteVisits();
