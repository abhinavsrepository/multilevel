const { Bonanza, BonanzaQualification, User } = require('../../models');
const { Op } = require('sequelize');
const bonanzaService = require('../../services/bonanza-enhanced.service');

/**
 * ADMIN BONANZA MANAGEMENT CONTROLLER
 * Handles all admin operations for Bonanza campaigns
 */

/**
 * Create a new Bonanza campaign
 * POST /api/v1/admin/bonanza
 */
exports.createBonanza = async (req, res) => {
    try {
        const {
            name,
            description,
            startDate,
            endDate,
            qualificationCriteria,
            rewardType,
            rewardAmount,
            rewardDescription,
            totalPoolAmount,
            maxQualifiers,
            periodType,
            periodDays,
            isVisible,
            priority,
            bannerImage,
            iconImage,
            notes
        } = req.body;

        // Validation
        if (!name || !startDate || !endDate || !qualificationCriteria || !rewardType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Determine initial status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let status = 'DRAFT';

        if (start <= today && end >= today) {
            status = 'ACTIVE';
        } else if (start > today) {
            status = 'UPCOMING';
        }

        // Create bonanza
        const bonanza = await Bonanza.create({
            name,
            description,
            startDate,
            endDate,
            qualificationCriteria,
            rewardType,
            rewardAmount,
            rewardDescription,
            totalPoolAmount,
            status,
            maxQualifiers,
            periodType: periodType || 'FIXED_DATES',
            periodDays,
            isVisible: isVisible !== undefined ? isVisible : true,
            priority: priority || 0,
            bannerImage,
            iconImage,
            createdBy: req.user.id,
            notes
        });

        res.status(201).json({
            success: true,
            message: 'Bonanza created successfully',
            data: bonanza
        });

    } catch (error) {
        console.error('Error creating bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create bonanza',
            error: error.message
        });
    }
};

/**
 * Get all bonanzas with filters
 * GET /api/v1/admin/bonanza
 */
exports.getAllBonanzas = async (req, res) => {
    try {
        const {
            status,
            periodType,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (periodType) {
            where.periodType = periodType;
        }

        const offset = (page - 1) * limit;

        const { count, rows: bonanzas } = await Bonanza.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]],
            include: [{
                model: BonanzaQualification,
                as: 'qualifications',
                attributes: ['id', 'userId', 'status', 'qualifiedDate'],
                separate: true,
                limit: 5
            }]
        });

        // Add statistics
        const bonanzasWithStats = await Promise.all(bonanzas.map(async (bonanza) => {
            const stats = await BonanzaQualification.findOne({
                where: { bonanzaId: bonanza.id },
                attributes: [
                    [bonanza.sequelize.fn('COUNT', bonanza.sequelize.col('id')), 'totalParticipants'],
                    [bonanza.sequelize.fn('COUNT', bonanza.sequelize.literal(`CASE WHEN status = 'QUALIFIED' OR status = 'AWARDED' THEN 1 END`)), 'qualifiedCount'],
                    [bonanza.sequelize.fn('COUNT', bonanza.sequelize.literal(`CASE WHEN status = 'IN_PROGRESS' THEN 1 END`)), 'inProgressCount']
                ],
                raw: true
            });

            return {
                ...bonanza.toJSON(),
                stats: stats || { totalParticipants: 0, qualifiedCount: 0, inProgressCount: 0 }
            };
        }));

        res.json({
            success: true,
            data: bonanzasWithStats,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error getting bonanzas:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bonanzas',
            error: error.message
        });
    }
};

/**
 * Get single bonanza by ID with detailed stats
 * GET /api/v1/admin/bonanza/:id
 */
exports.getBonanzaById = async (req, res) => {
    try {
        const { id } = req.params;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Get detailed statistics
        const qualifications = await BonanzaQualification.findAll({
            where: { bonanzaId: id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'firstName', 'lastName', 'email']
            }]
        });

        const stats = {
            totalParticipants: qualifications.length,
            qualified: qualifications.filter(q => q.status === 'QUALIFIED' || q.status === 'AWARDED').length,
            awarded: qualifications.filter(q => q.status === 'AWARDED').length,
            inProgress: qualifications.filter(q => q.status === 'IN_PROGRESS').length,
            pending: qualifications.filter(q => q.status === 'PENDING').length,
            disqualified: qualifications.filter(q => q.status === 'DISQUALIFIED').length,
            totalPaidOut: bonanza.totalPaidOut,
            averageProgress: qualifications.length > 0
                ? qualifications.reduce((sum, q) => sum + parseFloat(q.overallProgress || 0), 0) / qualifications.length
                : 0
        };

        res.json({
            success: true,
            data: {
                ...bonanza.toJSON(),
                stats,
                recentQualifications: qualifications.slice(0, 10)
            }
        });

    } catch (error) {
        console.error('Error getting bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bonanza',
            error: error.message
        });
    }
};

/**
 * Update bonanza
 * PUT /api/v1/admin/bonanza/:id
 */
exports.updateBonanza = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Don't allow changing certain fields if bonanza is already ACTIVE or EXPIRED
        if (bonanza.status === 'ACTIVE' || bonanza.status === 'EXPIRED') {
            delete updateData.qualificationCriteria;
            delete updateData.rewardType;
            delete updateData.startDate;
            delete updateData.endDate;
        }

        updateData.lastUpdatedBy = req.user.id;

        await bonanza.update(updateData);

        res.json({
            success: true,
            message: 'Bonanza updated successfully',
            data: bonanza
        });

    } catch (error) {
        console.error('Error updating bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update bonanza',
            error: error.message
        });
    }
};

/**
 * Delete bonanza
 * DELETE /api/v1/admin/bonanza/:id
 */
exports.deleteBonanza = async (req, res) => {
    try {
        const { id } = req.params;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Don't allow deletion of active bonanzas with qualifications
        const qualificationCount = await BonanzaQualification.count({
            where: {
                bonanzaId: id,
                status: { [Op.in]: ['QUALIFIED', 'AWARDED'] }
            }
        });

        if (qualificationCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete bonanza with qualified users. Please cancel it instead.'
            });
        }

        await bonanza.destroy();

        res.json({
            success: true,
            message: 'Bonanza deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete bonanza',
            error: error.message
        });
    }
};

/**
 * Get bonanza qualifiers (participants)
 * GET /api/v1/admin/bonanza/:id/qualifiers
 */
exports.getBonanzaQualifiers = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            status,
            page = 1,
            limit = 50,
            search
        } = req.query;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        const where = { bonanzaId: id };

        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        // Build user search condition
        let userWhere = {};
        if (search) {
            userWhere = {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { firstName: { [Op.iLike]: `%${search}%` } },
                    { lastName: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows: qualifications } = await BonanzaQualification.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['rank', 'ASC NULLS LAST'],
                ['leaderboardScore', 'DESC'],
                ['overallProgress', 'DESC']
            ],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber'],
                where: userWhere
            }]
        });

        res.json({
            success: true,
            data: qualifications,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error getting qualifiers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch qualifiers',
            error: error.message
        });
    }
};

/**
 * Get real-time tracking dashboard data
 * GET /api/v1/admin/bonanza/:id/dashboard
 */
exports.getBonanzaDashboard = async (req, res) => {
    try {
        const { id } = req.params;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Get leaderboard
        const leaderboard = await bonanzaService.getBonanzaLeaderboard(id, 10);

        // Get qualification stats
        const qualifications = await BonanzaQualification.findAll({
            where: { bonanzaId: id },
            attributes: [
                'status',
                [bonanza.sequelize.fn('COUNT', bonanza.sequelize.col('id')), 'count'],
                [bonanza.sequelize.fn('AVG', bonanza.sequelize.col('overallProgress')), 'avgProgress']
            ],
            group: ['status'],
            raw: true
        });

        // Get daily progress trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyProgress = await BonanzaQualification.findAll({
            where: {
                bonanzaId: id,
                updatedAt: { [Op.gte]: sevenDaysAgo }
            },
            attributes: [
                [bonanza.sequelize.fn('DATE', bonanza.sequelize.col('updatedAt')), 'date'],
                [bonanza.sequelize.fn('COUNT', bonanza.sequelize.col('id')), 'activeUsers'],
                [bonanza.sequelize.fn('AVG', bonanza.sequelize.col('overallProgress')), 'avgProgress']
            ],
            group: [bonanza.sequelize.fn('DATE', bonanza.sequelize.col('updatedAt'))],
            order: [[bonanza.sequelize.fn('DATE', bonanza.sequelize.col('updatedAt')), 'ASC']],
            raw: true
        });

        // Calculate projected payout
        const projectedQualifiers = qualifications.find(q => q.status === 'QUALIFIED')?.count || 0;
        const inProgressCount = qualifications.find(q => q.status === 'IN_PROGRESS')?.count || 0;

        let projectedPayout = parseFloat(bonanza.totalPaidOut || 0);

        if (bonanza.rewardType === 'FIXED') {
            projectedPayout += (inProgressCount * 0.3) * parseFloat(bonanza.rewardAmount || 0); // Estimate 30% will qualify
        } else if (bonanza.rewardType === 'POOL_SHARE') {
            projectedPayout = parseFloat(bonanza.totalPoolAmount || 0);
        }

        res.json({
            success: true,
            data: {
                bonanza: bonanza,
                leaderboard: leaderboard,
                stats: {
                    byStatus: qualifications,
                    totalPaidOut: parseFloat(bonanza.totalPaidOut || 0),
                    projectedPayout: projectedPayout,
                    currentQualifiers: bonanza.currentQualifiers,
                    maxQualifiers: bonanza.maxQualifiers,
                    remainingSlots: bonanza.maxQualifiers ? bonanza.maxQualifiers - bonanza.currentQualifiers : null
                },
                trends: {
                    dailyProgress: dailyProgress
                }
            }
        });

    } catch (error) {
        console.error('Error getting dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

/**
 * Manual award bonanza to user
 * POST /api/v1/admin/bonanza/:id/manual-award
 */
exports.manualAwardBonanza = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, reason } = req.body;

        if (!userId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide userId and reason'
            });
        }

        const result = await bonanzaService.manualAwardBonanza(id, userId, req.user.id, reason);

        res.json({
            success: true,
            message: 'Bonanza awarded manually',
            data: result
        });

    } catch (error) {
        console.error('Error in manual award:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to award bonanza',
            error: error.message
        });
    }
};

/**
 * Trigger status update manually
 * POST /api/v1/admin/bonanza/update-statuses
 */
exports.updateStatuses = async (req, res) => {
    try {
        await bonanzaService.updateBonanzaStatuses();

        res.json({
            success: true,
            message: 'Bonanza statuses updated successfully'
        });

    } catch (error) {
        console.error('Error updating statuses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update statuses',
            error: error.message
        });
    }
};

/**
 * Get bonanza statistics overview
 * GET /api/v1/admin/bonanza/statistics
 */
exports.getBonanzaStatistics = async (req, res) => {
    try {
        const totalBonanzas = await Bonanza.count();
        const activeBonanzas = await Bonanza.count({ where: { status: 'ACTIVE' } });
        const upcomingBonanzas = await Bonanza.count({ where: { status: 'UPCOMING' } });

        const totalPaidOut = await Bonanza.sum('totalPaidOut');
        const totalQualifiers = await BonanzaQualification.count({
            where: { status: { [Op.in]: ['QUALIFIED', 'AWARDED'] } }
        });

        const topPerformingBonanzas = await Bonanza.findAll({
            limit: 5,
            order: [['currentQualifiers', 'DESC']],
            attributes: ['id', 'name', 'currentQualifiers', 'totalPaidOut', 'status']
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalBonanzas,
                    activeBonanzas,
                    upcomingBonanzas,
                    totalPaidOut: totalPaidOut || 0,
                    totalQualifiers
                },
                topPerforming: topPerformingBonanzas
            }
        });

    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

module.exports = exports;
