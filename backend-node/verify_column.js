const { sequelize } = require('./src/models');

async function checkColumn() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [results, metadata] = await sequelize.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Wallets' AND column_name = 'levelProfitBalance';
        `);

        if (results.length > 0) {
            console.log('SUCCESS: Column levelProfitBalance exists.');
        } else {
            console.log('FAILURE: Column levelProfitBalance does NOT exist.');
        }

    } catch (error) {
        console.error('Error checking column:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumn();
