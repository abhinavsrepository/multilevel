const { User, Rank, UserRank, RankAchievement, RankReward, Wallet, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Check if a user qualifies for a rank based on their current metrics
 * @param {number} userId - User ID to check
 * @param {Object} rank - Rank object with requirements
 * @returns {Object} - { qualifies: boolean, metrics: {...}, missing: {...} }
 */
async function checkRankQualification(userId, rank) {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return { qualifies: false, error: 'User not found' };
        }

        // Get user's direct referrals count
        const directReferralsCount = await User.count({
            where: { sponsorUserId: userId, status: 'ACTIVE' }
        });

        // Get user's team investment (total investments by downline)
        const teamInvestmentResult = await sequelize.query(`
            WITH RECURSIVE team_tree AS (
                SELECT id, sponsor_user_id, 0 as level
                FROM users
                WHERE id = :userId

                UNION ALL

                SELECT u.id, u.sponsor_user_id, tt.level + 1
                FROM users u
                INNER JOIN team_tree tt ON u.sponsor_user_id = tt.id
                WHERE tt.level < 20
            )
            SELECT COALESCE(SUM(pi.amount), 0) as total_team_investment
            FROM team_tree tt
            INNER JOIN property_investments pi ON pi.user_id = tt.id
            WHERE tt.id != :userId AND pi.status IN ('ACTIVE', 'COMPLETED')
        `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        const teamInvestmentAmount = parseFloat(teamInvestmentResult[0]?.total_team_investment || 0);

        // Get user's personal investment
        const personalInvestmentResult = await sequelize.query(`
            SELECT COALESCE(SUM(amount), 0) as total_personal_investment
            FROM property_investments
            WHERE user_id = :userId AND status IN ('ACTIVE', 'COMPLETED')
        `, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT
        });

        const personalInvestmentAmount = parseFloat(personalInvestmentResult[0]?.total_personal_investment || 0);

        // Check if all requirements are met
        const metrics = {
            directReferralsCount,
            teamInvestmentAmount,
            personalInvestmentAmount
        };

        const requirements = {
            requiredDirectReferrals: rank.requiredDirectReferrals || 0,
            requiredTeamInvestment: parseFloat(rank.requiredTeamInvestment || 0),
            requiredPersonalInvestment: parseFloat(rank.requiredPersonalInvestment || 0)
        };

        const missing = {
            directReferrals: Math.max(0, requirements.requiredDirectReferrals - directReferralsCount),
            teamInvestment: Math.max(0, requirements.requiredTeamInvestment - teamInvestmentAmount),
            personalInvestment: Math.max(0, requirements.requiredPersonalInvestment - personalInvestmentAmount)
        };

        const qualifies =
            directReferralsCount >= requirements.requiredDirectReferrals &&
            teamInvestmentAmount >= requirements.requiredTeamInvestment &&
            personalInvestmentAmount >= requirements.requiredPersonalInvestment;

        return {
            qualifies,
            metrics,
            requirements,
            missing
        };
    } catch (error) {
        console.error('Error checking rank qualification:', error);
        return { qualifies: false, error: error.message };
    }
}

/**
 * Check and award ranks to a user automatically
 * @param {number} userId - User ID to check
 * @returns {Object} - { success: boolean, newRank: Object|null, message: string }
 */
async function checkAndAwardRanks(userId) {
    const t = await sequelize.transaction();

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            await t.rollback();
            return { success: false, message: 'User not found' };
        }

        // Get current rank
        const currentRankRecord = await UserRank.findOne({
            where: { userId, isCurrent: true },
            include: [{ model: Rank, as: 'Rank' }]
        });

        const currentRankOrder = currentRankRecord?.Rank?.displayOrder || 0;

        // Get all ranks higher than current rank, ordered by display order
        const higherRanks = await Rank.findAll({
            where: {
                displayOrder: { [Op.gt]: currentRankOrder },
                isActive: true
            },
            order: [['displayOrder', 'ASC']]
        });

        let newRankAwarded = null;

        // Check each rank in order to see if user qualifies
        for (const rank of higherRanks) {
            const qualification = await checkRankQualification(userId, rank);

            if (qualification.qualifies) {
                // Check if user already has this rank achievement
                const existingAchievement = await RankAchievement.findOne({
                    where: { userId, rankId: rank.id }
                });

                if (!existingAchievement) {
                    // Award the rank
                    // Deactivate current rank
                    await UserRank.update(
                        { isCurrent: false },
                        { where: { userId, isCurrent: true }, transaction: t }
                    );

                    // Create new user rank
                    await UserRank.create({
                        userId,
                        rankId: rank.id,
                        isCurrent: true,
                        manualAssignment: false,
                        achievedAt: new Date()
                    }, { transaction: t });

                    // Create achievement record
                    await RankAchievement.create({
                        userId,
                        rankId: rank.id,
                        rankName: rank.name,
                        achievedAt: new Date(),
                        directReferralsCount: qualification.metrics.directReferralsCount,
                        teamInvestmentAmount: qualification.metrics.teamInvestmentAmount,
                        personalInvestmentAmount: qualification.metrics.personalInvestmentAmount,
                        oneTimeBonusGiven: rank.oneTimeBonus || 0,
                        bonusPaid: false,
                        manualAssignment: false
                    }, { transaction: t });

                    // Create one-time bonus reward if applicable
                    if (rank.oneTimeBonus && rank.oneTimeBonus > 0) {
                        await RankReward.create({
                            userId,
                            rankId: rank.id,
                            rewardType: 'ONE_TIME_BONUS',
                            rewardAmount: rank.oneTimeBonus,
                            status: 'PENDING',
                            notes: `One-time achievement bonus for reaching ${rank.name} rank`
                        }, { transaction: t });

                        // Optionally, credit the bonus to user's wallet immediately
                        // Uncomment the following to auto-credit bonuses
                        /*
                        const wallet = await Wallet.findOne({ where: { userId } });
                        if (wallet) {
                            await wallet.increment('commissionBalance', { by: rank.oneTimeBonus, transaction: t });
                            await wallet.increment('totalEarned', { by: rank.oneTimeBonus, transaction: t });

                            // Create transaction record
                            await Transaction.create({
                                userId,
                                transactionId: `RANK_BONUS_${rank.id}_${userId}_${Date.now()}`,
                                amount: rank.oneTimeBonus,
                                type: 'CREDIT',
                                category: 'COMMISSION',
                                status: 'COMPLETED',
                                description: `Rank achievement bonus - ${rank.name}`,
                                balanceBefore: parseFloat(wallet.commissionBalance),
                                balanceAfter: parseFloat(wallet.commissionBalance) + parseFloat(rank.oneTimeBonus)
                            }, { transaction: t });
                        }
                        */
                    }

                    newRankAwarded = rank;
                }
            } else {
                // If user doesn't qualify for this rank, they won't qualify for higher ranks
                break;
            }
        }

        await t.commit();

        if (newRankAwarded) {
            return {
                success: true,
                newRank: newRankAwarded,
                message: `Congratulations! You have achieved ${newRankAwarded.name} rank!`
            };
        } else {
            return {
                success: true,
                newRank: null,
                message: 'No new rank achieved'
            };
        }
    } catch (error) {
        await t.rollback();
        console.error('Error in checkAndAwardRanks:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Process pending one-time bonuses and credit them to user wallets
 * @returns {Object} - { success: boolean, processedCount: number, totalAmount: number }
 */
async function processPendingBonuses() {
    const t = await sequelize.transaction();

    try {
        // Get all pending one-time bonuses
        const pendingBonuses = await RankReward.findAll({
            where: {
                rewardType: 'ONE_TIME_BONUS',
                status: 'PENDING'
            },
            include: [
                { model: User, as: 'User' },
                { model: Rank, as: 'Rank' }
            ]
        });

        let processedCount = 0;
        let totalAmount = 0;

        for (const bonus of pendingBonuses) {
            const wallet = await Wallet.findOne({
                where: { userId: bonus.userId },
                transaction: t
            });

            if (wallet) {
                const amount = parseFloat(bonus.rewardAmount);
                const balanceBefore = parseFloat(wallet.commissionBalance);

                // Credit to wallet
                await wallet.increment('commissionBalance', { by: amount, transaction: t });
                await wallet.increment('totalEarned', { by: amount, transaction: t });

                // Create transaction record
                const transactionId = `RANK_BONUS_${bonus.rankId}_${bonus.userId}_${Date.now()}`;
                await Transaction.create({
                    userId: bonus.userId,
                    transactionId,
                    amount,
                    type: 'CREDIT',
                    category: 'COMMISSION',
                    status: 'COMPLETED',
                    description: `Rank achievement bonus - ${bonus.Rank?.name || 'Rank'}`,
                    balanceBefore,
                    balanceAfter: balanceBefore + amount
                }, { transaction: t });

                // Update bonus status
                await bonus.update({
                    status: 'PAID',
                    paidAt: new Date(),
                    transactionId
                }, { transaction: t });

                // Update achievement record
                await RankAchievement.update(
                    {
                        bonusPaid: true,
                        bonusPaidAt: new Date()
                    },
                    {
                        where: {
                            userId: bonus.userId,
                            rankId: bonus.rankId
                        },
                        transaction: t
                    }
                );

                processedCount++;
                totalAmount += amount;
            }
        }

        await t.commit();

        return {
            success: true,
            processedCount,
            totalAmount
        };
    } catch (error) {
        await t.rollback();
        console.error('Error processing pending bonuses:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check all users and award ranks to those who qualify
 * This should be run periodically (e.g., daily via cron job)
 * @returns {Object} - { success: boolean, usersChecked: number, ranksAwarded: number }
 */
async function checkAllUsersForRankUpgrade() {
    try {
        // Get all active users
        const users = await User.findAll({
            where: { status: 'ACTIVE' }
        });

        let usersChecked = 0;
        let ranksAwarded = 0;

        for (const user of users) {
            const result = await checkAndAwardRanks(user.id);
            usersChecked++;

            if (result.success && result.newRank) {
                ranksAwarded++;
                console.log(`Rank awarded: ${result.newRank.name} to user ${user.username}`);
            }
        }

        return {
            success: true,
            usersChecked,
            ranksAwarded
        };
    } catch (error) {
        console.error('Error checking all users for rank upgrade:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    checkRankQualification,
    checkAndAwardRanks,
    processPendingBonuses,
    checkAllUsersForRankUpgrade
};
