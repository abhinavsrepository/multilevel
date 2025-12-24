const { sequelize } = require('./src/models');

async function fixUserSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const columnsToAdd = [
            { name: 'date_of_birth', type: 'DATE' },
            { name: 'gender', type: 'VARCHAR(255)' },
            { name: 'address', type: 'TEXT' },
            { name: 'city', type: 'VARCHAR(255)' },
            { name: 'state', type: 'VARCHAR(255)' },
            { name: 'pincode', type: 'VARCHAR(255)' },
            { name: 'country', type: 'VARCHAR(255)', default: "'India'" },
            { name: 'kyc_level', type: 'VARCHAR(255)', default: "'NONE'" },
            { name: 'profile_picture', type: 'VARCHAR(255)' }
        ];

        for (const col of columnsToAdd) {
            try {
                // Check if column exists
                const [results] = await sequelize.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = '${col.name}';
                `);

                if (results.length === 0) {
                    console.log(`Adding missing column: ${col.name}...`);
                    let query = `ALTER TABLE "users" ADD COLUMN "${col.name}" ${col.type}`;
                    if (col.default) {
                        query += ` DEFAULT ${col.default}`;
                    }
                    await sequelize.query(query);
                    console.log(`SUCCESS: Added ${col.name}`);
                } else {
                    console.log(`SKIPPED: ${col.name} already exists.`);
                }
            } catch (err) {
                console.error(`FAILED to add ${col.name}:`, err.message);
            }
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixUserSchema();
