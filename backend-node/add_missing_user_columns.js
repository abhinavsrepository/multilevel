const { sequelize } = require('./src/models');

async function addMissingColumns() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const queryInterface = sequelize.getQueryInterface();

        const columnsToAdd = [
            { name: 'hasDirectSale', type: 'BOOLEAN', defaultValue: false },
            { name: 'levelBonusEligible', type: 'BOOLEAN', defaultValue: false },
            { name: 'directSaleDate', type: 'TIMESTAMP WITH TIME ZONE', allowNull: true }
        ];

        for (const col of columnsToAdd) {
            try {
                let type = col.type;
                // Adjust type string for raw SQL if needed, but Sequelize usually handles this well 
                // However, for raw queries or simple logic, we can rely on Sequelize's DataTypes if imported,
                // but checking existence and adding is safer with try-catch per column.
                // Or simply use raw queries which are often robust for simple ADD COLUMN.

                // Let's use raw queries to be explicit and avoid import issues if DataTypes isn't handy without loading the whole model system complicatedly
                let sql = `ALTER TABLE "Users" ADD COLUMN "${col.name}" ${col.type}`;
                if (col.defaultValue !== undefined) {
                    sql += ` DEFAULT ${col.defaultValue}`;
                }
                if (col.allowNull === true) {
                    sql += ` NULL`; // Default is usually NULL unless NOT NULL specified
                }

                console.log(`Adding column: ${col.name}...`);
                await sequelize.query(sql);
                console.log(`SUCCESS: Added ${col.name}`);
            } catch (err) {
                if (err.original && err.original.code === '42701') {
                    console.log(`SKIPPED: ${col.name} already exists.`);
                } else {
                    console.error(`FAILED to add ${col.name}:`, err.message);
                }
            }
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await sequelize.close();
    }
}

addMissingColumns();
