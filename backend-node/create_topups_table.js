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
            CREATE TABLE IF NOT EXISTS topups (
                id BIGSERIAL PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES users(id),
                package_id BIGINT NOT NULL REFERENCES packages(id),
                amount DECIMAL(15, 2) NOT NULL,
                status VARCHAR(255) DEFAULT 'COMPLETED',
                payment_method VARCHAR(255) DEFAULT 'WALLET',
                transaction_id VARCHAR(255),
                processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sequelize.query(query);
        console.log('Topups table created successfully.');

    } catch (error) {
        console.error('Unable to create table:', error);
    } finally {
        await sequelize.close();
    }
};

createTable();
