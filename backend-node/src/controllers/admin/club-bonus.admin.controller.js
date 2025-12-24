const clubBonusService = require('../../services/club-bonus.service');
const { triggerClubBonusManually } = require('../../jobs/club-bonus.job');
const { ClubTier, ClubQualification, User, Income } = require('../../models');
const { Op } = require('sequelize');

/**
 * @desc    Manually trigger club bonus distribution
 * @route   POST /api/v1/admin/club-bonus/trigger
 * @access  Private/Admin
 */
exports.triggerDistribution = async (req, res, next) => {
    try {
        const { month, year } = req.body;

        // Calculate qualification month
        let qualificationMonth;
        if (month && year) {
            // Use provided month/year
            qualificationMonth = new Date(year, month - 1, 1);
        } else {
            // Default to previous month
            const now = new Date();
            qualificationMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }

        console.log(`[ADMIN] Manual trigger requested by user ${req.user.id} for ${qualificationMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`);

        const result = await triggerClubBonusManually(qualificationMonth);

        res.status(200).json({
            success: true,
            message: 'Club bonus distribution triggered successfully',
            data: result
        });
    } catch (error) {
        console.error('Error triggering club bonus distribution:', error);
        next(error);
    }
};

/**
 * @desc    Get all club tiers
 * @route   GET /api/v1/admin/club-bonus/tiers
 * @access  Private/Admin
 */
exports.getClubTiers = async (req, res, next) => {
    try {
        const tiers = await ClubTier.findAll({
            order: [['displayOrder', 'ASC']]
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
 * @desc    Create a new club tier
 * @route   POST /api/v1/admin/club-bonus/tiers
 * @access  Private/Admin
 */
exports.createClubTier = async (req, res, next) => {
    try {
        const {
            name,
            requiredTeamBusiness,
            bonusPercentage,
            displayOrder,
            balancingRuleStrong,
            balancingRuleWeak,
            newSalesRequirement,
            description,
            isActive
        } = req.body;

        // Validation
        if (!name || !requiredTeamBusiness) {
            return res.status(400).json({
                success: false,
                message: 'Name and required team business are required'
            });
        }

        const tier = await ClubTier.create({
            name,
            requiredTeamBusiness,
            bonusPercentage: bonusPercentage || 1.00,
            displayOrder,
            balancingRuleStrong: balancingRuleStrong || 60.00,
            balancingRuleWeak: balancingRuleWeak || 40.00,
            newSalesRequirement: newSalesRequirement || 10.00,
            description,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({
            success: true,
            message: 'Club tier created successfully',
            data: tier
        });
    } catch (error) {
        console.error('Error creating club tier:', error);
        next(error);
    }
};

/**
 * @desc    Update a club tier
 * @route   PUT /api/v1/admin/club-bonus/tiers/:id
 * @access  Private/Admin
 */
exports.updateClubTier = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tier = await ClubTier.findByPk(id);
        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Club tier not found'
            });
        }

        await tier.update(req.body);

        res.status(200).json({
            success: true,
            message: 'Club tier updated successfully',
            data: tier
        });
    } catch (error) {
        console.error('Error updating club tier:', error);
        next(error);
    }
};

/**
 * @desc    Delete a club tier
 * @route   DELETE /api/v1/admin/club-bonus/tiers/:id
 * @access  Private/Admin
 */
exports.deleteClubTier = async (req, res, next) => {
    try {
        const { id } = req.params;

        const tier = await ClubTier.findByPk(id);
        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Club tier not found'
            });
        }

        await tier.destroy();

        res.status(200).json({
            success: true,
            message: 'Club tier deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting club tier:', error);
        next(error);
    }
};

/**
 * @desc    Get club qualification history
 * @route   GET /api/v1/admin/club-bonus/qualifications
 * @access  Private/Admin
 */
exports.getQualifications = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            status,
            tierId,
            userId,
            month,
            year
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.qualificationStatus = status;
        }

        if (tierId) {
            where.clubTierId = tierId;
        }

        if (userId) {
            where.userId = userId;
        }

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            where.qualificationMonth = {
                [Op.between]: [startDate, endDate]
            };
        }

        const { count, rows: qualifications } = await ClubQualification.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'fullName', 'email']
                },
                {
                    model: ClubTier,
                    as: 'clubTier',
                    attributes: ['id', 'name', 'requiredTeamBusiness', 'bonusPercentage']
                },
                {
                    model: Income,
                    as: 'income',
                    attributes: ['id', 'amount', 'status']
                }
            ],
            order: [['qualificationMonth', 'DESC'], ['createdAt', 'DESC']],
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
        console.error('Error fetching qualifications:', error);
        next(error);
    }
};

/**
 * @desc    Get qualification details for a specific user and month
 * @route   GET /api/v1/admin/club-bonus/qualifications/:userId/:month/:year
 * @access  Private/Admin
 */
exports.getUserQualification = async (req, res, next) => {
    try {
        const { userId, month, year } = req.params;

        const qualificationMonth = new Date(year, month - 1, 1);

        const qualifications = await ClubQualification.findAll({
            where: {
                userId: userId,
                qualificationMonth: qualificationMonth
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'fullName', 'email', 'mobile', 'status', 'kycStatus']
                },
                {
                    model: ClubTier,
                    as: 'clubTier'
                },
                {
                    model: Income,
                    as: 'income'
                }
            ]
        });

        res.status(200).json({
            success: true,
            count: qualifications.length,
            data: qualifications
        });
    } catch (error) {
        console.error('Error fetching user qualification:', error);
        next(error);
    }
};

/**
 * @desc    Check qualification status for a user (without creating record)
 * @route   POST /api/v1/admin/club-bonus/check-qualification
 * @access  Private/Admin
 */
exports.checkQualification = async (req, res, next) => {
    try {
        const { userId, clubTierId, month, year } = req.body;

        if (!userId || !clubTierId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Club Tier ID are required'
            });
        }

        // Calculate qualification month
        let qualificationMonth;
        if (month && year) {
            qualificationMonth = new Date(year, month - 1, 1);
        } else {
            const now = new Date();
            qualificationMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }

        const result = await clubBonusService.checkUserQualification(
            userId,
            clubTierId,
            qualificationMonth
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error checking qualification:', error);
        next(error);
    }
};

/**
 * @desc    Get club bonus statistics
 * @route   GET /api/v1/admin/club-bonus/statistics
 * @access  Private/Admin
 */
exports.getStatistics = async (req, res, next) => {
    try {
        const { month, year } = req.query;

        let whereClause = {};

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);
            whereClause.qualificationMonth = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Get statistics by tier
        const tiers = await ClubTier.findAll({
            where: { isActive: true },
            order: [['displayOrder', 'ASC']]
        });

        const statistics = [];

        for (const tier of tiers) {
            const tierWhereClause = {
                ...whereClause,
                clubTierId: tier.id
            };

            const totalQualifications = await ClubQualification.count({
                where: tierWhereClause
            });

            const qualified = await ClubQualification.count({
                where: {
                    ...tierWhereClause,
                    qualificationStatus: 'QUALIFIED'
                }
            });

            const totalPaid = await ClubQualification.sum('netAmount', {
                where: {
                    ...tierWhereClause,
                    qualificationStatus: 'QUALIFIED'
                }
            }) || 0;

            statistics.push({
                tier: tier.name,
                tierId: tier.id,
                requiredBusiness: tier.requiredTeamBusiness,
                totalAttempts: totalQualifications,
                qualified,
                disqualified: totalQualifications - qualified,
                totalPaid: parseFloat(totalPaid),
                qualificationRate: totalQualifications > 0 ? ((qualified / totalQualifications) * 100).toFixed(2) : 0
            });
        }

        // Overall statistics
        const overallQualified = await ClubQualification.count({
            where: {
                ...whereClause,
                qualificationStatus: 'QUALIFIED'
            }
        });

        const overallPaid = await ClubQualification.sum('netAmount', {
            where: {
                ...whereClause,
                qualificationStatus: 'QUALIFIED'
            }
        }) || 0;

        res.status(200).json({
            success: true,
            data: {
                month: month ? parseInt(month) : null,
                year: year ? parseInt(year) : null,
                overall: {
                    totalQualified: overallQualified,
                    totalPaid: parseFloat(overallPaid)
                },
                byTier: statistics
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        next(error);
    }
};

/**
 * @desc    Initialize default club tiers
 * @route   POST /api/v1/admin/club-bonus/initialize
 * @access  Private/Admin
 */
exports.initializeDefaultTiers = async (req, res, next) => {
    try {
        // Check if tiers already exist
        const existingTiers = await ClubTier.count();
        if (existingTiers > 0) {
            return res.status(400).json({
                success: false,
                message: 'Club tiers already exist. Delete existing tiers first if you want to reinitialize.'
            });
        }

        const defaultTiers = [
            {
                name: 'Millionaire Club',
                requiredTeamBusiness: 10000000, // 1 Crore
                bonusPercentage: 1.00,
                displayOrder: 1,
                balancingRuleStrong: 60.00,
                balancingRuleWeak: 40.00,
                newSalesRequirement: 10.00,
                description: '1 Crore team business requirement with 1% bonus',
                isActive: true
            },
            {
                name: 'Rising Stars Club',
                requiredTeamBusiness: 25000000, // 2.5 Crore
                bonusPercentage: 1.00,
                displayOrder: 2,
                balancingRuleStrong: 60.00,
                balancingRuleWeak: 40.00,
                newSalesRequirement: 10.00,
                description: '2.5 Crore team business requirement with 1% bonus',
                isActive: true
            },
            {
                name: 'Business Leaders Club',
                requiredTeamBusiness: 50000000, // 5 Crore
                bonusPercentage: 1.00,
                displayOrder: 3,
                balancingRuleStrong: 60.00,
                balancingRuleWeak: 40.00,
                newSalesRequirement: 10.00,
                description: '5 Crore team business requirement with 1% bonus',
                isActive: true
            }
        ];

        const createdTiers = await ClubTier.bulkCreate(defaultTiers);

        res.status(201).json({
            success: true,
            message: 'Default club tiers initialized successfully',
            count: createdTiers.length,
            data: createdTiers
        });
    } catch (error) {
        console.error('Error initializing default tiers:', error);
        next(error);
    }
};

module.exports = exports;
