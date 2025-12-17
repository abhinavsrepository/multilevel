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

        // Handle special types or mapping if needed
        // Log says: LEVEL, MATCHING, ROI
        // Ensure these match DB enum or strings
        if (incomeType && incomeType !== 'ALL') {
            // You might need to map 'LEVEL' -> 'LEVEL_COMMISSION' if frontend uses short codes
            // But let's assume direct match or 'LIKE' for now, or strict if frontend sends exact DB values.
            // Based on user controller, it uses 'LEVEL_COMMISSION'.
            // Let's assume the frontend sends what it expects or we map it.
            // User logs: /admin/type/LEVEL. DB likely: 'LEVEL_COMMISSION'.
            // Let's check user controller again... it filters incomeType: 'LEVEL_COMMISSION'.

            let dbType = incomeType;
            if (incomeType === 'LEVEL') dbType = 'LEVEL_COMMISSION';
            else if (incomeType === 'MATCHING') dbType = 'MATCHING';
            else if (incomeType === 'ROI') dbType = 'ROI';
            else if (incomeType === 'DIRECT') dbType = 'DIRECT_BONUS';
            else if (incomeType === 'REWARD') dbType = 'REWARD';

            where.incomeType = dbType;
        }

        if (search) {
            where[Op.or] = [
                { '$user.username$': { [Op.iLike]: `%${search}%` } },
                { '$user.email$': { [Op.iLike]: `%${search}%` } },
                { '$user.fullName$': { [Op.iLike]: `%${search}%` } }
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
                    as: 'user', // Assuming 'user' association exists (user who received income)
                    attributes: ['id', 'username', 'fullName', 'email']
                },
                {
                    model: User,
                    as: 'fromUser', // Assuming 'fromUser' exists (source of income)
                    attributes: ['id', 'username', 'fullName'],
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
 * Get admin dashboard income stats (optional, but good to have)
 */
exports.getAdminIncomeStats = catchAsync(async (req, res) => {
    // ... useful for admin dashboard
    res.json({ success: true, message: "Not implemented yet" });
});
