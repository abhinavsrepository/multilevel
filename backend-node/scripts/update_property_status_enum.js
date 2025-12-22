const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function updatePropertyStatusEnum() {
    const client = await pool.connect();

    try {
        console.log('Starting property status ENUM update...');

        // We cannot easily ALTER type to add values inside a detailed transaction block in some postgres versions without commit, 
        // but 'ALTER TYPE ... ADD VALUE' is generally safe.
        // We need to add: AVAILABLE, BOOKING_OPEN, FEW_SLOTS_LEFT, UPCOMING

        const newValues = ['AVAILABLE', 'BOOKING_OPEN', 'FEW_SLOTS_LEFT', 'UPCOMING'];

        for (const value of newValues) {
            try {
                await client.query(`ALTER TYPE enum_properties_status ADD VALUE IF NOT EXISTS '${value}'`);
                console.log(`✓ Added value: ${value}`);
            } catch (e) {
                // Ignore if it already exists or other minor issues, but log it
                console.log(`ℹ️ Value ${value} might already exist or error: ${e.message}`);
            }
        }

        // Update default value for the column
        await client.query(`ALTER TABLE properties ALTER COLUMN status SET DEFAULT 'AVAILABLE'::enum_properties_status`);
        console.log('✓ Updated default value to AVAILABLE');

        // Optional: Data migration - Convert 'ACTIVE' to 'AVAILABLE' if desired?
        // Let's keep 'ACTIVE' as is for now to avoid breaking existing data, but newly created ones will use AVAILABLE.
        // Or we can migrate:
        // await client.query(`UPDATE properties SET status = 'AVAILABLE' WHERE status = 'ACTIVE'`);
        // console.log('✓ Migrated ACTIVE properties to AVAILABLE');

        console.log('\n✅ Enum update completed successfully!');

    } catch (error) {
        console.error('❌ Update failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updatePropertyStatusEnum()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
