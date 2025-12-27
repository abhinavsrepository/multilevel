const { PropertySale, Property, sequelize } = require('../src/models');

async function syncTables() {
    try {
        console.log('Authenticating database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // console.log('Syncing Property table...');
        // await Property.sync({ alter: true });
        // console.log('Property table synced.');

        console.log('Syncing PropertySale table...');
        await PropertySale.sync({ alter: true });
        console.log('PropertySale table synced.');

        console.log('All tables synced successfully.');

    } catch (error) {
        console.error('Error syncing tables:', error);
    } finally {
        await sequelize.close();
    }
}

syncTables();
