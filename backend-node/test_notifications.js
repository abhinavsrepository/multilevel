const { Notification, User, sequelize } = require('./src/models');

async function testNotifications() {
    try {
        console.log('Testing Notification model...');
        if (!Notification) {
            console.error('ERROR: Notification model is undefined!');
            return;
        }

        console.log('Notification model found.');

        // Check if table exists
        const tableExists = await sequelize.getQueryInterface().showAllSchemas().then((tableObj) => {
            // Note: implementations differ by dialect, but we can try a simple query
            return sequelize.query("SELECT to_regclass('public.notifications');");
        });

        console.log('Checking notifications table...');

        // Try a findAll
        const notifications = await Notification.findAll({ limit: 1 });
        console.log('FindAll success:', notifications);

    } catch (error) {
        console.error('ERROR during test:', error);
    } finally {
        await sequelize.close();
    }
}

testNotifications();
