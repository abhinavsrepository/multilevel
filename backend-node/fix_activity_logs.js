const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('./src/config/database.js')[env];

// Initialize Sequelize
console.log('DB Config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    hasPassword: !!config.password,
    dialect: config.dialect
});

// Initialize Sequelize
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: console.log,
    }
);

async function cleanOrphanedLogs() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connection established successfully.');

        // Direct SQL query to delete orphaned logs
        const query = `
      DELETE FROM "ActivityLogs"
      WHERE "userId" NOT IN (SELECT id FROM users);
    `;

        console.log('Executing cleanup query:', query);
        const [results, metadata] = await sequelize.query(query);
        console.log('Cleanup complete. Deleted orphaned rows:', metadata?.rowCount || results?.rowCount || 'unknown');

    } catch (error) {
        console.error('Error cleaning logs:', error);
    } finally {
        await sequelize.close();
    }
}

cleanOrphanedLogs();
