const { sequelize } = require('./src/models');

async function addAnnouncementsTable() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Raw SQL to create table
        const query = `
            CREATE TABLE IF NOT EXISTS announcements (
                id BIGSERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'INFO',
                priority VARCHAR(50) DEFAULT 'MEDIUM',
                is_active BOOLEAN DEFAULT TRUE,
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                link VARCHAR(255),
                target_roles TEXT[],
                created_by BIGINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sequelize.query(query);
        console.log('Announcements table created successfully.');

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        await sequelize.close();
    }
}

addAnnouncementsTable();
