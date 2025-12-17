const { User, Rank, UserRank, Investment, Commission, Wallet } = require('../models');
const { Op } = require('sequelize');

/**
 * Check and auto-upgrade user's rank based on achievements
 * Called after investment or when team stats change
 */
exports.checkRankQualification = async (userId) => {
    try {
        console.log(`Checking rank qualification for user: ${userId}`);

        const user = await User.findByPk(userId);
        if (!user) return;

        // Get user's current rank
        const currentUserRank = await UserRank.findOne({
            where: { userId: userId },
            include: [{ model: Rank, as: 'Rank' }],
            order: [['achievedAt', 'DESC']]
        });

        const currentRankOrder = currentUserRank?.Rank?.displayOrder || 0;

        // Get all ranks ordered by display order
        const allRanks = await Rank.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        // Calculate user's qualifications
        const qualifications = await calculateUserQualifications(userId);

        // Find the highest rank the user qualifies for
        let highestQualifiedRank = null;

        for (const rank of allRanks) {
            // Skip if already achieved
            if (rank.displayOrder <= currentRankOrder) continue;

            // Check if user meets all requirements
            const qualified = await checkRankRequirements(rank, qualifications);

            if (qualified) {
                highestQualifiedRank = rank;
            } else {
                // Stop at first unqualified rank (must achieve sequentially)
                break;
            }
        }

        // If user qualified for a new rank, award it
        if (highestQualifiedRank) {
            await awardRank(userId, highestQualifiedRank);
        }

    } catch (error) {
        console.error('Error checking rank qualification:', error);
    }
};

/**
 * Calculate user's current qualifications (directs, team investment, personal investment)
 */
async function calculateUserQualifications(userId) {
    try {
        // Count direct referrals
        const directReferralsCount = await User.count({
            where: { sponsorId: userId }
        });

        // Calculate personal investment
        const personalInvestment = await Investment.sum('investmentAmount', {
            where: {
                userId: userId,
                status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
            }
        }) || 0;

        // Calculate team investment (downline)
        const descendantIds = await getDescendantIds(userId);
        const teamInvestment = await Investment.sum('investmentAmount', {
            where: {
                userId: { [Op.in]: descendantIds },
                status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
            }
        }) || 0;

        // Calculate total group business volume (for 40:40:20 requirement if needed)
        const groupBV = await calculateGroupBV(userId);

        return {
            directReferrals: directReferralsCount,
            personalInvestment: personalInvestment,
            teamInvestment: teamInvestment,
            totalBusiness: personalInvestment + teamInvestment,
            groupBV: groupBV
        };

    } catch (error) {
        console.error('Error calculating qualifications:', error);
        return {
            directReferrals: 0,
            personalInvestment: 0,
            teamInvestment: 0,
            totalBusiness: 0,
            groupBV: { group1: 0, group2: 0, group3: 0 }
        };
    }
}

/**
 * Check if user meets rank requirements
 */
function checkRankRequirements(rank, qualifications) {
    // Check direct referrals requirement
    if (qualifications.directReferrals < rank.requiredDirectReferrals) {
        return false;
    }

    // Check personal investment requirement
    if (qualifications.personalInvestment < parseFloat(rank.requiredPersonalInvestment)) {
        return false;
    }

    // Check team investment requirement
    if (qualifications.teamInvestment < parseFloat(rank.requiredTeamInvestment)) {
        return false;
    }

    // Check active legs requirement (40:40:20 ratio)
    if (rank.requireActiveLegs) {
        const { group1, group2, group3 } = qualifications.groupBV;
        const total = group1 + group2 + group3;

        if (total === 0) return false;

        const g1Percent = (group1 / total) * 100;
        const g2Percent = (group2 / total) * 100;
        const g3Percent = (group3 / total) * 100;

        // Check 40:40:20 ratio (allow ±5% variance)
        const ratioQualified = (
            g1Percent >= 35 && g1Percent <= 45 &&
            g2Percent >= 35 && g2Percent <= 45 &&
            g3Percent >= 15 && g3Percent <= 25
        );

        if (!ratioQualified) return false;
    }

    return true;
}

/**
 * Award rank to user and distribute rewards
 */
async function awardRank(userId, rank) {
    try {
        console.log(`Awarding rank ${rank.name} to user ${userId}`);

        const user = await User.findByPk(userId);

        // Create UserRank record
        await UserRank.create({
            userId: userId,
            rankId: rank.id,
            achievedAt: new Date(),
            isAutomatic: true
        });

        // Update user's rank field
        await user.update({ rank: rank.name });

        // Award one-time bonus
        const oneTimeBonus = parseFloat(rank.oneTimeBonus);
        if (oneTimeBonus > 0) {
            await Commission.create({
                commissionId: `RANK-BONUS-${rank.id}-${Date.now()}-${userId}`,
                userId: userId,
                commissionType: 'RANK_ACHIEVEMENT',
                amount: oneTimeBonus,
                description: `${rank.name} Rank Achievement Bonus`,
                status: 'EARNED'
            });

            await updateWallet(userId, oneTimeBonus);
            console.log(`Awarded ${oneTimeBonus} rank bonus to user ${userId}`);
        }

        // Note: Monthly bonus will be distributed separately via cron job

    } catch (error) {
        console.error('Error awarding rank:', error);
    }
}

/**
 * Distribute monthly bonuses to all ranked users
 * Run via cron job at the start of each month
 */
exports.distributeMonthlyRankBonuses = async () => {
    try {
        console.log('Distributing monthly rank bonuses...');

        // Get all ranks with monthly bonuses
        const ranksWithBonuses = await Rank.findAll({
            where: {
                monthlyBonus: { [Op.gt]: 0 },
                isActive: true
            }
        });

        for (const rank of ranksWithBonuses) {
            // Find all users with this rank
            const userRanks = await UserRank.findAll({
                where: { rankId: rank.id },
                include: [{ model: User, where: { status: 'ACTIVE' } }]
            });

            const monthlyBonus = parseFloat(rank.monthlyBonus);

            for (const userRank of userRanks) {
                await Commission.create({
                    commissionId: `MONTHLY-RANK-${rank.id}-${Date.now()}-${userRank.userId}`,
                    userId: userRank.userId,
                    commissionType: 'RANK_MONTHLY',
                    amount: monthlyBonus,
                    description: `${rank.name} Monthly Rank Bonus`,
                    status: 'EARNED'
                });

                await updateWallet(userRank.userId, monthlyBonus);
            }

            console.log(`Distributed monthly bonus to ${userRanks.length} ${rank.name} members`);
        }

        console.log('Monthly rank bonus distribution completed');

    } catch (error) {
        console.error('Error distributing monthly rank bonuses:', error);
    }
};

/**
 * Get descendant IDs for a user
 */
async function getDescendantIds(userId) {
    let descendants = [];
    let queue = [userId];
    let loops = 0;
    const MAX_LOOPS = 10000;

    while (queue.length > 0 && loops < MAX_LOOPS) {
        const currentId = queue.shift();
        const directReports = await User.findAll({
            where: { sponsorId: currentId },
            attributes: ['id']
        });

        if (directReports.length > 0) {
            const ids = directReports.map(u => u.id);
            descendants = [...descendants, ...ids];
            queue = [...queue, ...ids];
        }
        loops++;
    }

    return descendants;
}

/**
 * Calculate group BV for 40:40:20 ratio check
 */
async function calculateGroupBV(userId) {
    try {
        // Get direct referrals
        const directReferrals = await User.findAll({
            where: { sponsorId: userId },
            attributes: ['id']
        });

        if (directReferrals.length === 0) {
            return { group1: 0, group2: 0, group3: 0 };
        }

        // Calculate volume for each leg
        const legVolumes = [];
        for (const referral of directReferrals) {
            const volume = await calculateLegVolume(referral.id);
            legVolumes.push(volume);
        }

        // Sort and take top 3
        legVolumes.sort((a, b) => b - a);

        return {
            group1: legVolumes[0] || 0,
            group2: legVolumes[1] || 0,
            group3: legVolumes[2] || 0
        };

    } catch (error) {
        console.error('Error calculating group BV:', error);
        return { group1: 0, group2: 0, group3: 0 };
    }
}

/**
 * Calculate leg volume
 */
async function calculateLegVolume(userId) {
    const descendantIds = await getDescendantIds(userId);
    descendantIds.push(userId);

    const volume = await Investment.sum('investmentAmount', {
        where: {
            userId: { [Op.in]: descendantIds },
            status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
        }
    });

    return volume || 0;
}

/**
 * Update wallet
 */
async function updateWallet(userId, amount) {
    try {
        const wallet = await Wallet.findOne({ where: { userId } });
        if (wallet) {
            await wallet.increment('commissionBalance', { by: amount });
            await wallet.increment('totalEarned', { by: amount });
        }
    } catch (error) {
        console.error(`Error updating wallet for user ${userId}:`, error);
    }
}

/**
 * Get rank progress for a user
 */
exports.getRankProgress = async (userId) => {
    try {
        const qualifications = await calculateUserQualifications(userId);

        // Get current rank
        const currentUserRank = await UserRank.findOne({
            where: { userId: userId },
            include: [{ model: Rank, as: 'Rank' }],
            order: [['achievedAt', 'DESC']]
        });

        const currentRankOrder = currentUserRank?.Rank?.displayOrder || 0;

        // Get next rank
        const nextRank = await Rank.findOne({
            where: {
                displayOrder: { [Op.gt]: currentRankOrder },
                isActive: true
            },
            order: [['displayOrder', 'ASC']]
        });

        if (!nextRank) {
            return {
                currentRank: currentUserRank?.Rank?.name || 'Associate',
                nextRank: null,
                progress: null
            };
        }

        // Calculate progress towards next rank
        const progress = {
            directReferrals: {
                current: qualifications.directReferrals,
                required: nextRank.requiredDirectReferrals,
                percentage: (qualifications.directReferrals / nextRank.requiredDirectReferrals) * 100
            },
            personalInvestment: {
                current: qualifications.personalInvestment,
                required: parseFloat(nextRank.requiredPersonalInvestment),
                percentage: (qualifications.personalInvestment / parseFloat(nextRank.requiredPersonalInvestment)) * 100
            },
            teamInvestment: {
                current: qualifications.teamInvestment,
                required: parseFloat(nextRank.requiredTeamInvestment),
                percentage: (qualifications.teamInvestment / parseFloat(nextRank.requiredTeamInvestment)) * 100
            }
        };

        return {
            currentRank: currentUserRank?.Rank?.name || 'Associate',
            nextRank: nextRank.name,
            progress: progress,
            qualifications: qualifications
        };

    } catch (error) {
        console.error('Error getting rank progress:', error);
        throw error;
    }
};
