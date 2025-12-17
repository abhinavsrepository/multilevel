const { Bonanza, BonanzaQualification, User, Investment, Commission, Wallet, Income } = require('../models');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

/**
 * REAL-TIME QUALIFICATION ENGINE
 * This is the core engine that acts as the impartial judge for all Bonanza qualifications
 */

/**
 * Check user qualification against a bonanza in real-time
 * This should be triggered on ANY relevant activity (investment, referral, team activity)
 */
exports.checkAndUpdateQualification = async (userId, activityType = 'GENERAL') => {
    try {
        console.log(`[Bonanza Engine] Checking qualifications for user ${userId} after ${activityType}`);

        // Get all active bonanzas that are visible
        const activeBonanzas = await Bonanza.findAll({
            where: {
                status: 'ACTIVE',
                isVisible: true
            }
        });

        if (activeBonanzas.length === 0) {
            return { checked: 0, qualified: 0 };
        }

        let qualifiedCount = 0;

        // Check each bonanza
        for (const bonanza of activeBonanzas) {
            const isQualified = await checkSingleBonanzaQualification(userId, bonanza);
            if (isQualified) {
                qualifiedCount++;
            }
        }

        return {
            checked: activeBonanzas.length,
            qualified: qualifiedCount
        };

    } catch (error) {
        console.error('[Bonanza Engine] Error checking qualifications:', error);
        throw error;
    }
};

/**
 * Check if user qualifies for a specific bonanza
 * Returns true if newly qualified
 */
async function checkSingleBonanzaQualification(userId, bonanza) {
    try {
        // Get or create qualification record
        let qualification = await BonanzaQualification.findOne({
            where: {
                bonanzaId: bonanza.id,
                userId: userId
            }
        });

        // Don't recheck if already qualified/awarded
        if (qualification && ['QUALIFIED', 'AWARDED'].includes(qualification.status)) {
            return false;
        }

        // Check if max qualifiers reached
        if (bonanza.maxQualifiers && bonanza.currentQualifiers >= bonanza.maxQualifiers) {
            if (qualification && qualification.status !== 'DISQUALIFIED') {
                await qualification.update({
                    status: 'DISQUALIFIED',
                    notes: 'Maximum qualifiers limit reached'
                });
            }
            return false;
        }

        // Calculate current progress
        const progressData = await calculateUserProgress(userId, bonanza);

        // Check if all criteria are met
        const meetsAllCriteria = checkAllCriteria(progressData, bonanza.qualificationCriteria);

        // Create or update qualification record
        if (!qualification) {
            qualification = await BonanzaQualification.create({
                bonanzaId: bonanza.id,
                userId: userId,
                status: meetsAllCriteria ? 'QUALIFIED' : 'IN_PROGRESS',
                progressData: progressData,
                salesProgress: progressData.salesProgress || 0,
                referralProgress: progressData.referralProgress || 0,
                teamVolumeProgress: progressData.teamVolumeProgress || 0,
                overallProgress: progressData.overallProgress || 0,
                firstActivityDate: new Date(),
                qualifiedDate: meetsAllCriteria ? new Date() : null,
                expiryDate: calculateExpiryDate(userId, bonanza),
                leaderboardScore: calculateLeaderboardScore(progressData, bonanza)
            });
        } else {
            const updateData = {
                progressData: progressData,
                salesProgress: progressData.salesProgress || 0,
                referralProgress: progressData.referralProgress || 0,
                teamVolumeProgress: progressData.teamVolumeProgress || 0,
                overallProgress: progressData.overallProgress || 0,
                leaderboardScore: calculateLeaderboardScore(progressData, bonanza)
            };

            // If newly qualified
            if (meetsAllCriteria && qualification.status !== 'QUALIFIED') {
                updateData.status = 'QUALIFIED';
                updateData.qualifiedDate = new Date();
            } else if (!meetsAllCriteria && qualification.status === 'PENDING') {
                updateData.status = 'IN_PROGRESS';
            }

            await qualification.update(updateData);
        }

        // If newly qualified, award the reward
        if (meetsAllCriteria && qualification.status === 'QUALIFIED' && !qualification.awardedDate) {
            await awardBonanzaReward(userId, bonanza, qualification.id);
            return true;
        }

        return false;

    } catch (error) {
        console.error('[Bonanza Engine] Error checking single qualification:', error);
        throw error;
    }
}

/**
 * Calculate user's current progress for a bonanza
 */
async function calculateUserProgress(userId, bonanza) {
    try {
        const criteria = bonanza.qualificationCriteria;
        const { startDate, endDate, periodType } = bonanza;

        // Determine the date range for calculations
        const dateRange = await calculateDateRange(userId, bonanza);

        const progress = {
            salesVolume: 0,
            directReferrals: 0,
            teamVolume: 0,
            groupVolumes: [],
            plotBookings: 0,
            currentRank: null,
            currentClub: null,
            salesProgress: 0,
            referralProgress: 0,
            teamVolumeProgress: 0,
            overallProgress: 0
        };

        // Get user details
        const user = await User.findByPk(userId, {
            attributes: ['id', 'rank', 'clubStatus', 'createdAt']
        });

        if (!user) return progress;

        progress.currentRank = user.rank;
        progress.currentClub = user.clubStatus;

        // 1. Calculate Sales Volume (Personal Investment)
        if (criteria.salesVolume) {
            const totalSales = await Investment.sum('investmentAmount', {
                where: {
                    userId: userId,
                    createdAt: {
                        [Op.between]: [dateRange.start, dateRange.end]
                    },
                    status: { [Op.in]: ['ACTIVE', 'COMPLETED', 'APPROVED'] }
                }
            });
            progress.salesVolume = totalSales || 0;
            progress.salesProgress = Math.min((progress.salesVolume / criteria.salesVolume) * 100, 100);
        }

        // 2. Calculate Direct Referrals (New Direct Signups)
        if (criteria.directReferrals) {
            const referralCount = await User.count({
                where: {
                    referredBy: userId,
                    createdAt: {
                        [Op.between]: [dateRange.start, dateRange.end]
                    },
                    status: { [Op.ne]: 'BLOCKED' }
                }
            });
            progress.directReferrals = referralCount;
            progress.referralProgress = Math.min((progress.directReferrals / criteria.directReferrals) * 100, 100);
        }

        // 3. Calculate Team Volume
        if (criteria.teamVolume) {
            const teamVolume = await calculateTeamVolume(userId, dateRange.start, dateRange.end);
            progress.teamVolume = teamVolume;
            progress.teamVolumeProgress = Math.min((progress.teamVolume / criteria.teamVolume) * 100, 100);
        }

        // 4. Calculate Group Volumes (for 40:40:20 ratio check)
        if (criteria.groupRatio) {
            progress.groupVolumes = await calculateGroupVolumes(userId, dateRange.start, dateRange.end);
        }

        // 5. Calculate Plot Bookings (if applicable)
        if (criteria.plotBookings) {
            const plotCount = await Investment.count({
                where: {
                    userId: userId,
                    createdAt: {
                        [Op.between]: [dateRange.start, dateRange.end]
                    },
                    status: { [Op.in]: ['ACTIVE', 'COMPLETED', 'APPROVED'] }
                }
            });
            progress.plotBookings = plotCount;
        }

        // Calculate Overall Progress
        const progressMetrics = [
            progress.salesProgress,
            progress.referralProgress,
            progress.teamVolumeProgress
        ].filter(p => p > 0);

        progress.overallProgress = progressMetrics.length > 0
            ? progressMetrics.reduce((a, b) => a + b, 0) / progressMetrics.length
            : 0;

        return progress;

    } catch (error) {
        console.error('[Bonanza Engine] Error calculating progress:', error);
        return {};
    }
}

/**
 * Calculate team volume for a user
 */
async function calculateTeamVolume(userId, startDate, endDate) {
    try {
        // Get all downline users
        const downlineUsers = await getDownlineUsers(userId);

        if (downlineUsers.length === 0) return 0;

        // Calculate total investment from all downline
        const totalVolume = await Investment.sum('investmentAmount', {
            where: {
                userId: { [Op.in]: downlineUsers },
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                status: { [Op.in]: ['ACTIVE', 'COMPLETED', 'APPROVED'] }
            }
        });

        return totalVolume || 0;

    } catch (error) {
        console.error('[Bonanza Engine] Error calculating team volume:', error);
        return 0;
    }
}

/**
 * Calculate group volumes for ratio validation (40:40:20)
 */
async function calculateGroupVolumes(userId, startDate, endDate) {
    try {
        // Get direct referrals (first level)
        const directReferrals = await User.findAll({
            where: { referredBy: userId },
            attributes: ['id']
        });

        if (directReferrals.length === 0) return [];

        const groupVolumes = [];

        // For each direct referral, calculate their leg volume
        for (const referral of directReferrals) {
            const legVolume = await calculateTeamVolume(referral.id, startDate, endDate);

            // Include the direct referral's own investment
            const directVolume = await Investment.sum('investmentAmount', {
                where: {
                    userId: referral.id,
                    createdAt: {
                        [Op.between]: [startDate, endDate]
                    },
                    status: { [Op.in]: ['ACTIVE', 'COMPLETED', 'APPROVED'] }
                }
            });

            groupVolumes.push({
                userId: referral.id,
                volume: (legVolume || 0) + (directVolume || 0)
            });
        }

        // Sort by volume descending
        groupVolumes.sort((a, b) => b.volume - a.volume);

        return groupVolumes;

    } catch (error) {
        console.error('[Bonanza Engine] Error calculating group volumes:', error);
        return [];
    }
}

/**
 * Get all downline users recursively
 */
async function getDownlineUsers(userId, maxDepth = 10) {
    try {
        const downline = [];
        const queue = [{ userId, depth: 0 }];
        const visited = new Set();

        while (queue.length > 0) {
            const { userId: currentUserId, depth } = queue.shift();

            if (visited.has(currentUserId) || depth >= maxDepth) {
                continue;
            }

            visited.add(currentUserId);

            const directReferrals = await User.findAll({
                where: { referredBy: currentUserId },
                attributes: ['id']
            });

            for (const referral of directReferrals) {
                downline.push(referral.id);
                queue.push({ userId: referral.id, depth: depth + 1 });
            }
        }

        return downline;

    } catch (error) {
        console.error('[Bonanza Engine] Error getting downline:', error);
        return [];
    }
}

/**
 * Check if user meets all criteria
 */
function checkAllCriteria(progressData, criteria) {
    if (!criteria || Object.keys(criteria).length === 0) {
        return false;
    }

    let allMet = true;

    // Check sales volume
    if (criteria.salesVolume && progressData.salesVolume < criteria.salesVolume) {
        allMet = false;
    }

    // Check direct referrals
    if (criteria.directReferrals && progressData.directReferrals < criteria.directReferrals) {
        allMet = false;
    }

    // Check team volume
    if (criteria.teamVolume && progressData.teamVolume < criteria.teamVolume) {
        allMet = false;
    }

    // Check group ratio (40:40:20)
    if (criteria.groupRatio && progressData.groupVolumes) {
        const ratioMet = checkGroupRatio(progressData.groupVolumes, criteria.groupRatio);
        if (!ratioMet) {
            allMet = false;
        }
    }

    // Check rank requirement
    if (criteria.minRank && (!progressData.currentRank || !meetsRankRequirement(progressData.currentRank, criteria.minRank))) {
        allMet = false;
    }

    // Check club requirement
    if (criteria.minClub && (!progressData.currentClub || !meetsClubRequirement(progressData.currentClub, criteria.minClub))) {
        allMet = false;
    }

    // Check plot bookings
    if (criteria.plotBookings && progressData.plotBookings < criteria.plotBookings) {
        allMet = false;
    }

    return allMet;
}

/**
 * Check if group volumes meet the required ratio (e.g., 40:40:20)
 */
function checkGroupRatio(groupVolumes, requiredRatio) {
    if (!groupVolumes || groupVolumes.length < 3) {
        return false;
    }

    // Get top 3 groups
    const top3 = groupVolumes.slice(0, 3);
    const totalVolume = top3.reduce((sum, g) => sum + g.volume, 0);

    if (totalVolume === 0) return false;

    // Calculate actual ratios
    const ratios = top3.map(g => (g.volume / totalVolume) * 100);

    // Check if ratios meet the requirement (with 5% tolerance)
    const tolerance = 5;
    const leg1Required = requiredRatio.leg1 || 40;
    const leg2Required = requiredRatio.leg2 || 40;
    const leg3Required = requiredRatio.leg3 || 20;

    return (
        ratios[0] >= leg1Required - tolerance &&
        ratios[1] >= leg2Required - tolerance &&
        ratios[2] >= leg3Required - tolerance
    );
}

/**
 * Check if current rank meets minimum requirement
 */
function meetsRankRequirement(currentRank, minRank) {
    const rankHierarchy = ['STARTER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CROWN'];
    const currentIndex = rankHierarchy.indexOf(currentRank);
    const requiredIndex = rankHierarchy.indexOf(minRank);
    return currentIndex >= requiredIndex;
}

/**
 * Check if current club meets minimum requirement
 */
function meetsClubRequirement(currentClub, minClub) {
    const clubHierarchy = ['NONE', 'SILVER', 'GOLD', 'DIAMOND'];
    const currentIndex = clubHierarchy.indexOf(currentClub);
    const requiredIndex = clubHierarchy.indexOf(minClub);
    return currentIndex >= requiredIndex;
}

/**
 * Calculate date range based on period type
 */
async function calculateDateRange(userId, bonanza) {
    const { periodType, startDate, endDate, periodDays } = bonanza;

    if (periodType === 'FIXED_DATES') {
        return {
            start: new Date(startDate),
            end: new Date(endDate)
        };
    }

    if (periodType === 'FROM_JOIN_DATE') {
        const user = await User.findByPk(userId, { attributes: ['createdAt'] });
        if (!user) return { start: new Date(), end: new Date() };

        const joinDate = new Date(user.createdAt);
        const expiryDate = new Date(joinDate);
        expiryDate.setDate(expiryDate.getDate() + (periodDays || 60));

        return {
            start: joinDate,
            end: expiryDate
        };
    }

    // Default to bonanza dates
    return {
        start: new Date(startDate),
        end: new Date(endDate)
    };
}

/**
 * Calculate expiry date for user
 */
async function calculateExpiryDate(userId, bonanza) {
    if (bonanza.periodType === 'FROM_JOIN_DATE') {
        const user = await User.findByPk(userId, { attributes: ['createdAt'] });
        if (!user) return new Date(bonanza.endDate);

        const expiryDate = new Date(user.createdAt);
        expiryDate.setDate(expiryDate.getDate() + (bonanza.periodDays || 60));
        return expiryDate;
    }

    return new Date(bonanza.endDate);
}

/**
 * Calculate leaderboard score
 */
function calculateLeaderboardScore(progressData, bonanza) {
    // Weighted score based on multiple factors
    const salesWeight = 0.4;
    const referralWeight = 0.3;
    const teamWeight = 0.3;

    const score =
        (progressData.salesVolume || 0) * salesWeight +
        (progressData.directReferrals || 0) * 100000 * referralWeight +
        (progressData.teamVolume || 0) * teamWeight;

    return score;
}

/**
 * Award bonanza reward to qualified user
 */
async function awardBonanzaReward(userId, bonanza, qualificationId) {
    const transaction = await sequelize.transaction();

    try {
        console.log(`[Bonanza Engine] Awarding reward to user ${userId} for bonanza ${bonanza.name}`);

        // Calculate reward amount
        const rewardAmount = calculateRewardAmount(bonanza);

        // Create Income record
        const income = await Income.create({
            userId: userId,
            incomeType: 'BONANZA',
            amount: rewardAmount,
            referenceType: 'BONANZA',
            referenceId: bonanza.id,
            description: `Bonanza Achievement: ${bonanza.name}`,
            status: 'EARNED',
            processedAt: new Date()
        }, { transaction });

        // Update qualification record
        await BonanzaQualification.update({
            status: 'AWARDED',
            awardedDate: new Date(),
            rewardAmount: rewardAmount,
            rewardType: bonanza.rewardType,
            incomeId: income.id
        }, {
            where: { id: qualificationId },
            transaction
        });

        // Update wallet if cash reward
        if (rewardAmount > 0) {
            await updateWallet(userId, rewardAmount, transaction);
        }

        // Update bonanza stats
        await bonanza.increment('currentQualifiers', { by: 1, transaction });
        await bonanza.increment('totalPaidOut', { by: rewardAmount, transaction });

        await transaction.commit();

        console.log(`[Bonanza Engine] Successfully awarded ${rewardAmount} to user ${userId}`);

        return { success: true, rewardAmount };

    } catch (error) {
        await transaction.rollback();
        console.error('[Bonanza Engine] Error awarding reward:', error);
        throw error;
    }
}

/**
 * Calculate reward amount based on reward type
 */
function calculateRewardAmount(bonanza) {
    const { rewardType, rewardAmount, totalPoolAmount, currentQualifiers, maxQualifiers } = bonanza;

    switch (rewardType) {
        case 'FIXED':
            return parseFloat(rewardAmount || 0);

        case 'PERCENTAGE':
            // Percentage of what? Could be of user's sales
            return parseFloat(rewardAmount || 0);

        case 'POOL_SHARE':
            // Equal share of pool among qualifiers
            const estimatedQualifiers = maxQualifiers || (currentQualifiers + 1);
            return parseFloat(totalPoolAmount || 0) / estimatedQualifiers;

        case 'ITEM':
            // Non-cash reward, return 0
            return 0;

        default:
            return 0;
    }
}

/**
 * Update wallet balance
 */
async function updateWallet(userId, amount, transaction) {
    try {
        const wallet = await Wallet.findOne({
            where: { userId },
            transaction
        });

        if (wallet) {
            await wallet.increment('commissionBalance', { by: amount, transaction });
            await wallet.increment('totalEarned', { by: amount, transaction });
        }
    } catch (error) {
        console.error(`[Bonanza Engine] Error updating wallet:`, error);
        throw error;
    }
}

/**
 * Get leaderboard for a bonanza
 */
exports.getBonanzaLeaderboard = async (bonanzaId, limit = 20) => {
    try {
        const qualifications = await BonanzaQualification.findAll({
            where: { bonanzaId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'firstName', 'lastName', 'email']
            }],
            order: [['leaderboardScore', 'DESC']],
            limit: limit
        });

        return qualifications.map((q, index) => ({
            rank: index + 1,
            userId: q.userId,
            username: q.user?.username,
            name: `${q.user?.firstName || ''} ${q.user?.lastName || ''}`.trim(),
            status: q.status,
            overallProgress: q.overallProgress,
            leaderboardScore: q.leaderboardScore,
            progressData: q.progressData,
            qualifiedDate: q.qualifiedDate,
            rewardAmount: q.rewardAmount
        }));

    } catch (error) {
        console.error('[Bonanza Engine] Error getting leaderboard:', error);
        throw error;
    }
};

/**
 * Get user's active bonanza progress
 */
exports.getUserActiveBonanzas = async (userId) => {
    try {
        const activeBonanzas = await Bonanza.findAll({
            where: {
                status: 'ACTIVE',
                isVisible: true
            },
            include: [{
                model: BonanzaQualification,
                as: 'qualifications',
                where: { userId },
                required: false
            }]
        });

        return activeBonanzas;

    } catch (error) {
        console.error('[Bonanza Engine] Error getting user bonanzas:', error);
        throw error;
    }
};

/**
 * Update bonanza statuses (run via cron)
 */
exports.updateBonanzaStatuses = async () => {
    try {
        console.log('[Bonanza Engine] Updating bonanza statuses...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Activate upcoming bonanzas
        await Bonanza.update(
            { status: 'ACTIVE' },
            {
                where: {
                    status: 'UPCOMING',
                    startDate: { [Op.lte]: today }
                }
            }
        );

        // Expire active bonanzas
        await Bonanza.update(
            { status: 'EXPIRED' },
            {
                where: {
                    status: 'ACTIVE',
                    endDate: { [Op.lt]: today }
                }
            }
        );

        console.log('[Bonanza Engine] Status update complete');

    } catch (error) {
        console.error('[Bonanza Engine] Error updating statuses:', error);
    }
};

/**
 * Manual award by admin
 */
exports.manualAwardBonanza = async (bonanzaId, userId, adminId, reason) => {
    try {
        const bonanza = await Bonanza.findByPk(bonanzaId);
        if (!bonanza) {
            throw new Error('Bonanza not found');
        }

        let qualification = await BonanzaQualification.findOne({
            where: { bonanzaId, userId }
        });

        if (!qualification) {
            qualification = await BonanzaQualification.create({
                bonanzaId,
                userId,
                status: 'QUALIFIED',
                manualOverride: true,
                overrideReason: reason,
                overrideBy: adminId,
                qualifiedDate: new Date()
            });
        }

        await awardBonanzaReward(userId, bonanza, qualification.id);

        await qualification.update({
            manualOverride: true,
            overrideReason: reason,
            overrideBy: adminId
        });

        return { success: true, message: 'Bonanza reward manually awarded' };

    } catch (error) {
        console.error('[Bonanza Engine] Error in manual award:', error);
        throw error;
    }
};

module.exports = exports;
