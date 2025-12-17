const { RankReward, Rank, User, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

// --- Admin Operations ---

/**
 * Get all rank rewards with filters
 * Query params: status, userId, rankId, periodMonth, periodYear
 */
exports.getAllRankRewards = catchAsync(async (req, res, next) => {
    const { status, userId, rankId, periodMonth, periodYear, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (rankId) where.rankId = rankId;
    if (periodMonth) where.periodMonth = periodMonth;
    if (periodYear) where.periodYear = periodYear;

    const offset = (page - 1) * limit;

    const { count, rows } = await RankReward.findAndCountAll({
        where,
        include: [
            { model: User, as: 'User', attributes: ['id', 'username', 'fullName', 'email'] },
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.status(200).json({
        success: true,
        data: {
            rewards: rows,
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
 * Get rewards for a specific user
 */
exports.getUserRewards = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { status, rewardType } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (rewardType) where.rewardType = rewardType;

    const rewards = await RankReward.findAll({
        where,
        include: [
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
        ],
        order: [['created_at', 'DESC']]
    });

    // Calculate totals
    const totals = {
        pending: 0,
        processed: 0,
        paid: 0,
        total: 0
    };

    rewards.forEach(reward => {
        const amount = parseFloat(reward.rewardAmount);
        totals.total += amount;
        if (reward.status === 'PENDING') totals.pending += amount;
        if (reward.status === 'PROCESSED') totals.processed += amount;
        if (reward.status === 'PAID') totals.paid += amount;
    });

    res.status(200).json({
        success: true,
        data: {
            rewards,
            totals
        }
    });
});

/**
 * Process pending rewards for a specific month/year
 * This moves rewards from PENDING to PROCESSED status
 */
exports.processMonthlyRewards = catchAsync(async (req, res, next) => {
    const { periodMonth, periodYear } = req.body;

    if (!periodMonth || !periodYear) {
        return next(new AppError('Period month and year are required', 400));
    }

    const t = await sequelize.transaction();

    try {
        const [updatedCount] = await RankReward.update(
            {
                status: 'PROCESSED',
                processedAt: new Date()
            },
            {
                where: {
                    status: 'PENDING',
                    periodMonth,
                    periodYear
                },
                transaction: t
            }
        );

        await t.commit();

        res.status(200).json({
            success: true,
            message: `Successfully processed ${updatedCount} rewards for ${periodMonth}/${periodYear}`,
            data: { processedCount: updatedCount }
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
});

/**
 * Mark rewards as paid and update wallets
 * This should be called after actual payment transfer
 */
exports.markRewardsPaid = catchAsync(async (req, res, next) => {
    const { rewardIds } = req.body; // Array of reward IDs

    if (!rewardIds || !Array.isArray(rewardIds) || rewardIds.length === 0) {
        return next(new AppError('Reward IDs array is required', 400));
    }

    const t = await sequelize.transaction();

    try {
        // Update rewards to PAID status
        const [updatedCount] = await RankReward.update(
            {
                status: 'PAID',
                paidAt: new Date()
            },
            {
                where: {
                    id: { [Op.in]: rewardIds },
                    status: 'PROCESSED'
                },
                transaction: t
            }
        );

        await t.commit();

        res.status(200).json({
            success: true,
            message: `Successfully marked ${updatedCount} rewards as paid`,
            data: { paidCount: updatedCount }
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
});

/**
 * Generate monthly rewards for all eligible users
 * This should be called via cron job at the beginning of each month
 */
exports.generateMonthlyRewards = catchAsync(async (req, res, next) => {
    const currentDate = new Date();
    const periodMonth = req.body.periodMonth || currentDate.getMonth() + 1;
    const periodYear = req.body.periodYear || currentDate.getFullYear();

    const t = await sequelize.transaction();

    try {
        // Get all users with current ranks that have monthly bonuses
        const eligibleUsers = await sequelize.query(`
            SELECT
                ur.user_id,
                ur.rank_id,
                rs.rank_name,
                rs.monthly_leadership_bonus
            FROM user_ranks ur
            INNER JOIN rank_settings rs ON ur.rank_id = rs.id
            WHERE ur.is_current = TRUE
              AND rs.monthly_leadership_bonus > 0
              AND rs.is_active = TRUE
              AND NOT EXISTS (
                  SELECT 1 FROM rank_rewards rr
                  WHERE rr.user_id = ur.user_id
                    AND rr.rank_id = ur.rank_id
                    AND rr.period_month = :periodMonth
                    AND rr.period_year = :periodYear
                    AND rr.reward_type = 'MONTHLY_LEADERSHIP'
              )
        `, {
            replacements: { periodMonth, periodYear },
            type: sequelize.QueryTypes.SELECT,
            transaction: t
        });

        // Create reward records for each eligible user
        const rewardsToCreate = eligibleUsers.map(user => ({
            userId: user.user_id,
            rankId: user.rank_id,
            rewardType: 'MONTHLY_LEADERSHIP',
            rewardAmount: user.monthly_leadership_bonus,
            periodMonth,
            periodYear,
            status: 'PENDING',
            notes: `Monthly leadership bonus for ${user.rank_name} - ${periodMonth}/${periodYear}`
        }));

        let created = [];
        if (rewardsToCreate.length > 0) {
            created = await RankReward.bulkCreate(rewardsToCreate, { transaction: t });
        }

        await t.commit();

        res.status(200).json({
            success: true,
            message: `Successfully generated ${created.length} monthly rewards for ${periodMonth}/${periodYear}`,
            data: {
                count: created.length,
                periodMonth,
                periodYear
            }
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
});

// --- User Operations ---

/**
 * Get current user's rewards
 */
exports.getMyRewards = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { status, rewardType } = req.query;

    const where = { userId };
    if (status) where.status = status;
    if (rewardType) where.rewardType = rewardType;

    const rewards = await RankReward.findAll({
        where,
        include: [
            { model: Rank, as: 'Rank', attributes: ['id', 'name', 'displayOrder'] }
        ],
        order: [['created_at', 'DESC']]
    });

    // Calculate totals by type
    const summary = {
        monthlyRewards: { total: 0, pending: 0, paid: 0 },
        oneTimeBonuses: { total: 0, pending: 0, paid: 0 },
        overall: { total: 0, pending: 0, paid: 0 }
    };

    rewards.forEach(reward => {
        const amount = parseFloat(reward.rewardAmount);
        summary.overall.total += amount;

        if (reward.status === 'PENDING') summary.overall.pending += amount;
        if (reward.status === 'PAID') summary.overall.paid += amount;

        if (reward.rewardType === 'MONTHLY_LEADERSHIP') {
            summary.monthlyRewards.total += amount;
            if (reward.status === 'PENDING') summary.monthlyRewards.pending += amount;
            if (reward.status === 'PAID') summary.monthlyRewards.paid += amount;
        } else if (reward.rewardType === 'ONE_TIME_BONUS') {
            summary.oneTimeBonuses.total += amount;
            if (reward.status === 'PENDING') summary.oneTimeBonuses.pending += amount;
            if (reward.status === 'PAID') summary.oneTimeBonuses.paid += amount;
        }
    });

    res.status(200).json({
        success: true,
        data: {
            rewards,
            summary
        }
    });
});

/**
 * Get reward statistics for current user
 */
exports.getMyRewardStats = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const stats = await sequelize.query(`
        SELECT
            reward_type,
            status,
            COUNT(*) as count,
            COALESCE(SUM(reward_amount), 0) as total_amount
        FROM rank_rewards
        WHERE user_id = :userId
        GROUP BY reward_type, status
    `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
    });

    // Get monthly breakdown for current year
    const currentYear = new Date().getFullYear();
    const monthlyBreakdown = await sequelize.query(`
        SELECT
            period_month,
            COALESCE(SUM(reward_amount), 0) as total_amount,
            COUNT(*) as count
        FROM rank_rewards
        WHERE user_id = :userId
          AND period_year = :currentYear
          AND reward_type = 'MONTHLY_LEADERSHIP'
        GROUP BY period_month
        ORDER BY period_month
    `, {
        replacements: { userId, currentYear },
        type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json({
        success: true,
        data: {
            stats,
            monthlyBreakdown
        }
    });
});

module.exports = exports;
