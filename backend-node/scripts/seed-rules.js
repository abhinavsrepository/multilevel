const { LevelCommissionRule, sequelize } = require('../src/models');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Clear existing rules
        await LevelCommissionRule.destroy({ where: {} });

        const rules = [
            { level: 1, commissionType: 'PERCENTAGE', value: 10, isActive: true },
            { level: 2, commissionType: 'PERCENTAGE', value: 5, isActive: true },
            { level: 3, commissionType: 'PERCENTAGE', value: 3, isActive: true },
        ];

        await LevelCommissionRule.bulkCreate(rules);
        console.log('Rules seeded.');
    } catch (error) {
        console.error('Error seeding rules:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
