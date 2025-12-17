const { Sequelize } = require('sequelize');
const config = require('./src/config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

async function fixNotificationsTable() {
    try {
        const queryInterface = sequelize.getQueryInterface();

        // Check if columns exist
        const tableDescription = await queryInterface.describeTable('notifications');

        if (!tableDescription.action_link) {
            console.log('Adding action_link column to notifications table...');
            await queryInterface.addColumn('notifications', 'action_link', {
                type: Sequelize.STRING,
                allowNull: true
            });
            console.log('action_link column added successfully.');
        } else {
            console.log('action_link column already exists.');
        }

        if (!tableDescription.updated_at) {
            console.log('Adding updated_at column to notifications table...');
            await queryInterface.addColumn('notifications', 'updated_at', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            });
            console.log('updated_at column added successfully.');
        } else {
            console.log('updated_at column already exists.');
        }

        console.log('Notifications table is now up to date.');
    } catch (error) {
        console.error('Error fixing notifications table:', error);
    } finally {
        await sequelize.close();
    }
}

fixNotificationsTable();
