const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const createTable = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        const query = `
            CREATE TABLE IF NOT EXISTS packages (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                bv DECIMAL(15, 2) NOT NULL DEFAULT 0,
                referral_commission DECIMAL(5, 2) DEFAULT 0,
                is_active BOOLEAN DEFAULT TRUE,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sequelize.query(query);
        console.log('Packages table created successfully.');

        // Seed some dummy packages
        const seedQuery = `
            INSERT INTO packages (name, amount, bv, referral_commission, is_active)
            VALUES 
            ('Basic Package', 1000.00, 50.00, 5.00, true),
            ('Standard Package', 5000.00, 300.00, 7.00, true),
            ('Premium Package', 10000.00, 700.00, 10.00, true)
            ON CONFLICT DO NOTHING;
        `;

        await sequelize.query(seedQuery);
        console.log('Dummy packages seeded.');

    } catch (error) {
        console.error('Unable to create table:', error);
    } finally {
        await sequelize.close();
    }
};

createTable();
