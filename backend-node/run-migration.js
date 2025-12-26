const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        
        console.log('Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations', 'add-proclaim-sale-fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('Executing migration...');
        await client.query(migrationSQL);
        
        console.log('Migration completed successfully!');
        client.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
