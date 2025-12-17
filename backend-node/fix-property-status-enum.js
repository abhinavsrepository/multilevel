const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

async function fixPropertyStatusEnum() {
    const client = await pool.connect();

    try {
        console.log('Starting property status ENUM migration...');

        // Step 1: Drop the default constraint
        await client.query(`
            ALTER TABLE properties ALTER COLUMN status DROP DEFAULT;
        `);
        console.log('✓ Dropped default constraint');

        // Step 2: Create the ENUM type if it doesn't exist
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_properties_status') THEN
                    CREATE TYPE enum_properties_status AS ENUM('ACTIVE', 'INACTIVE', 'SOLD_OUT', 'UNDER_MAINTENANCE');
                END IF;
            END $$;
        `);
        console.log('✓ Created ENUM type');

        // Step 3: Convert column to ENUM type
        await client.query(`
            ALTER TABLE properties
            ALTER COLUMN status TYPE enum_properties_status
            USING (
                CASE
                    WHEN status = 'ACTIVE' THEN 'ACTIVE'::enum_properties_status
                    WHEN status = 'INACTIVE' THEN 'INACTIVE'::enum_properties_status
                    WHEN status = 'SOLD_OUT' THEN 'SOLD_OUT'::enum_properties_status
                    WHEN status = 'UNDER_MAINTENANCE' THEN 'UNDER_MAINTENANCE'::enum_properties_status
                    ELSE 'ACTIVE'::enum_properties_status
                END
            );
        `);
        console.log('✓ Converted column to ENUM type');

        // Step 4: Set the default value
        await client.query(`
            ALTER TABLE properties ALTER COLUMN status SET DEFAULT 'ACTIVE'::enum_properties_status;
        `);
        console.log('✓ Set default value');

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixPropertyStatusEnum()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
