const clubBonusService = require('../../services/club-bonus.service');
const { ClubTier, ClubQualification, User, Income } = require('../../models');
const { Op } = require('sequelize');

/**
 * @desc    Get all active club tiers
 * @route   GET /api/v1/club-bonus/tiers
 * @access  Private
 */
exports.getClubTiers = async (req, res, next) => {
    try {
        const tiers = await ClubTier.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']],
            attributes: [
                'id',
                'name',
                'requiredTeamBusiness',
                'bonusPercentage',
                'displayOrder',
                'balancingRuleStrong',
                'balancingRuleWeak',
                'newSalesRequirement',
                'description'
            ]
        });

        res.status(200).json({
            success: true,
            count: tiers.length,
            data: tiers
        });
    } catch (error) {
        console.error('Error fetching club tiers:', error);
        next(error);
    }
};

/**
 * @desc    Get user's club qualification history
 * @route   GET /api/v1/club-bonus/my-qualifications
 * @access  Private
 */
exports.getMyQualifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows: qualifications } = await ClubQualification.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: ClubTier,
                    as: 'clubTier',
                    attributes: ['id', 'name', 'requiredTeamBusiness', 'bonusPercentage']
                },
                {
                    model: Income,
                    as: 'income',
                    attributes: ['id', 'amount', 'status', 'createdAt']
                }
            ],
            order: [['qualificationMonth', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            data: qualifications
        });
    } catch (error) {
        console.error('Error fetching user qualifications:', error);
        next(error);
    }
};

/**
 * @desc    Check current qualification status for all tiers
 * @route   GET /api/v1/club-bonus/check-status
 * @access  Private
 */
exports.checkMyStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get current month
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get all active tiers
        const tiers = await ClubTier.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        const statusResults = [];

        for (const tier of tiers) {
            try {
                const result = await clubBonusService.checkUserQualification(
                    userId,
                    tier.id,
                    currentMonth
                );

                statusResults.push({
                    tier: {
                        id: tier.id,
                        name: tier.name,
                        requiredTeamBusiness: tier.requiredTeamBusiness,
                        bonusPercentage: tier.bonusPercentage
                    },
                    qualified: result.qualified,
                    status: result.status,
                    reason: result.reason,
                    totalTeamBusiness: result.totalTeamBusiness || 0,
                    currentMonthSales: result.currentMonthSales || 0,
                    requiredNewSales: result.requiredNewSales || 0,
                    balancingCheck: result.balancingCheck ? {
                        passed: result.balancingCheck.passed,
                        strongestLegPercentage: result.balancingCheck.strongLegPercentage,
                        weakLegsPercentage: result.balancingCheck.weakLegsPercentage
                    } : null,
                    potentialBonus: result.bonusAmount || 0,
                    potentialNetBonus: result.tdsCalculation?.netAmount || 0
                });
            } catch (error) {
                console.error(`Error checking tier ${tier.id} for user ${userId}:`, error);
                statusResults.push({
                    tier: {
                        id: tier.id,
                        name: tier.name,
                        requiredTeamBusiness: tier.requiredTeamBusiness
                    },
                    qualified: false,
                    status: 'ERROR',
                    reason: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            month: currentMonth,
            data: statusResults
        });
    } catch (error) {
        console.error('Error checking user status:', error);
        next(error);
    }
};

/**
 * @desc    Get team business breakdown
 * @route   GET /api/v1/club-bonus/team-business
 * @access  Private
 */
exports.getTeamBusiness = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get current month data
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Get all-time team business
        const totalTeamBusiness = await clubBonusService.getTeamBusinessVolume(userId, null, monthEnd);

        // Get current month team business
        const currentMonthBusiness = await clubBonusService.getTeamBusinessVolume(userId, monthStart, monthEnd);

        // Get leg volumes
        const legVolumes = await clubBonusService.getDirectLegVolumes(userId, null, monthEnd);

        // Calculate percentages
        const strongestLeg = legVolumes[0] || null;
        const strongestLegVolume = strongestLeg ? strongestLeg.volume : 0;
        const otherLegsVolume = legVolumes.slice(1).reduce((sum, leg) => sum + leg.volume, 0);

        const strongLegPercentage = totalTeamBusiness > 0 ? (strongestLegVolume / totalTeamBusiness) * 100 : 0;
        const weakLegsPercentage = totalTeamBusiness > 0 ? (otherLegsVolume / totalTeamBusiness) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                totalTeamBusiness,
                currentMonthBusiness,
                legBreakdown: {
                    strongestLeg: strongestLeg ? {
                        userId: strongestLeg.userId,
                        username: strongestLeg.username,
                        fullName: strongestLeg.fullName,
                        volume: strongestLeg.volume,
                        percentage: strongLegPercentage
                    } : null,
                    otherLegsVolume,
                    otherLegsPercentage: weakLegsPercentage,
                    allLegs: legVolumes
                }
            }
        });
    } catch (error) {
        console.error('Error fetching team business:', error);
        next(error);
    }
};

/**
 * @desc    Get club bonus summary/dashboard
 * @route   GET /api/v1/club-bonus/dashboard
 * @access  Private
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get total club income earned
        const totalEarned = await Income.sum('amount', {
            where: {
                userId,
                incomeType: 'CLUB_INCOME',
                status: 'APPROVED'
            }
        }) || 0;

        // Get qualification count
        const totalQualifications = await ClubQualification.count({
            where: {
                userId,
                qualificationStatus: 'QUALIFIED'
            }
        });

        // Get recent qualifications
        const recentQualifications = await ClubQualification.findAll({
            where: { userId },
            include: [
                {
                    model: ClubTier,
                    as: 'clubTier',
                    attributes: ['id', 'name']
                }
            ],
            order: [['qualificationMonth', 'DESC']],
            limit: 5
        });

        // Get current team business
        const now = new Date();
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const totalTeamBusiness = await clubBonusService.getTeamBusinessVolume(userId, null, monthEnd);

        // Get next achievable tier
        const tiers = await ClubTier.findAll({
            where: {
                isActive: true,
                requiredTeamBusiness: {
                    [Op.gt]: totalTeamBusiness
                }
            },
            order: [['requiredTeamBusiness', 'ASC']],
            limit: 1
        });

        const nextTier = tiers[0] || null;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalEarned: parseFloat(totalEarned),
                    totalQualifications,
                    currentTeamBusiness: totalTeamBusiness
                },
                nextTier: nextTier ? {
                    id: nextTier.id,
                    name: nextTier.name,
                    requiredBusiness: nextTier.requiredTeamBusiness,
                    gap: parseFloat(nextTier.requiredTeamBusiness) - totalTeamBusiness,
                    gapPercentage: (totalTeamBusiness / parseFloat(nextTier.requiredTeamBusiness) * 100).toFixed(2)
                } : null,
                recentQualifications: recentQualifications.map(q => ({
                    month: q.qualificationMonth,
                    tier: q.clubTier.name,
                    amount: q.netAmount,
                    status: q.qualificationStatus
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        next(error);
    }
};

module.exports = exports;
