const { sequelize } = require('../src/models');

async function fixWalletColumns() {
    try {
        console.log('Checking Wallets table for missing columns...');

        // Add missing columns if they don't exist
        const columns = [
            { name: 'cashbackBalance', type: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'levelProfitBalance', type: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'roiBalance', type: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'rentalIncomeBalance', type: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'repurchaseBalance', type: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'coinBalance', type: 'DECIMAL(15,2) DEFAULT 0' },
            { name: 'dailyIncome', type: 'DECIMAL(15,2) DEFAULT 0' }
        ];

        for (const column of columns) {
            try {
                await sequelize.query(`
                    ALTER TABLE "Wallets"
                    ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type}
                `);
                console.log(`✓ Column ${column.name} added or already exists`);
            } catch (error) {
                console.log(`Column ${column.name} might already exist or error:`, error.message);
            }
        }

        console.log('✓ Wallet columns update complete');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing wallet columns:', error);
        process.exit(1);
    }
}

fixWalletColumns();
