const { RankAchievement, Rank, User, UserRank, RankReward, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

// --- Admin Operations ---

/**
 * Get all rank achievements with filters
 */
exports.getAllAchievements = catchAsync(async (req, res, next) => {
    const { userId, rankId, manualAssignment, page = 1, limit = 50 } = req.query;

    const where = {};
    if (userId) where.userId = userId;
    if (rankId) where.rankId = rankId;
    if (manualAssignment !== undefined) where.manualAssignment = manualAssignment === 'true';

    const offset = (page - 1) * limit;

    const { count, rows } = await RankAchievement.findAndCountAll({
        where,
        include: [
            { model: User, as: 'User', attributes: ['id', 'username', 'fullName', 'email'] },
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] },
            { model: User, as: 'AssignedByUser', attributes: ['id', 'username', 'fullName'] }
        ],
        order: [['achievedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.status(200).json({
        success: true,
        data: {
            achievements: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }
    });
});

/**
 * Get achievements for a specific user
 */
exports.getUserAchievements = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const achievements = await RankAchievement.findAll({
        where: { userId },
        include: [
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder', 'benefits'] }
        ],
        order: [['achievedAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        data: achievements
    });
});

/**
 * Award rank to user (manual assignment by admin)
 */
exports.awardRankToUser = catchAsync(async (req, res, next) => {
    const { userId, rankId, notes } = req.body;

    if (!userId || !rankId) {
        return next(new AppError('User ID and Rank ID are required', 400));
    }

    const user = await User.findByPk(userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const rank = await Rank.findByPk(rankId);
    if (!rank) {
        return next(new AppError('Rank not found', 404));
    }

    const t = await sequelize.transaction();

    try {
        // Check if user already has this rank
        const existingAchievement = await RankAchievement.findOne({
            where: { userId, rankId }
        });

        if (existingAchievement) {
            await t.rollback();
            return next(new AppError('User has already achieved this rank', 400));
        }

        // Deactivate current rank in user_ranks
        await UserRank.update(
            { isCurrent: false },
            {
                where: { userId, isCurrent: true },
                transaction: t
            }
        );

        // Create new user rank
        await UserRank.create({
            userId,
            rankId,
            isCurrent: true,
            manualAssignment: true,
            assignedBy: req.user.id,
            notes
        }, { transaction: t });

        // Create achievement record
        const achievement = await RankAchievement.create({
            userId,
            rankId,
            rankName: rank.name,
            achievedAt: new Date(),
            manualAssignment: true,
            assignedBy: req.user.id,
            notes,
            oneTimeBonusGiven: rank.oneTimeBonus || 0,
            bonusPaid: false
        }, { transaction: t });

        // Create one-time bonus reward if applicable
        if (rank.oneTimeBonus && rank.oneTimeBonus > 0) {
            await RankReward.create({
                userId,
                rankId,
                rewardType: 'ONE_TIME_BONUS',
                rewardAmount: rank.oneTimeBonus,
                status: 'PENDING',
                notes: `One-time achievement bonus for ${rank.name}`
            }, { transaction: t });
        }

        await t.commit();

        res.status(200).json({
            success: true,
            message: `Rank ${rank.name} successfully awarded to user`,
            data: achievement
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
});

/**
 * Get rank achievement statistics
 */
exports.getRankStats = catchAsync(async (req, res, next) => {
    // Count achievements by rank
    const achievementsByRank = await sequelize.query(`
        SELECT
            r.id,
            r.name,
            r.display_order,
            COUNT(ra.id) as achievement_count,
            COUNT(CASE WHEN ra.bonus_paid = TRUE THEN 1 END) as bonuses_paid_count,
            COALESCE(SUM(ra.one_time_bonus_given), 0) as total_bonuses_given
        FROM ranks r
        LEFT JOIN rank_achievements ra ON r.id = ra.rank_id
        GROUP BY r.id, r.name, r.display_order
        ORDER BY r.display_order
    `, {
        type: sequelize.QueryTypes.SELECT
    });

    // Recent achievements
    const recentAchievements = await RankAchievement.findAll({
        include: [
            { model: User, as: 'User', attributes: ['id', 'username', 'fullName'] },
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
        ],
        order: [['achievedAt', 'DESC']],
        limit: 10
    });

    // Monthly achievement trends
    const monthlyTrends = await sequelize.query(`
        SELECT
            DATE_TRUNC('month', achieved_at) as month,
            COUNT(*) as achievement_count,
            COUNT(DISTINCT user_id) as unique_users
        FROM rank_achievements
        WHERE achieved_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', achieved_at)
        ORDER BY month DESC
    `, {
        type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
        success: true,
        data: {
            achievementsByRank,
            recentAchievements,
            monthlyTrends
        }
    });
});

// --- User Operations ---

/**
 * Get current user's rank achievements
 */
exports.getMyAchievements = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const achievements = await RankAchievement.findAll({
        where: { userId },
        include: [
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder', 'benefits', 'oneTimeBonus', 'monthlyBonus'] }
        ],
        order: [['achievedAt', 'DESC']]
    });

    // Get current rank
    const currentRank = await UserRank.findOne({
        where: { userId, isCurrent: true },
        include: [{ model: Rank, as: 'Rank' }]
    });

    // Calculate total bonuses earned
    const totalBonusesEarned = achievements.reduce((sum, achievement) => {
        return sum + parseFloat(achievement.oneTimeBonusGiven || 0);
    }, 0);

    const totalBonusesPaid = achievements
        .filter(a => a.bonusPaid)
        .reduce((sum, achievement) => {
            return sum + parseFloat(achievement.oneTimeBonusGiven || 0);
        }, 0);

    res.status(200).json({
        success: true,
        data: {
            achievements,
            currentRank: currentRank ? currentRank.Rank : null,
            summary: {
                totalRanksAchieved: achievements.length,
                totalBonusesEarned,
                totalBonusesPaid,
                pendingBonuses: totalBonusesEarned - totalBonusesPaid
            }
        }
    });
});

/**
 * Get achievement timeline for current user
 */
exports.getMyAchievementTimeline = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const timeline = await RankAchievement.findAll({
        where: { userId },
        include: [
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
        ],
        order: [['achievedAt', 'ASC']]
    });

    // Format timeline with milestones
    const formattedTimeline = timeline.map((achievement, index) => ({
        ...achievement.toJSON(),
        milestone: index + 1,
        daysToAchieve: index > 0
            ? Math.floor((new Date(achievement.achievedAt) - new Date(timeline[0].achievedAt)) / (1000 * 60 * 60 * 24))
            : 0
    }));

    res.status(200).json({
        success: true,
        data: formattedTimeline
    });
});

module.exports = exports;
