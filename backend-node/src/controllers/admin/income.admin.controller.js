const { Income, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');

/**
 * Get all incomes by type (Admin)
 */
exports.getIncomeByType = catchAsync(async (req, res) => {
    try {
        const { incomeType } = req.params;
        const {
            page = 1,
            limit = 10,
            search,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (incomeType && incomeType !== 'ALL') {
            let dbType = incomeType;
            if (incomeType === 'LEVEL') dbType = 'LEVEL_COMMISSION';
            else if (incomeType === 'MATCHING') dbType = 'MATCHING_BONUS'; // Adjust if enum differs
            else if (incomeType === 'ROI') dbType = 'ROI_BONUS'; // Adjust if enum differs
            else if (incomeType === 'DIRECT') dbType = 'DIRECT_BONUS';
            else if (incomeType === 'REWARD') dbType = 'REWARD';

            // To be safe with "MATCHING" vs "MATCHING_BONUS", check exact DB enums if possible.
            // But let's assume the previous code was roughly correct or we use LIKE.
            // Actually, let's use the provided type directly IF the user hasn't specified one of these aliases.

            where.incomeType = dbType;
        }

        if (search) {
            where[Op.or] = [
                { '$user.username$': { [Op.iLike]: `%${search}%` } },
                { '$user.email$': { [Op.iLike]: `%${search}%` } },
                { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
                { '$user.lastName$': { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { rows, count } = await Income.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'username', 'firstName', 'lastName'],
                    required: false
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]]
        });

        res.json({
            success: true,
            data: {
                incomes: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get admin income by type error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve income records',
            error: error.message
        });
    }
});

/**
 * Get income summary for all users (Admin)
 */
exports.getIncomeSummary = catchAsync(async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        // 1. Fetch Users with pagination and search
        const userWhere = { role: 'user' }; // Only fetch regular users
        if (search) {
            userWhere[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { rows: users, count: totalUsers } = await User.findAndCountAll({
            where: userWhere,
            attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const userIds = users.map(u => u.id);

        // 2. Fetch Aggregated Incomes for these users
        const incomeWhere = {
            userId: { [Op.in]: userIds }
        };

        if (startDate && endDate) {
            incomeWhere.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Aggregate by userId and incomeType
        const incomes = await Income.findAll({
            where: incomeWhere,
            attributes: [
                'userId',
                'incomeType',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                'status'
            ],
            group: ['userId', 'incomeType', 'status'],
            raw: true
        });

        // 3. Process data
        const summaryData = users.map(user => {
            const userIncomes = incomes.filter(i => i.userId === user.id);

            const summary = {
                userId: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                directBonus: 0,
                levelBonus: 0,
                matchingBonus: 0,
                roiBonus: 0,
                rewardBonus: 0,
                totalIncome: 0,
                paidAmount: 0,
                pendingAmount: 0
            };

            userIncomes.forEach(inc => {
                const amount = parseFloat(inc.totalAmount || 0);
                const type = inc.incomeType;
                const status = inc.status;

                // Break down by type
                if (type === 'DIRECT_BONUS') summary.directBonus += amount;
                else if (type === 'LEVEL_COMMISSION') summary.levelBonus += amount;
                else if (type === 'MATCHING_BONUS') summary.matchingBonus += amount;
                else if (type === 'ROI_BONUS') summary.roiBonus += amount;
                else if (type === 'REWARD') summary.rewardBonus += amount;

                // Total Income (All types)
                summary.totalIncome += amount;

                // Status breakdown
                if (status === 'PAID') {
                    summary.paidAmount += amount;
                } else if (status === 'PENDING' || status === 'APPROVED') {
                    // Assuming APPROVED is essentially pending payment in this context, 
                    // or strictly PENDING. Let's group non-PAID as Pending for summary view.
                    summary.pendingAmount += amount;
                }
            });

            return summary;
        });

        res.json({
            success: true,
            data: summaryData,
            pagination: {
                total: totalUsers,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        console.error('Get income summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve income summary',
            error: error.message
        });
    }
});

/**
 * Get overall income statistics (Admin)
 */
exports.getAdminIncomeStats = catchAsync(async (req, res) => {
    try {
        // Aggregate all incomes
        const stats = await Income.findAll({
            attributes: [
                'incomeType',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                'status'
            ],
            group: ['incomeType', 'status'],
            raw: true
        });

        const result = {
            totalIncome: 0,
            directBonus: 0,
            levelBonus: 0,
            matchingBonus: 0,
            roiBonus: 0,
            rewardBonus: 0,
            paidAmount: 0,
            pendingAmount: 0,
            totalUsers: 0
        };

        stats.forEach(s => {
            const amount = parseFloat(s.totalAmount || 0);
            const type = s.incomeType;
            const status = s.status;

            result.totalIncome += amount;

            if (type === 'DIRECT_BONUS') result.directBonus += amount;
            else if (type === 'LEVEL_COMMISSION') result.levelBonus += amount;
            else if (type === 'MATCHING_BONUS') result.matchingBonus += amount;
            else if (type === 'ROI_BONUS') result.roiBonus += amount;
            else if (type === 'REWARD') result.rewardBonus += amount;

            if (status === 'PAID') result.paidAmount += amount;
            else if (status === 'PENDING' || status === 'APPROVED') result.pendingAmount += amount;
        });

        // Get total users count
        result.totalUsers = await User.count({ where: { role: 'user' } });

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve income statistics',
            error: error.message
        });
    }
});

/**
 * Export income summary as CSV
 */
exports.exportIncomeSummary = catchAsync(async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;

        // Fetch ALL users matching filter (no pagination)
        const userWhere = { role: 'user' };
        if (search) {
            userWhere[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where: userWhere,
            attributes: ['id', 'username', 'email', 'firstName', 'lastName'],
            order: [['createdAt', 'DESC']]
        });

        const userIds = users.map(u => u.id);
        const incomeWhere = { userId: { [Op.in]: userIds } };

        if (startDate && endDate) {
            incomeWhere.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const incomes = await Income.findAll({
            where: incomeWhere,
            attributes: [
                'userId',
                'incomeType',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                'status'
            ],
            group: ['userId', 'incomeType', 'status'],
            raw: true
        });

        // CSV Header
        let csv = 'User ID,Username,Name,Email,Total Income,Direct Bonus,Level Bonus,Matching Bonus,ROI Bonus,Reward Bonus,Paid,Pending\n';

        users.forEach(user => {
            const userIncomes = incomes.filter(i => i.userId === user.id);
            let direct = 0, level = 0, matching = 0, roi = 0, reward = 0, total = 0, paid = 0, pending = 0;

            userIncomes.forEach(inc => {
                const amount = parseFloat(inc.totalAmount || 0);
                const type = inc.incomeType;
                const status = inc.status;

                total += amount;
                if (type === 'DIRECT_BONUS') direct += amount;
                else if (type === 'LEVEL_COMMISSION') level += amount;
                else if (type === 'MATCHING_BONUS') matching += amount;
                else if (type === 'ROI_BONUS') roi += amount;
                else if (type === 'REWARD') reward += amount;

                if (status === 'PAID') paid += amount;
                else if (status === 'PENDING' || status === 'APPROVED') pending += amount;
            });

            csv += `${user.id},${user.username},${user.firstName} ${user.lastName},${user.email},${total},${direct},${level},${matching},${roi},${reward},${paid},${pending}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.attachment('income-summary.csv');
        return res.send(csv);

    } catch (error) {
        console.error('Export income summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export income summary',
            error: error.message
        });
    }
});
