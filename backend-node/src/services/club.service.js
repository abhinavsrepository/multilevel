const { User, Investment, Commission, Wallet } = require('../models');
const { Op } = require('sequelize');

// Club thresholds in lakhs (1 lakh = 100,000)
const CLUB_THRESHOLDS = {
    SILVER: 50 * 100000,   // 50 Lakhs
    GOLD: 200 * 100000,    // 2 Crore
    DIAMOND: 500 * 100000  // 5 Crore
};

// Royalty percentages from BTO (Business Turnover)
const CLUB_ROYALTY_PERCENT = {
    SILVER: 0.33,   // 0.33% of BTO (part of 1% pool)
    GOLD: 0.33,     // 0.33% of BTO
    DIAMOND: 0.34   // 0.34% of BTO (total = 1%)
};

/**
 * Calculate Group Business Volume for a user based on 40:40:20 ratio
 * Returns the GBV across the 3 largest groups
 */
exports.calculateGroupBusinessVolume = async (userId) => {
    try {
        // Get all direct referrals
        const directReferrals = await User.findAll({
            where: { sponsorId: userId },
            attributes: ['id', 'username']
        });

        if (directReferrals.length === 0) {
            return {
                groups: [],
                totalGBV: 0,
                qualified: false,
                clubLevel: 'NONE'
            };
        }

        // Calculate total business for each direct referral's leg (including their downline)
        const groupVolumes = [];

        for (const referral of directReferrals) {
            const legVolume = await calculateLegVolume(referral.id);
            groupVolumes.push({
                userId: referral.id,
                username: referral.username,
                volume: legVolume
            });
        }

        // Sort groups by volume in descending order
        groupVolumes.sort((a, b) => b.volume - a.volume);

        // Take top 3 groups
        const top3Groups = groupVolumes.slice(0, 3);

        // Calculate total GBV
        const totalGBV = top3Groups.reduce((sum, group) => sum + group.volume, 0);

        // Check 40:40:20 ratio qualification
        let qualified = false;
        if (top3Groups.length >= 3) {
            const group1Percent = (top3Groups[0].volume / totalGBV) * 100;
            const group2Percent = (top3Groups[1].volume / totalGBV) * 100;
            const group3Percent = (top3Groups[2].volume / totalGBV) * 100;

            // Check if ratio is approximately 40:40:20 (allow ±5% variance)
            qualified = (
                group1Percent >= 35 && group1Percent <= 45 &&
                group2Percent >= 35 && group2Percent <= 45 &&
                group3Percent >= 15 && group3Percent <= 25
            );
        }

        // Determine club level based on total GBV and qualification
        let clubLevel = 'NONE';
        if (qualified) {
            if (totalGBV >= CLUB_THRESHOLDS.DIAMOND) {
                clubLevel = 'DIAMOND';
            } else if (totalGBV >= CLUB_THRESHOLDS.GOLD) {
                clubLevel = 'GOLD';
            } else if (totalGBV >= CLUB_THRESHOLDS.SILVER) {
                clubLevel = 'SILVER';
            }
        }

        return {
            groups: top3Groups,
            totalGBV,
            qualified,
            clubLevel,
            clubProgress: {
                group1: top3Groups[0]?.volume || 0,
                group2: top3Groups[1]?.volume || 0,
                group3: top3Groups[2]?.volume || 0
            }
        };

    } catch (error) {
        console.error('Error calculating GBV:', error);
        throw error;
    }
};

/**
 * Calculate total business volume for a leg (user + all their downline)
 */
async function calculateLegVolume(userId) {
    try {
        // Get all descendant IDs for this user
        const descendantIds = await getDescendantIds(userId);
        descendantIds.push(userId); // Include the user themselves

        // Sum all investments for this leg
        const totalInvestment = await Investment.sum('investmentAmount', {
            where: {
                userId: { [Op.in]: descendantIds },
                status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
            }
        });

        return totalInvestment || 0;

    } catch (error) {
        console.error('Error calculating leg volume:', error);
        return 0;
    }
}

/**
 * Get all descendant user IDs (recursive downline)
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
 * Update club status for a user
 */
exports.updateClubStatus = async (userId) => {
    try {
        const gbvData = await this.calculateGroupBusinessVolume(userId);

        const user = await User.findByPk(userId);
        if (!user) return;

        const oldClubStatus = user.clubStatus;
        const newClubStatus = gbvData.clubLevel;

        // Update user's club status and progress
        await user.update({
            clubStatus: newClubStatus,
            clubProgress: gbvData.clubProgress
        });

        // If club level upgraded, create one-time reward commission
        if (newClubStatus !== 'NONE' && newClubStatus !== oldClubStatus) {
            console.log(`User ${userId} upgraded to ${newClubStatus} club!`);

            // Award one-time club achievement bonus
            const achievementBonus = getClubAchievementBonus(newClubStatus);
            if (achievementBonus > 0) {
                await Commission.create({
                    commissionId: `CLUB-${newClubStatus}-${Date.now()}-${userId}`,
                    userId: userId,
                    commissionType: 'CLUB_ACHIEVEMENT',
                    amount: achievementBonus,
                    description: `${newClubStatus} Club Achievement Bonus`,
                    status: 'EARNED'
                });

                await updateWallet(userId, achievementBonus);
            }
        }

        return gbvData;

    } catch (error) {
        console.error('Error updating club status:', error);
        throw error;
    }
};

/**
 * Get one-time achievement bonus for reaching a club level
 */
function getClubAchievementBonus(clubLevel) {
    const bonuses = {
        SILVER: 50000,   // 50k bonus
        GOLD: 200000,    // 2 lakh bonus
        DIAMOND: 500000  // 5 lakh bonus
    };
    return bonuses[clubLevel] || 0;
}

/**
 * Distribute monthly club royalty to all qualified club members
 * This should be run monthly (via cron job)
 */
exports.distributeClubRoyalty = async () => {
    try {
        console.log('Starting monthly club royalty distribution...');

        // Calculate total BTO (Business Turnover) for the month
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthlyBTO = await Investment.sum('investmentAmount', {
            where: {
                createdAt: {
                    [Op.between]: [firstDay, lastDay]
                },
                status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
            }
        });

        if (!monthlyBTO || monthlyBTO === 0) {
            console.log('No BTO for this month, skipping royalty distribution');
            return;
        }

        console.log(`Monthly BTO: ${monthlyBTO}`);

        // Get all users with club status
        const clubMembers = await User.findAll({
            where: {
                clubStatus: { [Op.in]: ['SILVER', 'GOLD', 'DIAMOND'] }
            }
        });

        // Count members in each club
        const clubCounts = {
            SILVER: clubMembers.filter(u => u.clubStatus === 'SILVER').length,
            GOLD: clubMembers.filter(u => u.clubStatus === 'GOLD').length,
            DIAMOND: clubMembers.filter(u => u.clubStatus === 'DIAMOND').length
        };

        console.log('Club members:', clubCounts);

        // Distribute royalty for each club level
        for (const member of clubMembers) {
            const clubLevel = member.clubStatus;
            const royaltyPercent = CLUB_ROYALTY_PERCENT[clubLevel];
            const totalPoolForClub = (monthlyBTO * royaltyPercent) / 100;
            const membersInClub = clubCounts[clubLevel];

            if (membersInClub === 0) continue;

            // Equal distribution among club members
            const royaltyAmount = totalPoolForClub / membersInClub;

            if (royaltyAmount > 0) {
                await Commission.create({
                    commissionId: `ROYALTY-${clubLevel}-${Date.now()}-${member.id}`,
                    userId: member.id,
                    commissionType: 'CLUB_ROYALTY',
                    amount: royaltyAmount,
                    baseAmount: monthlyBTO,
                    percentage: royaltyPercent / membersInClub,
                    description: `${clubLevel} Club Monthly Royalty`,
                    status: 'EARNED'
                });

                await updateWallet(member.id, royaltyAmount);
                console.log(`Distributed ${royaltyAmount} royalty to user ${member.id} (${clubLevel})`);
            }
        }

        console.log('Club royalty distribution completed');

    } catch (error) {
        console.error('Error distributing club royalty:', error);
        throw error;
    }
};

/**
 * Update wallet balance
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
 * Get club statistics
 */
exports.getClubStats = async () => {
    try {
        const stats = await User.findAll({
            attributes: [
                'clubStatus',
                [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']
            ],
            where: {
                clubStatus: { [Op.in]: ['SILVER', 'GOLD', 'DIAMOND'] }
            },
            group: ['clubStatus']
        });

        return stats.map(s => ({
            club: s.clubStatus,
            members: parseInt(s.getDataValue('count'))
        }));

    } catch (error) {
        console.error('Error getting club stats:', error);
        throw error;
    }
};
