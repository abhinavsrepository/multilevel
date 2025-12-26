const { Rank, UserRank, User, sequelize } = require('../models');
const RankService = require('../services/rank.service');
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

    // 4. Calculate Progress & 40:60 Rule
    let progress = {};
    let overallProgress = 0;
    let guidance = [];
    let balancingData = null;

    if (!nextRank) {
        overallProgress = 100;
        progress = { message: "Max Rank Achieved" };
    } else {
        // --- 40:60 Logic Implementation ---

        // Get volumes from RankService
        const legVolumes = await RankService.getDirectLegVolumes(userId);
        const volumes = legVolumes.map(l => l.volume);

        const totalTeamBusiness = volumes.reduce((a, b) => a + b, 0);
        const strongestLegVolume = Math.max(...volumes, 0);
        const otherLegsVolume = totalTeamBusiness - strongestLegVolume;

        // Targets
        const target = parseFloat(nextRank.target || nextRank.requiredTeamInvestment || 0); // Assuming one of these holds the volume target

        // 40:60 Calculation
        const maxFromStrongLeg = target * 0.6;
        const validFromStrongLeg = Math.min(strongestLegVolume, maxFromStrongLeg);

        // For 'Other Legs', the requirement is implicit:
        // IF StrongLeg > 60%, the excess doesn't count. 
        // So effectively, you need 40% from others eventually to reach 100%.
        // But for *current progress*, we just sum valid parts.

        const validTotalVolume = validFromStrongLeg + otherLegsVolume;
        const progressPercentage = target > 0 ? Math.min((validTotalVolume / target) * 100, 100) : 100;

        balancingData = {
            strongestLeg: {
                volume: strongestLegVolume,
                cappedVolume: validFromStrongLeg,
                required: maxFromStrongLeg, // Visual guide for the user
                percentage: (strongestLegVolume / maxFromStrongLeg) * 100
                // Note: This percentage can go > 100% to show overflow
            },
            otherLegs: {
                volume: otherLegsVolume,
                required: target * 0.4, // Min 40% needed from others
                percentage: (otherLegsVolume / (target * 0.4)) * 100
            },
            totalValidVolume,
            target
        };

        // Standard Requirements
        const directsCount = await User.count({ where: { sponsorUserId: userId } });
        const requiredDirects = nextRank.requiredDirectReferrals || 0;
        const directsPct = requiredDirects > 0 ? Math.min((directsCount / requiredDirects) * 100, 100) : 100;

        const currentPersonalInvestment = parseFloat(user.totalInvestment || 0);
        const requiredPersonalInvestment = parseFloat(nextRank.requiredPersonalInvestment || 0);
        const personalInvestmentPct = requiredPersonalInvestment > 0 ? Math.min((currentPersonalInvestment / requiredPersonalInvestment) * 100, 100) : 100;

        progress = {
            directReferrals: { current: directsCount, required: requiredDirects, percentage: parseFloat(directsPct.toFixed(1)) },
            teamInvestment: {
                current: totalTeamBusiness,
                required: target,
                percentage: parseFloat(progressPercentage.toFixed(1)), // Use 40:60 adjusted percentage
                validVolume: validTotalVolume
            },
            personalInvestment: { current: currentPersonalInvestment, required: requiredPersonalInvestment, percentage: parseFloat(personalInvestmentPct.toFixed(1)) },
            balancing: balancingData
        };

        let activeCriteriaCount = 0;
        let totalPct = 0;

        // Weighting - Team Business (Balancing) is usually the hardest part, let's weight equally for now
        if (requiredDirects > 0) { activeCriteriaCount++; totalPct += directsPct; }
        if (target > 0) { activeCriteriaCount++; totalPct += progressPercentage; }
        if (requiredPersonalInvestment > 0) { activeCriteriaCount++; totalPct += personalInvestmentPct; }

        overallProgress = activeCriteriaCount > 0 ? (totalPct / activeCriteriaCount) : 0;
        overallProgress = parseFloat(overallProgress.toFixed(1));

        // Guidance - Ensure it's always an array
        guidance = guidance || [];
        if (progress.directReferrals.current < progress.directReferrals.required)
            guidance.push(`Recruit ${progress.directReferrals.required - progress.directReferrals.current} more direct members.`);

        if (validTotalVolume < target) {
            guidance.push(`Increase Balanced Team Business by ${(target - validTotalVolume).toFixed(2)}.`);
            if (otherLegsVolume < (target * 0.4)) {
                guidance.push(`Focus on weaker legs! You need ${(target * 0.4 - otherLegsVolume).toFixed(2)} more from non-strongest legs.`);
            }
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

        // Ensure guidance is always an array
        guidance = guidance || [];
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
