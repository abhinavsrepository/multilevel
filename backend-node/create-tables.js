require('dotenv').config();
const { sequelize } = require('./src/models');

async function createTables() {
    try {
        await sequelize.authenticate();
        console.log('✓ Connected to database');

        // Create wallets table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
                investment_balance DECIMAL(15,2) DEFAULT 0,
                commission_balance DECIMAL(15,2) DEFAULT 0,
                rental_income_balance DECIMAL(15,2) DEFAULT 0,
                roi_balance DECIMAL(15,2) DEFAULT 0,
                total_earned DECIMAL(15,2) DEFAULT 0,
                total_withdrawn DECIMAL(15,2) DEFAULT 0,
                total_invested DECIMAL(15,2) DEFAULT 0,
                locked_balance DECIMAL(15,2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✓ Wallets table created');

        // Create transactions table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(50),
                amount DECIMAL(15,2),
                wallet_type VARCHAR(50),
                category VARCHAR(50),
                status VARCHAR(50) DEFAULT 'COMPLETED',
                description TEXT,
                reference_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✓ Transactions table created');

        console.log('✓ All tables created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    }
}

createTables();
