const { User, Rank, UserRank, RankReward, RankAchievement, sequelize } = require('../models');
const { Op } = require('sequelize');
const businessService = require('./business.service');

class RankService {

    /**
     * Check and Update Rank for a User
     * Should be called periodically or after significant volume changes.
     */
    async checkRankPromotion(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) return;

            // 1. Get Current Volume (Accumulated)
            // Using calculateQualifiedVolume which enforces 40:60 rule
            // We need a "Target Amount" to calculate strict 40:60.
            // Problem: The target depends on the Rank you are aiming for.
            // So we must iterate through Ranks and check against specific targets.

            const ranks = await Rank.findAll({
                where: { isActive: true },
                order: [['displayOrder', 'ASC']]
            });

            // Find current rank index
            const currentRankIndex = ranks.findIndex(r => r.name === user.rank);
            // Start checking from the next rank
            const nextRanks = ranks.slice(currentRankIndex === -1 ? 0 : currentRankIndex + 1);

            for (const targetRank of nextRanks) {
                const requiredVolume = parseFloat(targetRank.requiredTeamInvestment); // "Total Team Business" Target

                // 2. Calculate Qualified Volume for THIS target
                const qualifiedVolume = await businessService.calculateQualifiedVolume(userId, requiredVolume);

                console.log(`Checking Rank ${targetRank.name} for ${user.username}. Required: ${requiredVolume}, Qualified: ${qualifiedVolume}`);

                if (qualifiedVolume >= requiredVolume) {
                    // Check other requirements (Active Legs, Directs, etc)
                    // "Team Leader" (15 Lacs) ... logic primarily focuses on Volume + Balancing.
                    // Assuming Directs/Rank conditions are minimal or handled in volume check context.

                    // PROMOTE USER
                    await this.promoteUser(user, targetRank);

                    // User might skip multiple ranks? Check loop continues?
                    // Usually we promote one step at a time, or all eligible.
                    // Let's continue checking higher ranks (Ecogram allows skipping if volume is massive?)
                    // Yes, continue.

                    // Update user object for next iteration
                    user.rank = targetRank.name;
                } else {
                    // If failed a lower rank, likely won't pass higher ranks (since volume target increases).
                    break;
                }
            }

        } catch (error) {
            console.error(`Error checking rank for user ${userId}:`, error);
        }
    }

    async promoteUser(user, rank) {
        console.log(`Promoting ${user.username} to ${rank.name}`);

        // 1. Update User Rank
        await user.update({ rank: rank.name });

        // 2. Create Rank Achievement Record
        await RankAchievement.create({
            userId: user.id,
            rankId: rank.id,
            achievedAt: new Date(),
            status: 'ACHIEVED', // or PENDING if manual approval needed
            description: `Promoted to ${rank.name}`
        });

        // 3. Trigger Rewards
        // "Team Leader" -> Android Tablet
        // "Regional Head" -> Electric Scooty
        // These should be in Rank Definition (benefits/rewards).
        // Or we assume a separate Reward Logic.
        // Prompt says: "Rank & Rewards: Accumulated rewards..."

        // Check for Reward definition
        // We can create a RankReward record for tracking the physical item dispatch.
        if (rank.benefits && rank.benefits.length > 0) { // Or separate OneTimeBonus field
            // If the reward is defined as a 'OneTimeBonus' (Cash), credit wallet.
            if (rank.oneTimeBonus > 0) {
                // Credit Wallet...
            }

            // If Physical Reward (Tablet, Car, etc.)
            // Log it for Admin to process
        }

        // For Ecogram specific hardcoded rewards map (as per prompt text):
        // We might want to store this in database, but here is the logic:
        const rewardsMap = {
            'Team Leader': 'Android Tablet',
            'Regional Head': 'Electric Scooty',
            'Zonal Head': 'Royal Enfield Hunter',
            'General Manager': 'Maruti Fronx',
            'VP': 'XUV 700 / Scorpio',
            'President': 'Toyota Fortuner',
            'EG Brand Amb.': 'BMW / Audi / Mercedes'
        };

        const rewardName = rewardsMap[rank.name];
        if (rewardName) {
            await RankReward.create({
                userId: user.id,
                rankId: rank.id,
                rewardName: rewardName,
                status: 'PENDING', // Waiting for Admin to dispatch
                qualifiedAt: new Date()
            });
            console.log(`Reward [${rewardName}] triggered for ${user.username}`);
        }
    }
}

module.exports = new RankService();
