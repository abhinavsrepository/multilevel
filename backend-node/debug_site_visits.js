const { SiteVisit, User, Property, sequelize } = require('./src/models');

async function debugSiteVisits() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Force sync for this model specificially to ensure table exists
        await SiteVisit.sync({ alter: true });
        console.log('SiteVisit table synced');

        const userId = 1; // Assuming admin exists

        // Check if we can count
        const count = await SiteVisit.count();
        console.log('SiteVisit count:', count);

        // Try to query with include
        const visits = await SiteVisit.findAll({
            include: [
                { model: User, as: 'Client', attributes: ['fullName'] },
                { model: Property, attributes: ['title'] }
            ],
            limit: 1
        });
        console.log('Visits found:', visits.length);

    } catch (err) {
        console.error('DEBUG ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

debugSiteVisits();
