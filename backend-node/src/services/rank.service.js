const { User, UserRank, Rank, RankReward, PropertySale, Investment, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Service to handle Rank Updates based on Property Sales and Investments.
 * Implements the 40:60 Balancing Rule.
 */

const RankService = {
    /**
     * Calculate Total Team Business (Sales + Investments) recursively.
     * Note: For deeper trees, this recursive approach might hit limits, 
     * but for now it fits the current tree structure needs.
     */
    calculateTeamVolume: async (userId) => {
        // 1. Get Direct Referrals
        const directs = await User.findAll({
            where: { sponsorUserId: userId },
            attributes: ['id']
        });

        let totalVolume = 0;

        for (const direct of directs) {
            // Volume of the direct member themselves
            const directVolume = await RankService.getUserVolume(direct.id);

            // Recursive: Volume of their team
            const teamVolume = await RankService.calculateTeamVolume(direct.id);

            totalVolume += parseFloat(directVolume) + parseFloat(teamVolume);
        }

        return totalVolume;
    },

    /**
     * Get the volume of a single user (Total Sales/Investments made by them).
     */
    getUserVolume: async (userId) => {
        const sales = await PropertySale.sum('saleAmount', {
            where: {
                buyerId: userId,
                saleStatus: 'APPROVED'
            }
        });

        // Include Investments if part of the plan
        const investments = await Investment.sum('investmentAmount', {
            where: {
                userId: userId,
                status: 'ACTIVE'
            }
        });

        return (parseFloat(sales || 0) + parseFloat(investments || 0));
    },

    /**
     * Get Volumes for each Direct Leg for 40:60 Rule Analysis.
     */
    getDirectLegVolumes: async (userId) => {
        try {
            const directs = await User.findAll({
                where: { sponsorUserId: userId },
                attributes: ['id', 'username', 'fullName']
            });

            const legVolumes = [];

            for (const direct of directs) {
                // A leg's volume is the direct user's volume + their entire team's volume
                const personalVol = await RankService.getUserVolume(direct.id);
                const teamVol = await RankService.calculateTeamVolume(direct.id);
                const totalLegVol = parseFloat(personalVol) + parseFloat(teamVol);

                legVolumes.push({
                    userId: direct.id,
                    username: direct.username,
                    name: direct.fullName || direct.username,
                    volume: totalLegVol
                });
            }

            return legVolumes;
        } catch (error) {
            console.error('Error getting direct leg volumes:', error);
            return [];
        }
    },

    /**
     * Core Logic: Check and Update Rank based on 40:60 Rule.
     */
    triggerRankUpdate: async (userId) => {
        console.log(`Checking Rank Update for User ID: ${userId}`);

        const user = await User.findByPk(userId);
        if (!user || user.status !== 'ACTIVE') {
            console.log('User inactive or not activated. Skipping.');
            return;
        }

        // KYC Guard
        if (user.kycStatus !== 'APPROVED' && user.kycStatus !== 'VERIFIED') {
            console.log('User KYC not approved. Skipping rank update.');
            return;
        }

        // 1. Get Leg Volumes
        const legVolumes = await RankService.getDirectLegVolumes(userId);
        const volumes = legVolumes.map(l => l.volume);

        const totalBusiness = volumes.reduce((a, b) => a + b, 0);
        const strongestLeg = Math.max(...volumes, 0);
        const otherLegsTotal = totalBusiness - strongestLeg;

        console.log(`Total Business: ${totalBusiness}, Strongest: ${strongestLeg}, Others: ${otherLegsTotal}`);

        // 2. Define Rank Tiers (Hardcoded as per requirements, or fetch from DB if seeded)
        // Using the requirements provided:
        const rankTiers = [
            { name: 'TEAM LEADER', target: 1500000, reward: 'Android Tablet' },
            { name: 'REGIONAL HEAD', target: 5000000, reward: 'Electric Scooty' },
            { name: 'ZONAL HEAD', target: 15000000, reward: 'Royal Enfield Hunter' },
            { name: 'GENERAL MANAGER', target: 50000000, reward: 'Maruti Fronx' },
            { name: 'VP', target: 150000000, reward: 'XUV 700 / Scorpio' },
            { name: 'PRESIDENT', target: 400000000, reward: 'Toyota Fortuner' },
            { name: 'EG BRAND AMBASSADOR', target: 1000000000, reward: 'BMW/Audi/Mercedes' }
        ];

        // 3. Iterate and Check Eligibility
        for (const rank of rankTiers) {
            // 40:60 RULE
            const validFromStrongLeg = Math.min(strongestLeg, rank.target * 0.6); // Max 60%
            const validFromOtherLegs = Math.min(otherLegsTotal, rank.target * 0.4); // Min 40% (conceptually, actually just taking what is available)

            // Actually the rule usually means: To qualify for X, you need X volume. 
            // BUT max 60% of X can come from one leg. So you valid volume is:
            // Min(StrongLeg, 0.6*Target) + Rest.
            // If (Min(Strong, 0.6*Target) + Others) >= Target -> Qualified.

            const totalValidVolume = validFromStrongLeg + otherLegsTotal;
            // Note: We use otherLegsTotal directly because if they have MORE than 40% in weak legs, that is good.
            // The restriction is only on the strong leg.
            // BUT wait, standard MLM logic:
            // "Max 60% from strong leg" means weak legs *must* provide at least 40%.
            // So valid computation:
            // Take 100% of Weak Leg. Take Strong Leg BUT capped at 1.5 * Weak Leg (if 40:60 ratio)?
            // No, simplest interp:
            // CappedStrong = Min(StrongLeg, Target * 0.6)
            // CappedWeak = WeakLeg (no cap usually, or capped at Target * 0.4? No, weak leg usually has no cap).
            // Actually, if I have 1 Cr in weak leg and 1.5 Cr in strong leg, and target is 1 Cr.
            // Strong contributes max 60L. Weak contributes 1 Cr. Total 1.6 Cr >= 1 Cr. Pass.

            if (totalValidVolume >= rank.target) {
                // Check if already has this rank or higher
                // Assuming Ranks have an ID/Order. For now checking by Name if we store currentRank as string
                // Better to fetch Rank from DB to check order.
                const dbRank = await Rank.findOne({ where: { name: rank.name } });
                if (!dbRank) continue;

                const currentRankRecord = await UserRank.findOne({
                    where: { userId, isCurrent: true },
                    include: [{ model: Rank, as: 'Rank' }]
                });

                const currentOrder = currentRankRecord ? currentRankRecord.Rank.displayOrder : 0;

                if (dbRank.displayOrder > currentOrder) {
                    console.log(`Upgrading User ${userId} to ${rank.name}`);
                    await sequelize.transaction(async (t) => {
                        // Deactivate old
                        await UserRank.update({ isCurrent: false }, { where: { userId }, transaction: t });

                        // Create new
                        await UserRank.create({
                            userId,
                            rankId: dbRank.id,
                            isCurrent: true,
                            achievedAt: new Date(),
                            manualAssignment: false,
                            notes: `Auto-promoted via system. Valid Vol: ${totalValidVolume}`
                        }, { transaction: t });

                        // Update User Model string
                        await user.update({ rankName: rank.name }, { transaction: t });

                        // Create Reward Record
                        await RankReward.create({
                            userId,
                            rankId: dbRank.id,
                            rewardType: 'RANK_REWARD',
                            rewardAmount: 0, // Physical Item
                            notes: `Eligible for ${rank.reward}`,
                            status: 'PENDING'
                        }, { transaction: t });
                    });
                }
            }
        }
    },

    /**
     * Trigger for Upline (Standard MLM Bubble Up)
     */
    updateUplineRanks: async (startUserId) => {
        let currentUser = await User.findByPk(startUserId);

        // Traverse up the tree
        while (currentUser && currentUser.sponsorUserId) {
            const sponsorId = currentUser.sponsorUserId;
            await RankService.triggerRankUpdate(sponsorId);
            currentUser = await User.findByPk(sponsorId);
        }
    }
};

module.exports = RankService;
