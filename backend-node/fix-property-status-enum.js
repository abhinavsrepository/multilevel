const { Pool } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL (Render/production) and individual vars (local)
const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    : new Pool({
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

        // Step 2: Add new enum values if they don't exist
        const newValues = ['AVAILABLE', 'BOOKING_OPEN', 'FEW_SLOTS_LEFT', 'UPCOMING'];

        for (const value of newValues) {
            try {
                await client.query(`
                    ALTER TYPE enum_properties_status ADD VALUE IF NOT EXISTS '${value}';
                `);
                console.log(`✓ Added enum value: ${value}`);
            } catch (err) {
                // Value might already exist, that's okay
                console.log(`  Value ${value} already exists or error:`, err.message);
            }
        }

        // Step 3: Set the new default value
        await client.query(`
            ALTER TABLE properties ALTER COLUMN status SET DEFAULT 'AVAILABLE'::enum_properties_status;
        `);
        console.log('✓ Set default value to AVAILABLE');

        // Step 4: Verify all enum values
        const result = await client.query(`
            SELECT enumlabel
            FROM pg_enum
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_properties_status')
            ORDER BY enumlabel;
        `);
        console.log('\n✓ Current enum values:', result.rows.map(r => r.enumlabel).join(', '));

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
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
