const { User, Income, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get all Level Bonuses with filters (Admin)
 */
exports.getAllLevelBonuses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        const where = {
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

        const includeUser = {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        };

        const includeFromUser = {
            model: User,
            as: 'fromUser',
            attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        };

        if (search) {
            includeUser.where = {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { firstName: { [Op.iLike]: `%${search}%` } },
                    { lastName: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await Income.findAndCountAll({
            where,
            include: [includeUser, includeFromUser],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return res.status(200).json({
            success: true,
            data: {
                bonuses: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all level bonuses error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get Level Bonus statistics (Admin)
 */
exports.getLevelBonusStats = async (req, res) => {
    try {
        // Total stats
        const totalStats = await Income.findAll({
            where: {
                incomeType: 'LEVEL_BONUS'
            },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'PENDING' THEN amount ELSE 0 END")), 'pendingAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'APPROVED' THEN amount ELSE 0 END")), 'approvedAmount'],
                [sequelize.fn('SUM', sequelize.literal("CASE WHEN status = 'PAID' THEN amount ELSE 0 END")), 'paidAmount'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'PENDING' THEN 1 END")), 'pendingCount']
            ],
            raw: true
        });

        const stats = totalStats[0] || {
            totalCount: 0,
            totalAmount: 0,
            pendingAmount: 0,
            approvedAmount: 0,
            paidAmount: 0,
            pendingCount: 0
        };

        // Users with direct sales (and thus eligible)
        const usersWithDirectSales = await Income.count({
            distinct: true,
            col: 'userId',
            where: {
                incomeType: 'DIRECT_SALES_COMMISSION'
            }
        });

        const eligibleUsersCount = usersWithDirectSales;

        return res.status(200).json({
            success: true,
            data: {
                totalCount: parseInt(stats.totalCount) || 0,
                totalAmount: parseFloat(stats.totalAmount) || 0,
                pendingAmount: parseFloat(stats.pendingAmount) || 0,
                approvedAmount: parseFloat(stats.approvedAmount) || 0,
                paidAmount: parseFloat(stats.paidAmount) || 0,
                pendingCount: parseInt(stats.pendingCount) || 0,
                eligibleUsersCount,
                usersWithDirectSales
            }
        });
    } catch (error) {
        console.error('Get level bonus stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Approve Level Bonus (Admin)
 */
exports.approveLevelBonus = async (req, res) => {
    try {
        const { id } = req.params;

        const income = await Income.findOne({
            where: {
                id,
                incomeType: 'LEVEL_BONUS'
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id']
                }
            ]
        });

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Level Bonus not found'
            });
        }

        if (income.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Cannot approve Level Bonus with status ${income.status}`
            });
        }

        // Check if user is eligible (has direct sale)
        const hasDirectSale = await Income.count({
            where: {
                userId: income.userId,
                incomeType: 'DIRECT_SALES_COMMISSION'
            }
        });

        if (hasDirectSale === 0) {
            return res.status(400).json({
                success: false,
                message: 'User is not eligible for Level Bonus. Direct sale required.'
            });
        }

        income.status = 'APPROVED';
        income.processedAt = new Date();
        await income.save();

        return res.status(200).json({
            success: true,
            message: 'Level Bonus approved successfully',
            data: income
        });
    } catch (error) {
        console.error('Approve level bonus error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Reject Level Bonus (Admin)
 */
exports.rejectLevelBonus = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const income = await Income.findOne({
            where: {
                id,
                incomeType: 'LEVEL_BONUS'
            }
        });

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Level Bonus not found'
            });
        }

        if (income.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Cannot reject Level Bonus with status ${income.status}`
            });
        }

        income.status = 'REJECTED';
        income.remarks = reason || 'Rejected by admin';
        income.processedAt = new Date();
        await income.save();

        return res.status(200).json({
            success: true,
            message: 'Level Bonus rejected successfully',
            data: income
        });
    } catch (error) {
        console.error('Reject level bonus error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Mark user as having completed direct sale (Admin)
 */
exports.markDirectSaleComplete = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user already has a direct sale
        const existingSale = await Income.findOne({
            where: {
                userId: user.id,
                incomeType: 'DIRECT_SALES_COMMISSION'
            }
        });

        if (existingSale) {
            return res.status(400).json({
                success: false,
                message: 'User already has a direct sale recorded'
            });
        }

        // Create a 0-amount direct sale to mark eligibility
        await Income.create({
            userId: user.id,
            incomeType: 'DIRECT_SALES_COMMISSION',
            amount: 0,
            status: 'APPROVED',
            remarks: 'Manual eligibility marking',
            processedAt: new Date()
        });

        return res.status(200).json({
            success: true,
            message: 'User marked as eligible for Level Bonus',
            data: {
                hasDirectSale: true,
                levelBonusEligible: true,
                directSaleDate: new Date()
            }
        });
    } catch (error) {
        console.error('Mark direct sale complete error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Create Direct Sales Commission (Admin)
 */
exports.createDirectSalesCommission = async (req, res) => {
    try {
        const {
            userId,
            amount,
            percentage,
            baseAmount,
            remarks
        } = req.body;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const income = await Income.create({
            userId,
            incomeType: 'DIRECT_SALES_COMMISSION',
            amount,
            percentage,
            baseAmount,
            status: 'APPROVED',
            remarks,
            processedAt: new Date()
        });

        // Eligibility is now determined dynamically by existence of DIRECT_SALES_COMMISSION record

        return res.status(201).json({
            success: true,
            message: 'Direct Sales Commission created successfully',
            data: income
        });
    } catch (error) {
        console.error('Create direct sales commission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
