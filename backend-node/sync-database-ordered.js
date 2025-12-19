require('dotenv').config();
const { sequelize } = require('./src/models');
const logger = require('./src/config/logger');

async function syncDatabase() {
    try {
        logger.info('Starting ordered database synchronization...');

        // Connect to database
        await sequelize.authenticate();
        logger.info('✓ Database connection established');

        // Get all models
        const models = sequelize.models;

        // Phase 1: Core independent tables (no or minimal foreign keys)
        const phase1Models = [
            'User',
            'Package',
            'Property',
            'Rank',
            'SystemSetting',
            'Announcement',
            'Bonanza',
            'LevelCommissionRule',
            'MatchingBonusConfig',
            'RankReward'
        ];

        logger.info('Phase 1: Creating core tables...');
        for (const modelName of phase1Models) {
            if (models[modelName]) {
                await models[modelName].sync({ alter: true });
                logger.info(`  ✓ ${modelName} table synced`);
            }
        }

        // Phase 2: Tables that depend on Phase 1
        const phase2Models = [
            'Wallet',
            'BankAccount',
            'Kyc',
            'Epin',           // Must be before Deposit (Deposit references Epin)
            'Investment',
            'Commission',
            'Income',
            'Topup',
            'Deposit',        // References Epin
            'Withdrawal',
            'Transaction',
            'Notification',
            'SupportTicket',
            'Inquiry',
            'Favorite',
            'ActivityLog',
            'UserRank',
            'Installment'
        ];

        logger.info('Phase 2: Creating dependent tables...');
        for (const modelName of phase2Models) {
            if (models[modelName]) {
                await models[modelName].sync({ alter: true });
                logger.info(`  ✓ ${modelName} table synced`);
            }
        }

        // Phase 3: Tables with complex dependencies
        const phase3Models = [
            'BonanzaQualification',
            'RankAchievement',
            'MatchingBonusDetail',
            'FastStartBonus',
            'Payout',
            'TicketReply'
        ];

        logger.info('Phase 3: Creating complex tables...');
        for (const modelName of phase3Models) {
            if (models[modelName]) {
                await models[modelName].sync({ alter: true });
                logger.info(`  ✓ ${modelName} table synced`);
            }
        }

        // Sync any remaining models that weren't in the phases
        logger.info('Phase 4: Syncing any remaining tables...');
        const syncedModels = [...phase1Models, ...phase2Models, ...phase3Models];
        for (const modelName of Object.keys(models)) {
            if (!syncedModels.includes(modelName)) {
                await models[modelName].sync({ alter: true });
                logger.info(`  ✓ ${modelName} table synced`);
            }
        }

        logger.info('✓ Database synchronized successfully');

        logger.info('All tables in database:');
        const tables = await sequelize.getQueryInterface().showAllTables();
        tables.forEach(table => logger.info(`  - ${table}`));

        logger.info('✓ Database sync completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('✗ Database sync failed:', error);
        console.error(error);
        process.exit(1);
    }
}

syncDatabase();
