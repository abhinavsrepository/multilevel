#!/usr/bin/env node

/**
 * Run SQL Migration
 * Executes the create-property-sales-table.sql migration
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSQLMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        console.log('==================================================');
        console.log('Running SQL Migration: add-missing-property-sales-columns');
        console.log('==================================================');

        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Reading migration file...');
        const migrationPath = path.join(__dirname, '../migrations/add-missing-property-sales-columns.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await client.query(migrationSQL);

        console.log('==================================================');
        console.log('✓ Migration completed successfully!');
        console.log('✓ property_sales table has all required columns');
        console.log('==================================================');

        client.release();
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('==================================================');
        console.error('✗ Migration failed:', error.message);
        console.error('==================================================');
        console.error('Error details:', error);
        await pool.end();
        process.exit(1);
    }
}

runSQLMigration();
