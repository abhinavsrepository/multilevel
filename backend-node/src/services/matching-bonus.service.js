const { User, Income, MatchingBonusDetail, MatchingBonusConfig } = require('../models');
const { Op } = require('sequelize');

class MatchingBonusService {
    /**
     * Get matching bonus configuration for a user based on their rank
     * @param {string} rankName - User's current rank
     * @returns {Promise<Object>} - Matching bonus configuration
     */
    async getMatchingConfigByRank(rankName) {
        const config = await MatchingBonusConfig.findOne({
            where: {
                rankName: rankName,
                isActive: true
            }
        });

        // Default config if no specific config found
        if (!config) {
            return {
                rankName: rankName || 'Associate',
                matchingDepth: 0,
                matchingPercentages: {},
                requiresDirectSale: false,
                requiresActiveLegs: false,
                minPersonallySponsored: 0
            };
        }

        return config;
    }

    /**
     * Check if user is eligible for matching bonus
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - Eligibility status and details
     */
    async checkMatchingEligibility(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            return {
                eligible: false,
                reason: 'User not found'
            };
        }

        const config = await this.getMatchingConfigByRank(user.rank);

        // Check if matching depth is greater than 0
        if (config.matchingDepth === 0) {
            return {
                eligible: false,
                reason: 'Current rank does not qualify for matching bonus',
                currentRank: user.rank,
                matchingDepth: 0
            };
        }

        // Check direct sale requirement
        if (config.requiresDirectSale) {
            const hasDirectSale = await Income.count({
                where: {
                    userId: userId,
                    incomeType: 'DIRECT_SALES_COMMISSION'
                }
            }) > 0;

            if (!hasDirectSale) {
                return {
                    eligible: false,
                    reason: 'Requires at least one direct sale',
                    currentRank: user.rank,
                    matchingDepth: config.matchingDepth,
                    hasDirectSale: false
                };
            }
        }

        // Check personally sponsored requirement
        if (config.minPersonallySponsored > 0) {
            const directReferralsCount = await User.count({
                where: { sponsorId: userId }
            });

            if (directReferralsCount < config.minPersonallySponsored) {
                return {
                    eligible: false,
                    reason: `Requires ${config.minPersonallySponsored} personally sponsored agents`,
                    currentRank: user.rank,
                    matchingDepth: config.matchingDepth,
                    directReferralsCount: directReferralsCount,
                    required: config.minPersonallySponsored
                };
            }
        }

        return {
            eligible: true,
            currentRank: user.rank,
            matchingDepth: config.matchingDepth,
            matchingPercentages: config.matchingPercentages,
            config: config
        };
    }

    /**
     * Get downline users up to a specific depth
     * @param {number} userId - User ID
     * @param {number} depth - Maximum depth to traverse
     * @returns {Promise<Array>} - Array of downline users with their level
     */
    async getDownlineByDepth(userId, depth) {
        if (depth === 0) return [];

        const downlineMap = new Map();
        const queue = [{ userId, level: 0 }];

        while (queue.length > 0) {
            const { userId: currentUserId, level } = queue.shift();

            if (level >= depth) continue;

            // Get direct referrals of current user
            const directReferrals = await User.findAll({
                where: { sponsorId: currentUserId },
                attributes: ['id', 'username', 'firstName', 'lastName', 'rank', 'sponsorId']
            });

            for (const referral of directReferrals) {
                const nextLevel = level + 1;
                if (!downlineMap.has(referral.id)) {
                    downlineMap.set(referral.id, {
                        userId: referral.id,
                        username: referral.username,
                        firstName: referral.firstName,
                        lastName: referral.lastName,
                        rank: referral.rank,
                        level: nextLevel,
                        sponsorId: referral.sponsorId
                    });
                    queue.push({ userId: referral.id, level: nextLevel });
                }
            }
        }

        return Array.from(downlineMap.values());
    }

    /**
     * Calculate matching bonus for a user based on downline commissions
     * @param {number} userId - User ID
     * @param {Date} startDate - Start date of cycle
     * @param {Date} endDate - End date of cycle
     * @returns {Promise<Object>} - Calculated matching bonus details
     */
    async calculateMatchingBonus(userId, startDate, endDate) {
        // Check eligibility
        const eligibility = await this.checkMatchingEligibility(userId);
        if (!eligibility.eligible) {
            return {
                success: false,
                totalMatchingBonus: 0,
                details: [],
                eligibility: eligibility
            };
        }

        const { matchingDepth, matchingPercentages } = eligibility;

        // Get downline up to matching depth
        const downline = await this.getDownlineByDepth(userId, matchingDepth);

        if (downline.length === 0) {
            return {
                success: true,
                totalMatchingBonus: 0,
                details: [],
                eligibility: eligibility
            };
        }

        const downlineUserIds = downline.map(d => d.userId);

        // Get all commissions earned by downline users in the date range
        const downlineCommissions = await Income.findAll({
            where: {
                userId: { [Op.in]: downlineUserIds },
                incomeType: { [Op.in]: ['BINARY', 'LEVEL_COMMISSION', 'DIRECT_BONUS'] },
                status: { [Op.in]: ['APPROVED', 'PAID'] },
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'rank']
                }
            ]
        });

        // Calculate matching bonus for each downline commission
        const details = [];
        let totalMatchingBonus = 0;

        for (const commission of downlineCommissions) {
            const downlineUser = downline.find(d => d.userId === commission.userId);
            if (!downlineUser) continue;

            const level = downlineUser.level;
            const matchPercentage = matchingPercentages[level] || 0;

            if (matchPercentage > 0) {
                const contributionAmount = (commission.amount * matchPercentage) / 100;

                details.push({
                    downlineUserId: commission.userId,
                    downlineUsername: commission.User.username,
                    downlineName: `${commission.User.firstName} ${commission.User.lastName}`,
                    downlineLevel: level,
                    baseCommissionType: commission.incomeType,
                    baseCommissionAmount: parseFloat(commission.amount),
                    matchedPercentage: parseFloat(matchPercentage),
                    contributionAmount: parseFloat(contributionAmount.toFixed(2)),
                    commissionDate: commission.createdAt
                });

                totalMatchingBonus += contributionAmount;
            }
        }

        return {
            success: true,
            totalMatchingBonus: parseFloat(totalMatchingBonus.toFixed(2)),
            details: details,
            eligibility: eligibility,
            downlineCount: downline.length,
            matchedCommissionsCount: details.length
        };
    }

    /**
     * Create matching bonus income record and details
     * @param {number} userId - User ID
     * @param {Date} startDate - Cycle start date
     * @param {Date} endDate - Cycle end date
     * @returns {Promise<Object>} - Created income record
     */
    async createMatchingBonusIncome(userId, startDate, endDate) {
        const calculation = await this.calculateMatchingBonus(userId, startDate, endDate);

        if (!calculation.success || calculation.totalMatchingBonus === 0) {
            return {
                success: false,
                message: calculation.eligibility?.reason || 'No matching bonus earned',
                data: null
            };
        }

        // Create income record
        const income = await Income.create({
            userId: userId,
            incomeType: 'MATCHING',
            amount: calculation.totalMatchingBonus,
            status: 'PENDING',
            remarks: `Matching Bonus for cycle ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`
        });

        // Create detail records
        const detailRecords = calculation.details.map(detail => ({
            incomeId: income.id,
            userId: userId,
            downlineUserId: detail.downlineUserId,
            downlineLevel: detail.downlineLevel,
            baseCommissionType: detail.baseCommissionType,
            baseCommissionAmount: detail.baseCommissionAmount,
            matchedPercentage: detail.matchedPercentage,
            contributionAmount: detail.contributionAmount,
            cycleStartDate: startDate,
            cycleEndDate: endDate,
            metadata: {
                downlineUsername: detail.downlineUsername,
                downlineName: detail.downlineName,
                commissionDate: detail.commissionDate
            }
        }));

        await MatchingBonusDetail.bulkCreate(detailRecords);

        return {
            success: true,
            message: 'Matching bonus created successfully',
            data: {
                incomeId: income.id,
                amount: calculation.totalMatchingBonus,
                detailsCount: detailRecords.length
            }
        };
    }

    /**
     * Get matching bonus details for a specific income record
     * @param {number} incomeId - Income record ID
     * @returns {Promise<Array>} - Array of matching bonus details
     */
    async getMatchingBonusDetails(incomeId) {
        const details = await MatchingBonusDetail.findAll({
            where: { incomeId: incomeId },
            include: [
                {
                    model: User,
                    as: 'DownlineAgent',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'rank']
                }
            ],
            order: [['downlineLevel', 'ASC'], ['contributionAmount', 'DESC']]
        });

        return details.map(detail => ({
            id: detail.id,
            downlineUserId: detail.downlineUserId,
            downlineUsername: detail.DownlineAgent.username,
            downlineName: `${detail.DownlineAgent.firstName} ${detail.DownlineAgent.lastName}`,
            downlineRank: detail.DownlineAgent.rank,
            level: detail.downlineLevel,
            baseCommissionType: detail.baseCommissionType,
            baseCommissionAmount: parseFloat(detail.baseCommissionAmount),
            matchedPercentage: parseFloat(detail.matchedPercentage),
            contributionAmount: parseFloat(detail.contributionAmount),
            cycleStartDate: detail.cycleStartDate,
            cycleEndDate: detail.cycleEndDate
        }));
    }

    /**
     * Get next rank requirements for matching bonus
     * @param {string} currentRank - User's current rank
     * @returns {Promise<Object>} - Next rank details and requirements
     */
    async getNextRankRequirements(currentRank) {
        const currentConfig = await MatchingBonusConfig.findOne({
            where: { rankName: currentRank, isActive: true }
        });

        const nextConfig = await MatchingBonusConfig.findOne({
            where: {
                displayOrder: { [Op.gt]: currentConfig?.displayOrder || 0 },
                isActive: true
            },
            order: [['displayOrder', 'ASC']]
        });

        if (!nextConfig) {
            return {
                hasNext: false,
                message: 'You have reached the highest rank'
            };
        }

        return {
            hasNext: true,
            currentRank: currentRank,
            currentMatchingDepth: currentConfig?.matchingDepth || 0,
            nextRank: nextConfig.rankName,
            nextMatchingDepth: nextConfig.matchingDepth,
            requirements: {
                minPersonallySponsored: nextConfig.minPersonallySponsored,
                requiresDirectSale: nextConfig.requiresDirectSale,
                requiresActiveLegs: nextConfig.requiresActiveLegs
            }
        };
    }
}

module.exports = new MatchingBonusService();
