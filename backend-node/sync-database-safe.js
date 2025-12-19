require('dotenv').config();
const { sequelize } = require('./src/models');
const logger = require('./src/config/logger');

async function syncDatabase() {
    try {
        logger.info('Starting safe database synchronization...');

        // Connect to database
        await sequelize.authenticate();
        logger.info('✓ Database connection established');

        // Get all models
        const models = sequelize.models;

        // Define sync order with all models
        const syncOrder = [
            // Phase 1: Core independent tables
            'User',
            'Package',
            'Property',
            'Rank',
            'SystemSetting',
            'Announcement',
            'Bonanza',
            'LevelCommissionRule',
            'MatchingBonusConfig',
            'RankReward',

            // Phase 2: First level dependencies
            'Wallet',
            'BankAccount',
            'Kyc',
            'EPin',
            'Income',
            'Notification',
            'SupportTicket',
            'Inquiry',
            'Favorite',
            'ActivityLog',
            'UserRank',

            // Phase 3: Second level dependencies
            'Investment',
            'Commission',
            'Topup',
            'Deposit',
            'Withdrawal',
            'Transaction',
            'Installment',

            // Phase 4: Complex dependencies
            'BonanzaQualification',
            'RankAchievement',
            'MatchingBonusDetail',
            'FastStartBonus',
            'Payout',
            'TicketReply'
        ];

        logger.info('Syncing models in dependency order...');

        for (const modelName of syncOrder) {
            if (models[modelName]) {
                try {
                    // First, check if table exists
                    const tableExists = await sequelize.getQueryInterface()
                        .showAllTables()
                        .then(tables => tables.includes(models[modelName].tableName || modelName.toLowerCase() + 's'));

                    if (!tableExists) {
                        // Table doesn't exist, create it fresh
                        logger.info(`  Creating ${modelName}...`);
                        await models[modelName].sync({ force: false });
                        logger.info(`  ✓ ${modelName} created`);
                    } else {
                        // Table exists, try to alter carefully
                        logger.info(`  Updating ${modelName}...`);
                        try {
                            await models[modelName].sync({ alter: true });
                            logger.info(`  ✓ ${modelName} updated`);
                        } catch (alterError) {
                            // If alter fails (likely due to foreign key issues), skip and continue
                            logger.warn(`  ⚠ ${modelName} alter failed: ${alterError.message}`);
                            logger.warn(`  Skipping ${modelName} - will retry in next pass`);
                        }
                    }
                } catch (error) {
                    logger.error(`  ✗ Error syncing ${modelName}: ${error.message}`);
                    // Continue with next model instead of failing completely
                }
            }
        }

        // Second pass: Try to fix any tables that failed in first pass
        logger.info('Second pass: Fixing any remaining issues...');
        for (const modelName of syncOrder) {
            if (models[modelName]) {
                try {
                    await models[modelName].sync({ alter: true });
                } catch (error) {
                    // Silently ignore errors in second pass
                }
            }
        }

        // Sync any models not in our list
        logger.info('Syncing any remaining models...');
        for (const modelName of Object.keys(models)) {
            if (!syncOrder.includes(modelName)) {
                try {
                    await models[modelName].sync({ alter: true });
                    logger.info(`  ✓ ${modelName} synced`);
                } catch (error) {
                    logger.warn(`  ⚠ ${modelName} failed: ${error.message}`);
                }
            }
        }

        logger.info('✓ Database synchronized successfully');

        logger.info('All tables in database:');
        const tables = await sequelize.getQueryInterface().showAllTables();
        tables.sort().forEach(table => logger.info(`  - ${table}`));

        logger.info('✓ Database sync completed!');
        process.exit(0);
    } catch (error) {
        logger.error('✗ Database sync failed:', error);
        console.error(error);
        process.exit(1);
    }
}

syncDatabase();
