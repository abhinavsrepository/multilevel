const { Bonanza, User, Investment, Commission, Wallet } = require('../models');
const { Op } = require('sequelize');

/**
 * Check and award bonanza achievements for an investment
 * This is called automatically when an investment is created
 */
exports.checkBonanzaAchievements = async (investment) => {
    try {
        console.log(`Checking bonanza achievements for investment: ${investment.id}`);

        // Get all active bonanzas
        const activeBonanzas = await Bonanza.findAll({
            where: { status: 'ACTIVE' }
        });

        if (activeBonanzas.length === 0) {
            console.log('No active bonanzas');
            return;
        }

        const userId = investment.userId;

        for (const bonanza of activeBonanzas) {
            await checkUserBonanzaQualification(userId, bonanza);
        }

    } catch (error) {
        console.error('Error checking bonanza achievements:', error);
    }
};

/**
 * Check if a user qualifies for a specific bonanza
 */
async function checkUserBonanzaQualification(userId, bonanza) {
    try {
        // Check if user already received this bonanza reward
        const existingReward = await Commission.findOne({
            where: {
                userId: userId,
                commissionType: 'BONANZA_REWARD',
                description: { [Op.like]: `%${bonanza.name}%` }
            }
        });

        if (existingReward) {
            console.log(`User ${userId} already received reward for bonanza: ${bonanza.name}`);
            return;
        }

        // Calculate user's total investment during bonanza period
        const totalInvestment = await Investment.sum('investmentAmount', {
            where: {
                userId: userId,
                createdAt: {
                    [Op.between]: [bonanza.startDate, bonanza.endDate]
                },
                status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
            }
        });

        const amount = totalInvestment || 0;
        const target = parseFloat(bonanza.targetAmount);

        console.log(`Bonanza ${bonanza.name}: User ${userId} has ${amount} / ${target}`);

        // Check if user qualified
        if (amount >= target) {
            console.log(`User ${userId} qualified for bonanza: ${bonanza.name}!`);

            // Award bonanza reward
            await awardBonanzaReward(userId, bonanza, amount);
        }

    } catch (error) {
        console.error('Error checking bonanza qualification:', error);
    }
}

/**
 * Award bonanza reward to a user
 */
async function awardBonanzaReward(userId, bonanza, achievedAmount) {
    try {
        // Parse reward - could be cash or item description
        const rewardAmount = parseRewardAmount(bonanza.reward);

        // Create commission record
        await Commission.create({
            commissionId: `BONANZA-${bonanza.id}-${Date.now()}-${userId}`,
            userId: userId,
            commissionType: 'BONANZA_REWARD',
            amount: rewardAmount,
            baseAmount: achievedAmount,
            description: `Bonanza Achievement: ${bonanza.name} - ${bonanza.reward}`,
            status: 'EARNED'
        });

        // Update wallet if reward has cash value
        if (rewardAmount > 0) {
            await updateWallet(userId, rewardAmount);
        }

        console.log(`Awarded bonanza reward to user ${userId}: ${bonanza.reward}`);

    } catch (error) {
        console.error('Error awarding bonanza reward:', error);
    }
}

/**
 * Parse reward string to extract cash amount if present
 * Examples: "₹50,000", "50000", "iPhone 15 Pro", "Bullet Motorcycle"
 */
function parseRewardAmount(rewardString) {
    if (!rewardString) return 0;

    // Remove currency symbols and commas
    const cleaned = rewardString.replace(/[₹,]/g, '').trim();

    // Try to parse as number
    const amount = parseFloat(cleaned);

    // If it's a valid number, return it, otherwise return 0 (non-cash reward)
    return isNaN(amount) ? 0 : amount;
}

/**
 * Update bonanza statuses based on current date
 * Should be run daily via cron job
 */
exports.updateBonanzaStatuses = async () => {
    try {
        console.log('Updating bonanza statuses...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update UPCOMING to ACTIVE
        await Bonanza.update(
            { status: 'ACTIVE' },
            {
                where: {
                    status: 'UPCOMING',
                    startDate: { [Op.lte]: today }
                }
            }
        );

        // Update ACTIVE to EXPIRED
        await Bonanza.update(
            { status: 'EXPIRED' },
            {
                where: {
                    status: 'ACTIVE',
                    endDate: { [Op.lt]: today }
                }
            }
        );

        console.log('Bonanza statuses updated');

    } catch (error) {
        console.error('Error updating bonanza statuses:', error);
    }
};

/**
 * Process end-of-bonanza rewards for all qualified users
 * Run when a bonanza expires
 */
exports.processExpiredBonanza = async (bonanzaId) => {
    try {
        const bonanza = await Bonanza.findByPk(bonanzaId);

        if (!bonanza || bonanza.status !== 'EXPIRED') {
            console.log('Bonanza not found or not expired');
            return;
        }

        console.log(`Processing expired bonanza: ${bonanza.name}`);

        // Get all users
        const users = await User.findAll({
            where: { status: 'ACTIVE' }
        });

        // Check qualification for each user
        for (const user of users) {
            await checkUserBonanzaQualification(user.id, bonanza);
        }

        console.log(`Processed ${users.length} users for bonanza: ${bonanza.name}`);

    } catch (error) {
        console.error('Error processing expired bonanza:', error);
    }
};

/**
 * Get bonanza leaderboard
 */
exports.getBonanzaLeaderboard = async (bonanzaId) => {
    try {
        const bonanza = await Bonanza.findByPk(bonanzaId);

        if (!bonanza) {
            throw new Error('Bonanza not found');
        }

        // Get all users' progress for this bonanza
        const users = await User.findAll({
            where: { status: 'ACTIVE' },
            attributes: ['id', 'username', 'firstName', 'lastName']
        });

        const leaderboard = [];

        for (const user of users) {
            const totalInvestment = await Investment.sum('investmentAmount', {
                where: {
                    userId: user.id,
                    createdAt: {
                        [Op.between]: [bonanza.startDate, bonanza.endDate]
                    },
                    status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
                }
            });

            const amount = totalInvestment || 0;

            if (amount > 0) {
                leaderboard.push({
                    userId: user.id,
                    username: user.username,
                    name: `${user.firstName} ${user.lastName}`,
                    amount: amount,
                    percentage: (amount / parseFloat(bonanza.targetAmount)) * 100,
                    qualified: amount >= parseFloat(bonanza.targetAmount)
                });
            }
        }

        // Sort by amount descending
        leaderboard.sort((a, b) => b.amount - a.amount);

        return leaderboard;

    } catch (error) {
        console.error('Error getting bonanza leaderboard:', error);
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
