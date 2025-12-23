const { User, Income, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get Level Bonus eligibility status and stats
 */
exports.getLevelBonusEligibility = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get Level Bonus stats
        const levelBonusStats = await Income.findAll({
            where: {
                userId,
                incomeType: 'LEVEL_BONUS'
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'PENDING' THEN amount ELSE 0 END")), 'pendingAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'APPROVED' THEN amount ELSE 0 END")), 'approvedAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'PAID' THEN amount ELSE 0 END")), 'paidAmount']
            ],
            raw: true
        });

        const stats = levelBonusStats[0] || {
            totalCount: 0,
            totalAmount: 0,
            pendingAmount: 0,
            approvedAmount: 0,
            paidAmount: 0
        };

        // Get Direct Sales Commission count and latest date
        const directSalesData = await Income.findOne({
            where: {
                userId,
                incomeType: 'DIRECT_SALES_COMMISSION'
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('MAX', sequelize.col('created_at')), 'latestDate']
            ],
            raw: true
        });

        const directSalesCount = parseInt(directSalesData?.count || 0);
        const hasDirectSale = directSalesCount > 0;
        const directSaleDate = directSalesData?.latestDate || null;
        const levelBonusEligible = hasDirectSale; // Assuming eligibility depends on having a direct sale

        // Calculate Active Directs (Users sponsored by this user who are ACTIVE)
        const activeDirectsCount = await User.count({
            where: {
                sponsorUserId: userId,
                status: 'ACTIVE'
            }
        });

        // Calculate Max Unlocked Level
        // 1 Active Direct  = Unlocks Level 1 & 2
        // 3 Active Directs = Unlocks Level 3
        // 5 Active Directs = Unlocks All (20)
        let maxUnlockedLevel = 0;
        if (activeDirectsCount >= 5) maxUnlockedLevel = 20;
        else if (activeDirectsCount >= 3) maxUnlockedLevel = 5; // Level 3+
        else if (activeDirectsCount >= 1) maxUnlockedLevel = 2; // Level 1 & 2

        const eligibilityData = {
            hasDirectSale,
            levelBonusEligible,
            directSaleDate,
            status: levelBonusEligible ? 'UNLOCKED' : 'LOCKED',
            directSalesCount,
            activeDirectsCount,
            maxUnlockedLevel
        };

        return res.status(200).json({
            success: true,
            data: {
                eligibility: eligibilityData,
                stats: {
                    totalCount: parseInt(stats.totalCount) || 0,
                    totalAmount: parseFloat(stats.totalAmount) || 0,
                    pendingAmount: parseFloat(stats.pendingAmount) || 0,
                    approvedAmount: parseFloat(stats.approvedAmount) || 0,
                    paidAmount: parseFloat(stats.paidAmount) || 0
                }
            }
        });
    } catch (error) {
        console.error('Get level bonus eligibility error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get Level Bonus history with pagination
 */
exports.getLevelBonusHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            page = 1,
            limit = 10,
            status,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        const where = {
            userId,
            incomeType: 'LEVEL_BONUS'
        };

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                where.createdAt[Op.lte] = new Date(endDate);
            }
        }

        const { count, rows } = await Income.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            success: true,
            data: {
                history: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get level bonus history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get Direct Sales Commission history
 */
exports.getDirectSalesHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        const where = {
            userId,
            incomeType: 'DIRECT_SALES_COMMISSION'
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt[Op.gte] = new Date(startDate);
            }
            if (endDate) {
                where.createdAt[Op.lte] = new Date(endDate);
            }
        }

        const { count, rows } = await Income.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get stats
        const stats = await Income.findAll({
            where: {
                userId,
                incomeType: 'DIRECT_SALES_COMMISSION'
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN DATE_PART('month', \"createdAt\") = DATE_PART('month', CURRENT_DATE) AND DATE_PART('year', \"createdAt\") = DATE_PART('year', CURRENT_DATE) THEN amount ELSE 0 END")), 'monthAmount']
            ],
            raw: true
        });

        const statsData = stats[0] || {
            totalSales: 0,
            totalAmount: 0,
            monthAmount: 0
        };

        return res.status(200).json({
            success: true,
            data: {
                history: rows,
                stats: {
                    totalSales: parseInt(statsData.totalSales) || 0,
                    totalAmount: parseFloat(statsData.totalAmount) || 0,
                    monthAmount: parseFloat(statsData.monthAmount) || 0
                },
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get direct sales history error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
