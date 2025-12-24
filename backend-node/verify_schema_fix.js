const { sequelize } = require('./src/models');

async function verifySchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const columnsToCheck = [
            'date_of_birth',
            'gender',
            'address',
            'city',
            'state',
            'pincode',
            'country',
            'kyc_level',
            'profile_picture'
        ];

        console.log('Verifying columns in users table...');

        const [results] = await sequelize.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);

        const existingColumns = results.map(r => r.column_name);

        let allFound = true;
        for (const col of columnsToCheck) {
            if (existingColumns.includes(col)) {
                console.log(`[OK] ${col} exists.`);
            } else {
                console.log(`[MISSING] ${col} NOT found!`);
                allFound = false;
            }
        }

        if (allFound) {
            console.log('\nSUCCESS: All required columns are present.');
        } else {
            console.log('\nFAILURE: Some columns are still missing.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

verifySchema();
