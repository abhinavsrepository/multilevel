const { User, Income, FastStartBonus, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get all direct bonuses with filters
 * GET /api/direct-bonus/admin
 */
exports.getAllDirectBonuses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, status, startDate, endDate, userId } = req.query;

        const whereClause = {
            incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] }
        };

        if (status) {
            whereClause.status = status;
        }

        if (userId) {
            whereClause.userId = userId;
        }

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const includeConditions = [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'firstName', 'lastName', 'email']
            },
            {
                model: User,
                as: 'fromUser',
                attributes: ['id', 'username', 'firstName', 'lastName', 'email']
            }
        ];

        if (search) {
            includeConditions[0].where = {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await Income.findAndCountAll({
            where: whereClause,
            include: includeConditions,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const bonuses = rows.map(income => ({
            id: income.id,
            user: {
                id: income.user.id,
                username: income.user.username,
                name: `${income.user.firstName} ${income.user.lastName}`,
                email: income.user.email
            },
            recruit: income.fromUser ? {
                id: income.fromUser.id,
                username: income.fromUser.username,
                name: `${income.fromUser.firstName} ${income.fromUser.lastName}`,
                email: income.fromUser.email
            } : null,
            amount: parseFloat(income.amount),
            percentage: income.percentage ? parseFloat(income.percentage) : null,
            baseAmount: income.baseAmount ? parseFloat(income.baseAmount) : null,
            status: income.status,
            type: income.incomeType,
            createdAt: income.createdAt,
            processedAt: income.processedAt,
            remarks: income.remarks
        }));

        // Get statistics
        const totalBonusResult = await Income.sum('amount', {
            where: whereClause
        });

        const approvedBonusResult = await Income.sum('amount', {
            where: { ...whereClause, status: { [Op.in]: ['APPROVED', 'PAID'] } }
        });

        const pendingBonusResult = await Income.sum('amount', {
            where: { ...whereClause, status: 'PENDING' }
        });

        res.json({
            success: true,
            data: bonuses,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                pages: Math.ceil(count / limit)
            },
            stats: {
                total: count,
                totalAmount: parseFloat(totalBonusResult) || 0,
                approvedAmount: parseFloat(approvedBonusResult) || 0,
                pendingAmount: parseFloat(pendingBonusResult) || 0
            }
        });
    } catch (error) {
        console.error('Error in getAllDirectBonuses:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Create direct bonus manually
 * POST /api/direct-bonus/admin
 */
exports.createDirectBonus = async (req, res) => {
    try {
        const { userId, fromUserId, amount, percentage, baseAmount, remarks } = req.body;

        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'User ID and amount are required'
            });
        }

        const income = await Income.create({
            userId: userId,
            fromUserId: fromUserId || null,
            incomeType: 'DIRECT_BONUS',
            amount: amount,
            percentage: percentage || null,
            baseAmount: baseAmount || null,
            status: 'APPROVED',
            remarks: remarks || 'Manual direct bonus by admin',
            processedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Direct bonus created successfully',
            data: {
                id: income.id,
                amount: parseFloat(income.amount)
            }
        });
    } catch (error) {
        console.error('Error in createDirectBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Approve direct bonus
 * POST /api/direct-bonus/admin/:id/approve
 */
exports.approveDirectBonus = async (req, res) => {
    try {
        const { id } = req.params;

        const income = await Income.findByPk(id);

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Bonus not found'
            });
        }

        await income.update({
            status: 'APPROVED',
            processedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Direct bonus approved successfully'
        });
    } catch (error) {
        console.error('Error in approveDirectBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Reject direct bonus
 * POST /api/direct-bonus/admin/:id/reject
 */
exports.rejectDirectBonus = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const income = await Income.findByPk(id);

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Bonus not found'
            });
        }

        await income.update({
            status: 'CANCELLED',
            remarks: reason || 'Rejected by admin',
            processedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Direct bonus rejected successfully'
        });
    } catch (error) {
        console.error('Error in rejectDirectBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Fast Start Bonus list (Admin)
 * GET /api/direct-bonus/admin/fast-start
 */
exports.getAllFastStartBonuses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { status, search } = req.query;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        const includeConditions = [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName', 'email']
        }];

        if (search) {
            includeConditions[0].where = {
                [Op.or]: [
                    { username: { [Op.like]: `%${search}%` } },
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await FastStartBonus.findAndCountAll({
            where: whereClause,
            include: includeConditions,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const bonuses = rows.map(fsb => {
            const currentDate = new Date();
            const daysRemaining = Math.ceil((fsb.endDate - currentDate) / (1000 * 60 * 60 * 24));
            const progress = ((fsb.currentSales / fsb.targetSales) + (fsb.currentRecruits / fsb.targetRecruits)) / 2 * 100;

            return {
                id: fsb.id,
                user: {
                    id: fsb.user.id,
                    username: fsb.user.username,
                    name: `${fsb.user.firstName} ${fsb.user.lastName}`,
                    email: fsb.user.email
                },
                targetSales: fsb.targetSales,
                targetRecruits: fsb.targetRecruits,
                currentSales: fsb.currentSales,
                currentRecruits: fsb.currentRecruits,
                bonusAmount: parseFloat(fsb.bonusAmount),
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                progress: Math.min(progress, 100),
                status: fsb.status,
                startDate: fsb.startDate,
                endDate: fsb.endDate,
                completedAt: fsb.completedAt
            };
        });

        res.json({
            success: true,
            data: bonuses,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error in getAllFastStartBonuses:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Create Fast Start Bonus for user
 * POST /api/direct-bonus/admin/fast-start
 */
exports.createFastStartBonus = async (req, res) => {
    try {
        const { userId, targetSales, targetRecruits, bonusAmount, periodDays } = req.body;

        if (!userId || !targetSales || !targetRecruits || !bonusAmount) {
            return res.status(400).json({
                success: false,
                message: 'User ID, targets, and bonus amount are required'
            });
        }

        // Check if user already has an active FSB
        const existingFSB = await FastStartBonus.findOne({
            where: {
                userId: userId,
                status: 'ACTIVE'
            }
        });

        if (existingFSB) {
            return res.status(400).json({
                success: false,
                message: 'User already has an active Fast Start Bonus'
            });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (periodDays || 60));

        const fsb = await FastStartBonus.create({
            userId: userId,
            targetSales: targetSales,
            targetRecruits: targetRecruits,
            bonusAmount: bonusAmount,
            periodDays: periodDays || 60,
            startDate: startDate,
            endDate: endDate,
            status: 'ACTIVE'
        });

        res.status(201).json({
            success: true,
            message: 'Fast Start Bonus created successfully',
            data: {
                id: fsb.id,
                endDate: fsb.endDate
            }
        });
    } catch (error) {
        console.error('Error in createFastStartBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Direct Bonus statistics (Admin)
 * GET /api/direct-bonus/admin/stats
 */
exports.getDirectBonusStats = async (req, res) => {
    try {
        const totalBonusesCount = await Income.count({
            where: {
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] }
            }
        });

        const totalBonusAmount = await Income.sum('amount', {
            where: {
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] },
                status: { [Op.in]: ['APPROVED', 'PAID'] }
            }
        });

        const pendingBonusesCount = await Income.count({
            where: {
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] },
                status: 'PENDING'
            }
        });

        const pendingBonusAmount = await Income.sum('amount', {
            where: {
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] },
                status: 'PENDING'
            }
        });

        const activeFSBCount = await FastStartBonus.count({
            where: { status: 'ACTIVE' }
        });

        const completedFSBCount = await FastStartBonus.count({
            where: { status: 'COMPLETED' }
        });

        res.json({
            success: true,
            data: {
                totalBonuses: totalBonusesCount,
                totalAmount: parseFloat(totalBonusAmount) || 0,
                pendingBonuses: pendingBonusesCount,
                pendingAmount: parseFloat(pendingBonusAmount) || 0,
                activeFastStartBonuses: activeFSBCount,
                completedFastStartBonuses: completedFSBCount
            }
        });
    } catch (error) {
        console.error('Error in getDirectBonusStats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
