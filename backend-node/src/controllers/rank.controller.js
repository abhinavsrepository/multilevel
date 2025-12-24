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

    // 1. Get User with latest stats
    const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'leftBv', 'rightBv', 'personalBv', 'teamBv']
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Get current rank
    const currentRankRecord = await UserRank.findOne({
        where: { userId: userId, isCurrent: true },
        include: [{ model: Rank, as: 'Rank' }]
    });

    let currentRank;
    if (currentRankRecord) {
        currentRank = currentRankRecord.Rank;
    } else {
        // Fallback: Get rank with lowest displayOrder (usually 'Associate' or 'Member')
        const lowestRank = await Rank.findOne({
            order: [['displayOrder', 'ASC']]
        });
        currentRank = lowestRank || { name: 'Unranked', displayOrder: 0 };
    }

    // 3. Find next rank
    const { Op } = require('sequelize');
    const nextRank = await Rank.findOne({
        where: {
            displayOrder: { [Op.gt]: currentRank.displayOrder || 0 },
            isActive: true
        },
        order: [['displayOrder', 'ASC']]
    });

    // 4. Calculate Progress
    let progress = {};
    let overallProgress = 0;
    let guidance = [];

    if (!nextRank) {
        // Max rank achieved
        overallProgress = 100;
        guidance.push("Congratulations! You have achieved the highest rank.");
        progress = {
            message: "Max Rank Achieved"
        };
    } else {
        // Calculate Direct Referrals Progress
        const directsCount = await User.count({ where: { sponsorUserId: userId } });
        const requiredDirects = nextRank.requiredDirectReferrals || 0;
        const directsPct = requiredDirects > 0 ? Math.min((directsCount / requiredDirects) * 100, 100) : 100;

        // Calculate Team Business Progress
        const currentTeamBusiness = parseFloat(user.totalTeamBusiness || 0);
        const requiredTeamBusiness = parseFloat(nextRank.requiredTeamInvestment || 0);
        const teamBusinessPct = requiredTeamBusiness > 0 ? Math.min((currentTeamBusiness / requiredTeamBusiness) * 100, 100) : 100;

        // Calculate Personal Investment Progress
        const currentPersonalInvestment = parseFloat(user.totalInvestment || 0);
        const requiredPersonalInvestment = parseFloat(nextRank.requiredPersonalInvestment || 0);
        const personalInvestmentPct = requiredPersonalInvestment > 0 ? Math.min((currentPersonalInvestment / requiredPersonalInvestment) * 100, 100) : 100;

        // Populate Progress Object
        progress = {
            directReferrals: {
                current: directsCount,
                required: requiredDirects,
                percentage: parseFloat(directsPct.toFixed(1))
            },
            teamInvestment: {
                current: currentTeamBusiness,
                required: requiredTeamBusiness,
                percentage: parseFloat(teamBusinessPct.toFixed(1))
            },
            personalInvestment: {
                current: currentPersonalInvestment,
                required: requiredPersonalInvestment,
                percentage: parseFloat(personalInvestmentPct.toFixed(1))
            }
        };

        // Calculate Overall Score
        let activeCriteriaCount = 0;
        let totalPct = 0;

        if (requiredDirects > 0) { activeCriteriaCount++; totalPct += directsPct; }
        if (requiredTeamBusiness > 0) { activeCriteriaCount++; totalPct += teamBusinessPct; }
        if (requiredPersonalInvestment > 0) { activeCriteriaCount++; totalPct += personalInvestmentPct; }

        overallProgress = activeCriteriaCount > 0 ? (totalPct / activeCriteriaCount) : 0;
        overallProgress = parseFloat(overallProgress.toFixed(1));

        // Generate Guidance
        if (progress.directReferrals.current < progress.directReferrals.required) {
            guidance.push(`Recruit ${progress.directReferrals.required - progress.directReferrals.current} more direct members.`);
        }
        if (progress.teamInvestment.current < progress.teamInvestment.required) {
            guidance.push(`Increase Team Business by ${progress.teamInvestment.required - progress.teamInvestment.current}.`);
        }
        if (progress.personalInvestment.current < progress.personalInvestment.required) {
            guidance.push(`Increase Personal Investment by ${progress.personalInvestment.required - progress.personalInvestment.current}.`);
        }
    }

    res.status(200).json({
        success: true,
        data: {
            currentRank: {
                name: currentRank.name,
                displayOrder: currentRank.displayOrder
            },
            nextRank: nextRank ? {
                name: nextRank.name,
                displayOrder: nextRank.displayOrder,
                reward: nextRank.oneTimeBonus
            } : null,
            progress,
            overallProgress,
            guidance
        }
    });
});

exports.getAdminUserRankProgress = catchAsync(async (req, res, next) => {
    const userId = req.params.userId;

    // 1. Get User with latest stats
    const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'leftBv', 'rightBv', 'personalBv', 'teamBv']
    });

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // 2. Get current rank
    const currentRankRecord = await UserRank.findOne({
        where: { userId: userId, isCurrent: true },
        include: [{ model: Rank, as: 'Rank' }]
    });

    let currentRank;
    if (currentRankRecord) {
        currentRank = currentRankRecord.Rank;
    } else {
        const lowestRank = await Rank.findOne({ order: [['displayOrder', 'ASC']] });
        currentRank = lowestRank || { name: 'Unranked', displayOrder: 0 };
    }

    // 3. Find next rank
    const { Op } = require('sequelize');
    const nextRank = await Rank.findOne({
        where: {
            displayOrder: { [Op.gt]: currentRank.displayOrder || 0 },
            isActive: true
        },
        order: [['displayOrder', 'ASC']]
    });

    // 4. Calculate Progress
    let progress = {};
    let overallProgress = 0;
    let guidance = [];

    if (!nextRank) {
        overallProgress = 100;
        progress = { message: "Max Rank Achieved" };
    } else {
        const directsCount = await User.count({ where: { sponsorUserId: userId } });
        const requiredDirects = nextRank.requiredDirectReferrals || 0;
        const directsPct = requiredDirects > 0 ? Math.min((directsCount / requiredDirects) * 100, 100) : 100;

        const currentTeamBusiness = parseFloat(user.totalTeamBusiness || 0);
        const requiredTeamBusiness = parseFloat(nextRank.requiredTeamInvestment || 0);
        const teamBusinessPct = requiredTeamBusiness > 0 ? Math.min((currentTeamBusiness / requiredTeamBusiness) * 100, 100) : 100;

        const currentPersonalInvestment = parseFloat(user.totalInvestment || 0);
        const requiredPersonalInvestment = parseFloat(nextRank.requiredPersonalInvestment || 0);
        const personalInvestmentPct = requiredPersonalInvestment > 0 ? Math.min((currentPersonalInvestment / requiredPersonalInvestment) * 100, 100) : 100;

        progress = {
            directReferrals: { current: directsCount, required: requiredDirects, percentage: parseFloat(directsPct.toFixed(1)) },
            teamInvestment: { current: currentTeamBusiness, required: requiredTeamBusiness, percentage: parseFloat(teamBusinessPct.toFixed(1)) },
            personalInvestment: { current: currentPersonalInvestment, required: requiredPersonalInvestment, percentage: parseFloat(personalInvestmentPct.toFixed(1)) }
        };

        let activeCriteriaCount = 0;
        let totalPct = 0;
        if (requiredDirects > 0) { activeCriteriaCount++; totalPct += directsPct; }
        if (requiredTeamBusiness > 0) { activeCriteriaCount++; totalPct += teamBusinessPct; }
        if (requiredPersonalInvestment > 0) { activeCriteriaCount++; totalPct += personalInvestmentPct; }

        overallProgress = activeCriteriaCount > 0 ? (totalPct / activeCriteriaCount) : 0;
        overallProgress = parseFloat(overallProgress.toFixed(1));

        if (progress.directReferrals.current < progress.directReferrals.required) guidance.push(`Needs ${progress.directReferrals.required - progress.directReferrals.current} more direct members.`);
        if (progress.teamInvestment.current < progress.teamInvestment.required) guidance.push(`Needs ${progress.teamInvestment.required - progress.teamInvestment.current} more Team Business.`);
    }

    res.status(200).json({
        success: true,
        data: {
            currentRank: { name: currentRank.name, displayOrder: currentRank.displayOrder },
            nextRank: nextRank ? { name: nextRank.name, displayOrder: nextRank.displayOrder } : null,
            progress,
            overallProgress,
            guidance
        }
    });
});
