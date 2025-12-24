const { Rank, sequelize } = require('../models');

async function seedRanks() {
    console.log('Starting Rank Seeding for Ecogram...');

    // Define Ecogram Ranks
    // Targets are in "Team Business" (Total)
    // 15 Lacs = 1,500,000
    // 50 Lacs = 5,000,000
    // 1.5 Cr = 15,000,000
    // 5 Cr = 50,000,000
    // 15 Cr = 150,000,000
    // 40 Cr = 400,000,000
    // 100 Cr = 1,000,000,000

    const ranks = [
        {
            name: 'Associate', // Base Rank
            displayOrder: 1,
            requiredTeamInvestment: 0,
            commissionBoost: 0,
            benefits: []
        },
        {
            name: 'Team Leader',
            displayOrder: 2,
            requiredTeamInvestment: 1500000, // 15 Lacs
            benefits: [{ type: 'REWARD', value: 'Android Tablet' }]
        },
        {
            name: 'Regional Head',
            displayOrder: 3,
            requiredTeamInvestment: 5000000, // 50 Lacs
            benefits: [{ type: 'REWARD', value: 'Electric Scooty' }]
        },
        {
            name: 'Zonal Head',
            displayOrder: 4,
            requiredTeamInvestment: 15000000, // 1.5 Cr
            benefits: [{ type: 'REWARD', value: 'Royal Enfield Hunter' }]
        },
        {
            name: 'General Manager',
            displayOrder: 5,
            requiredTeamInvestment: 50000000, // 5 Cr
            benefits: [{ type: 'REWARD', value: 'Maruti Fronx' }]
        },
        {
            name: 'VP', // Vice President
            displayOrder: 6,
            requiredTeamInvestment: 150000000, // 15 Cr
            benefits: [{ type: 'REWARD', value: 'XUV 700 / Scorpio' }]
        },
        {
            name: 'President',
            displayOrder: 7,
            requiredTeamInvestment: 400000000, // 40 Cr
            benefits: [{ type: 'REWARD', value: 'Toyota Fortuner' }]
        },
        {
            name: 'EG Brand Ambassador', // Top Rank
            displayOrder: 8,
            requiredTeamInvestment: 1000000000, // 100 Cr
            benefits: [{ type: 'REWARD', value: 'BMW / Audi / Mercedes' }]
        }
    ];

    try {
        await sequelize.transaction(async (t) => {
            // Option A: Clear existing ranks (Safe for dev, risky for prod if UserRanks exist)
            // For implementation phase, we update or create.

            for (const rankData of ranks) {
                const [rank, created] = await Rank.findOrCreate({
                    where: { name: rankData.name },
                    defaults: rankData,
                    transaction: t
                });

                if (!created) {
                    await rank.update(rankData, { transaction: t });
                    console.log(`Updated Rank: ${rank.name}`);
                } else {
                    console.log(`Created Rank: ${rank.name}`);
                }
            }
        });

        console.log('Rank Seeding Completed Successfully.');
    } catch (error) {
        console.error('Error seeding ranks:', error);
    }
}

// Check if running directly
if (require.main === module) {
    seedRanks().then(() => process.exit(0));
} else {
    module.exports = seedRanks;
}
