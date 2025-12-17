const { sequelize } = require('./src/models');

// Disable logging to keep output clean
sequelize.options.logging = false;

async function inspect() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const tableInfo = await sequelize.getQueryInterface().describeTable('Users');

        // Print all current columns for debugging reference
        // console.log('Current Columns:', Object.keys(tableInfo));

        const expectedColumns = [
            'emailVerified', 'phoneVerified', 'emailOtp', 'phoneOtp',
            'otpExpiry', 'resetPasswordToken', 'resetPasswordExpiry',
            'profilePhotoUrl', 'hasDirectSale', 'levelBonusEligible',
            'directSaleDate'
        ];

        const missing = expectedColumns.filter(col => !tableInfo[col]);

        if (missing.length > 0) {
            console.log('MISSING_COLUMNS_START');
            console.log(JSON.stringify(missing, null, 2));
            console.log('MISSING_COLUMNS_END');
        } else {
            console.log('ALL_COLUMNS_PRESENT');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}
inspect();
