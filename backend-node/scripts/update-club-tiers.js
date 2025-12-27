
require('dotenv').config();
const { sequelize, ClubTier } = require('../src/models');
const { Op } = require('sequelize');

async function updateClubTiers() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Ensure table exists
        await ClubTier.sync();
        console.log('ClubTier table synced.');

        // 1. Get all existing tiers
        const existingTiers = await ClubTier.findAll();

        // Map updates
        const updates = [
            { search: ['Silver', 'Rising Stars Club'], newName: 'Rising Stars Club', newTarget: 10000000.00, order: 1 },
            { search: ['Gold', 'Business Leaders Club'], newName: 'Business Leaders Club', newTarget: 25000000.00, order: 2 },
            { search: ['Diamond', 'Millionaire CLUB'], newName: 'Millionaire CLUB', newTarget: 50000000.00, order: 3 }
        ];

        for (const update of updates) {
            let found = false;
            // Try to find a tier matching any of the search names
            for (const name of update.search) {
                const tier = existingTiers.find(t => t.name === name);
                if (tier) {
                    console.log(`Updating tier id ${tier.id} (${tier.name}) -> ${update.newName}`);
                    await tier.update({
                        name: update.newName,
                        requiredTeamBusiness: update.newTarget,
                        displayOrder: update.order
                    });
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log(`Creating missing tier: ${update.newName}`);
                await ClubTier.create({
                    name: update.newName,
                    requiredTeamBusiness: update.newTarget,
                    displayOrder: update.order,
                    bonusPercentage: 1.00 // Default
                });
            }
        }

        console.log('All updates completed successfully.');

    } catch (error) {
        console.error('Error updating club tiers:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

updateClubTiers();
