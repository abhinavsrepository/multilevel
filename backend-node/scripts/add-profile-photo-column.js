const { sequelize } = require('../src/models');

async function addProfilePhotoUrl() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('Users');

        if (!tableInfo.profilePhotoUrl) {
            console.log('Adding profilePhotoUrl column to Users table...');
            await queryInterface.addColumn('Users', 'profilePhotoUrl', {
                type: 'VARCHAR(255)',
                allowNull: true
            });
            console.log('Column added successfully.');
        } else {
            console.log('Column profilePhotoUrl already exists.');
        }
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        process.exit();
    }
}

addProfilePhotoUrl();
