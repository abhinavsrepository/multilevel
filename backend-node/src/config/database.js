require('dotenv').config();

// Parse DATABASE_URL if available (for Render and other platforms)
function getDatabaseConfig() {
    if (process.env.DATABASE_URL) {
        // Parse the DATABASE_URL
        const url = new URL(process.env.DATABASE_URL);
        return {
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading slash
            host: url.hostname,
            port: url.port || 5432,
            dialect: 'postgres',
            dialectOptions: {
                ssl: process.env.NODE_ENV === 'production' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            }
        };
    }

    // Fall back to individual environment variables
    return {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        dialectOptions: {
            connectTimeout: 10000 // 10 seconds timeout
        }
    };
}

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME || 'mlm_platform',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5433,
        dialect: 'postgres',
        logging: console.log
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME_TEST || 'mlm_platform_test',
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5433,
        dialect: 'postgres',
        logging: false
    },
    production: {
        ...getDatabaseConfig(),
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
};
