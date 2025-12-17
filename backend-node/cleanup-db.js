require('dotenv').config();
const { sequelize } = require('./src/models');

async function cleanupDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Comprehensive list of all tables with userId foreign keys
        const tablesToClean = [
            'Commissions',
            'BonanzaQualifications',
            'incomes',
            'Investments',
            'Favorites',
            'inquiries',
            'KycDocuments',
            'Notifications',
            'ActivityLogs',
            'BankAccounts',
            'withdrawals',
            'deposits',
            'epins',
            'fast_start_bonuses',
            'Installments',
            'Wallets'
        ];

        console.log('Cleaning up orphaned records from all tables...\n');

        for (const table of tablesToClean) {
            try {
                const [results] = await sequelize.query(`
                    DELETE FROM "${table}"
                    WHERE "userId" NOT IN (SELECT id FROM users);
                `);
                console.log(`✓ Cleaned up orphaned records from ${table}`);
            } catch (error) {
                // Table might not have userId column or might not exist
                console.log(`  Skipped ${table}: ${error.message}`);
            }
        }

        // Also clean tables with other user reference columns
        console.log('\nCleaning up other foreign key references...\n');

        // Announcements - createdBy
        try {
            await sequelize.query(`
                DELETE FROM "Announcements"
                WHERE "createdBy" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from Announcements (createdBy)`);
        } catch (error) {
            console.log(`  Skipped Announcements: ${error.message}`);
        }

        // withdrawals - approvedBy
        try {
            await sequelize.query(`
                DELETE FROM "withdrawals"
                WHERE "approvedBy" IS NOT NULL AND "approvedBy" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from withdrawals (approvedBy)`);
        } catch (error) {
            console.log(`  Skipped withdrawals (approvedBy): ${error.message}`);
        }

        // incomes - fromUserId
        try {
            await sequelize.query(`
                DELETE FROM "incomes"
                WHERE "fromUserId" IS NOT NULL AND "fromUserId" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from incomes (fromUserId)`);
        } catch (error) {
            console.log(`  Skipped incomes (fromUserId): ${error.message}`);
        }

        // Commissions - fromUserId
        try {
            await sequelize.query(`
                DELETE FROM "Commissions"
                WHERE "fromUserId" IS NOT NULL AND "fromUserId" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from Commissions (fromUserId)`);
        } catch (error) {
            console.log(`  Skipped Commissions (fromUserId): ${error.message}`);
        }

        // inquiries - respondedBy
        try {
            await sequelize.query(`
                DELETE FROM "inquiries"
                WHERE "respondedBy" IS NOT NULL AND "respondedBy" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from inquiries (respondedBy)`);
        } catch (error) {
            console.log(`  Skipped inquiries (respondedBy): ${error.message}`);
        }

        // deposits - approvedBy
        try {
            await sequelize.query(`
                DELETE FROM "deposits"
                WHERE "approvedBy" IS NOT NULL AND "approvedBy" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from deposits (approvedBy)`);
        } catch (error) {
            console.log(`  Skipped deposits (approvedBy): ${error.message}`);
        }

        // epins - generatedBy, usedBy, activatedUserId
        try {
            await sequelize.query(`
                DELETE FROM "epins"
                WHERE "generatedBy" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from epins (generatedBy)`);
        } catch (error) {
            console.log(`  Skipped epins (generatedBy): ${error.message}`);
        }

        try {
            await sequelize.query(`
                DELETE FROM "epins"
                WHERE "usedBy" IS NOT NULL AND "usedBy" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from epins (usedBy)`);
        } catch (error) {
            console.log(`  Skipped epins (usedBy): ${error.message}`);
        }

        try {
            await sequelize.query(`
                DELETE FROM "epins"
                WHERE "activatedUserId" IS NOT NULL AND "activatedUserId" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from epins (activatedUserId)`);
        } catch (error) {
            console.log(`  Skipped epins (activatedUserId): ${error.message}`);
        }

        // matching_bonus_details - userId, downlineUserId
        try {
            await sequelize.query(`
                DELETE FROM "matching_bonus_details"
                WHERE "downlineUserId" IS NOT NULL AND "downlineUserId" NOT IN (SELECT id FROM users);
            `);
            console.log(`✓ Cleaned up orphaned records from matching_bonus_details (downlineUserId)`);
        } catch (error) {
            console.log(`  Skipped matching_bonus_details: ${error.message}`);
        }

        console.log('\n✅ Database cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupDatabase();
