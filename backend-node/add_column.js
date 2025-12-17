const { sequelize } = require('./src/models');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        await sequelize.query(`
            ALTER TABLE "Wallets" 
            ADD COLUMN "levelProfitBalance" DECIMAL(15, 2) DEFAULT 0;
        `);

        console.log('SUCCESS: Column levelProfitBalance added.');

    } catch (error) {
        if (error.original && error.original.code === '42701') {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addColumn();
