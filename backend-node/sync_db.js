const { sequelize } = require('./src/models');

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
}

sync();
