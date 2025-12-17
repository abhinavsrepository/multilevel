const { Rank, UserRank, User, sequelize } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// --- Admin Operations ---

exports.createRank = catchAsync(async (req, res, next) => {
    const rank = await Rank.create(req.body);
    res.status(201).json({
        success: true,
        data: rank
    });
});

exports.getAllRanks = catchAsync(async (req, res, next) => {
    const ranks = await Rank.findAll({
        order: [['displayOrder', 'ASC']]
    });
    res.status(200).json({
        success: true,
        data: ranks
    });
});

exports.updateRank = catchAsync(async (req, res, next) => {
    const [updated] = await Rank.update(req.body, {
        where: { id: req.params.id }
    });

    if (!updated) {
        return next(new AppError('Rank not found', 404));
    }

    const rank = await Rank.findByPk(req.params.id);

    res.status(200).json({
        success: true,
        data: rank
    });
});

exports.deleteRank = catchAsync(async (req, res, next) => {
    const deleted = await Rank.destroy({
        where: { id: req.params.id }
    });

    if (!deleted) {
        return next(new AppError('Rank not found', 404));
    }

    res.status(204).json({
        success: true,
        data: null
    });
});

exports.assignRankToUser = catchAsync(async (req, res, next) => {
    const { userId, rankId } = req.body;

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
        // Deactivate current rank
        await UserRank.update(
            { isCurrent: false },
            {
                where: { userId: userId, isCurrent: true },
                transaction: t
            }
        );

        // Create new user rank
        const userRank = await UserRank.create({
            userId: userId,
            rankId: rankId,
            isCurrent: true,
            manualAssignment: true,
            assignedBy: req.user.id,
            notes: req.body.notes
        }, { transaction: t });

        // Update user model if it has a rank field
        // user.rank = rank.name;
        // await user.save({ transaction: t });

        await t.commit();

        res.status(200).json({
            success: true,
            message: `Rank ${rank.name} assigned to user successfully`,
            data: userRank
        });
    } catch (error) {
        await t.rollback();
        return next(error);
    }
});

// --- User Operations ---

exports.getAvailableRanks = catchAsync(async (req, res, next) => {
    const ranks = await Rank.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC']]
    });
    res.status(200).json({
        success: true,
        data: ranks
    });
});

exports.getUserRankProgress = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Get current rank
    const currentRankRecord = await UserRank.findOne({
        where: { userId: userId, isCurrent: true },
        include: [{ model: Rank, as: 'Rank' }]
    });

    let currentRank;
    if (currentRankRecord) {
        currentRank = currentRankRecord.Rank;
    } else {
        // Fallback to lowest rank or null
        const lowestRank = await Rank.findOne({
            order: [['displayOrder', 'ASC']]
        });
        currentRank = lowestRank || { name: 'Unranked', displayOrder: 0 };
    }

    // Find next rank
    const { Op } = require('sequelize');
    const nextRank = await Rank.findOne({
        where: {
            displayOrder: { [Op.gt]: currentRank.displayOrder || 0 },
            isActive: true
        },
        order: [['displayOrder', 'ASC']]
    });

    // Mock progress data since this is a manual system
    const progress = {
        directReferrals: { current: 0, required: nextRank?.requiredDirectReferrals || 0, percentage: 0 },
        teamInvestment: { current: 0, required: nextRank?.requiredTeamInvestment || 0, percentage: 0 },
        personalInvestment: { current: 0, required: nextRank?.requiredPersonalInvestment || 0, percentage: 0 },
        activeLegs: { leftActive: false, rightActive: false, achieved: false }
    };

    const overallProgress = 0;

    res.status(200).json({
        success: true,
        data: {
            currentRank,
            nextRank,
            progress,
            overallProgress
        }
    });
});
