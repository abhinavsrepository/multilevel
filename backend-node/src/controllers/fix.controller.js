const { PropertySale, Property, Investment, User, Rank, sequelize } = require('../models');
// Force redeploy

// Fix Property Sales Table
exports.fixSchema = async (req, res) => {
    try {
        console.log('Starting Schema Sync...');

        // Sync PropertySale table (and Property if needed, but we focus on PropertySale)
        try {
            await PropertySale.sync({ alter: true });
            console.log('PropertySale table synced with alter:true.');
        } catch (e) {
            console.warn('PropertySale alter sync failed, trying force:false (create if missing)...', e.message);
            await PropertySale.sync(); // Default is force: false
            console.log('PropertySale table synced (basic).');
        }

        // Sync Property table just in case (careful with ENUMs)
        // await Property.sync({ alter: true });

        res.json({ success: true, message: 'Schema synced successfully (PropertySale).' });
    } catch (error) {
        console.error('Schema Sync Error:', error);
        res.status(500).json({ success: false, message: 'Schema Sync Failed', error: error.message });
    }
};

// Fix Ranks
exports.fixRanks = async (req, res) => {
    try {
        console.log('Starting Rank Seeding...');

        // Ranks definition from seed-ecogram-ranks.js
        const ranks = [
            { name: 'Associate', displayOrder: 1, requiredTeamInvestment: 0, commissionBoost: 0, benefits: [] },
            { name: 'Team Leader', displayOrder: 2, requiredTeamInvestment: 1500000, benefits: [{ type: 'REWARD', value: 'Android Tablet' }] },
            { name: 'Regional Head', displayOrder: 3, requiredTeamInvestment: 5000000, benefits: [{ type: 'REWARD', value: 'Electric Scooty' }] },
            { name: 'Zonal Head', displayOrder: 4, requiredTeamInvestment: 15000000, benefits: [{ type: 'REWARD', value: 'Royal Enfield Hunter' }] },
            { name: 'General Manager', displayOrder: 5, requiredTeamInvestment: 50000000, benefits: [{ type: 'REWARD', value: 'Maruti Fronx' }] },
            { name: 'VP', displayOrder: 6, requiredTeamInvestment: 150000000, benefits: [{ type: 'REWARD', value: 'XUV 700 / Scorpio' }] },
            { name: 'President', displayOrder: 7, requiredTeamInvestment: 400000000, benefits: [{ type: 'REWARD', value: 'Toyota Fortuner' }] },
            { name: 'EG Brand Ambassador', displayOrder: 8, requiredTeamInvestment: 1000000000, benefits: [{ type: 'REWARD', value: 'BMW / Audi / Mercedes' }] }
        ];

        await sequelize.transaction(async (t) => {
            // Shift existing display orders to avoid unique constraint violations
            await Rank.increment({ displayOrder: 1000 }, { where: {}, transaction: t });

            for (const rankData of ranks) {
                const [rank, created] = await Rank.findOrCreate({
                    where: { name: rankData.name },
                    defaults: rankData,
                    transaction: t
                });

                if (!created) {
                    await rank.update(rankData, { transaction: t });
                }
            }
        });

        res.json({ success: true, message: 'Ranks seeded successfully.' });
    } catch (error) {
        console.error('Rank Seed Error:', error);
        res.status(500).json({ success: false, message: 'Rank Seed Failed', error: error.message });
    }
};
