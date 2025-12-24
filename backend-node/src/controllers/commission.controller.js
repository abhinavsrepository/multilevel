const { Commission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.getCommissionHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;

        const where = {};

        // If not admin, restrict to own commissions
        if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            where.userId = req.user.id;
        } else if (req.query.userId) {
            // Admin can filter by specific user
            where.userId = req.query.userId;
        }
        if (type) where.commissionType = type;
        if (status) where.status = status;
        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Commission.findAndCountAll({
            where,
            include: [{ model: User, as: 'fromUser', attributes: ['id', 'username', 'firstName', 'lastName'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getCommissionSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Helper for colors
        const getColorForType = (type) => {
            const colors = {
                DIRECT_REFERRAL: '#3b82f6',
                BINARY_PAIRING: '#8b5cf6',
                LEVEL_COMMISSION: '#10b981',
                RENTAL_INCOME: '#f59e0b',
                PROPERTY_APPRECIATION: '#ef4444',
                RANK_BONUS: '#ec4899',
                LEADERSHIP_BONUS: '#6366f1'
            };
            return colors[type] || '#64748b';
        };

        const [total, thisMonth, today, byTypeGroups] = await Promise.all([
            Commission.sum('amount', { where: { userId, status: { [Op.in]: ['EARNED', 'PAID', 'APPROVED'] } } }),
            Commission.sum('amount', { where: { userId, status: { [Op.in]: ['EARNED', 'PAID', 'APPROVED'] }, createdAt: { [Op.gte]: startOfMonth } } }),
            Commission.sum('amount', { where: { userId, status: { [Op.in]: ['EARNED', 'PAID', 'APPROVED'] }, createdAt: { [Op.gte]: startOfToday } } }),
            Commission.findAll({
                where: { userId, status: { [Op.in]: ['EARNED', 'PAID', 'APPROVED'] } },
                attributes: [
                    'commissionType',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['commissionType']
            })
        ]);

        const totalAmount = parseFloat(total || 0);

        const byType = byTypeGroups.map(g => {
            const type = g.commissionType;
            const amount = parseFloat(g.get('totalAmount'));
            const count = parseInt(g.get('count'));
            return {
                type,
                name: type.replace(/_/g, ' '),
                totalEarned: amount,
                thisMonth: 0, // Simplified for now
                count,
                color: getColorForType(type),
                icon: 'icon' // Frontend handles icons based on type usually, or we send a key
            };
        });

        const distribution = byType.map(t => ({
            name: t.name,
            amount: t.totalEarned,
            percentage: totalAmount > 0 ? (t.totalEarned / totalAmount) * 100 : 0,
            color: t.color
        }));

        res.json({
            success: true,
            data: {
                totalEarnings: totalAmount,
                thisMonth: parseFloat(thisMonth || 0),
                today: parseFloat(today || 0),
                byType,
                distribution,
                trend: []
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getCommissionTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 'MONTH' } = req.query; // Currently supporting MONTH (last 6 months)

        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const commissions = await Commission.findAll({
            where: {
                userId,
                status: { [Op.in]: ['EARNED', 'PAID', 'APPROVED'] },
                createdAt: { [Op.gte]: sixMonthsAgo }
            },
            attributes: [
                'commissionType',
                'amount',
                'createdAt'
            ],
            order: [['createdAt', 'ASC']]
        });

        // Group by month
        const trendsMap = {};

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            trendsMap[key] = {
                date: d.toISOString(),
                total: 0,
                direct: 0,
                binary: 0,
                level: 0,
                rental: 0,
                appreciation: 0,
                rank: 0,
                leadership: 0
            };
        }

        commissions.forEach(comm => {
            const d = new Date(comm.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (trendsMap[key]) {
                const amount = parseFloat(comm.amount);
                trendsMap[key].total += amount;

                switch (comm.commissionType) {
                    case 'DIRECT_REFERRAL': trendsMap[key].direct += amount; break;
                    case 'BINARY_PAIRING': trendsMap[key].binary += amount; break;
                    case 'LEVEL_COMMISSION': trendsMap[key].level += amount; break;
                    case 'RENTAL_INCOME': trendsMap[key].rental += amount; break;
                    case 'PROPERTY_APPRECIATION': trendsMap[key].appreciation += amount; break;
                    case 'RANK_BONUS': trendsMap[key].rank += amount; break;
                    case 'LEADERSHIP_BONUS': trendsMap[key].leadership += amount; break;
                }
            }
        });

        const trends = Object.values(trendsMap);

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getCommissionsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const commissions = await Commission.findAll({
            where: { userId: req.user.id, commissionType: type },
            include: [{ model: User, as: 'fromUser', attributes: ['id', 'username', 'firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                content: commissions, // Frontend might expect paginated structure or list
                totalElements: commissions.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.distributeCommission = async (req, res) => {
    try {
        const { username, amount, remarks } = req.body;
        const commissionService = require('../services/commission.service');

        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create a mock investment object
        const mockInvestment = {
            id: `MANUAL-${Date.now()}`,
            userId: user.id,
            investmentAmount: amount,
            totalPaid: amount,
            status: 'COMPLETED',
            remarks: remarks || 'Manual Distribution'
        };

        // Trigger Calculation
        await commissionService.calculateLevelCommission(mockInvestment);

        res.json({
            success: true,
            message: `Commission distribution triggered for ${username} on amount ₹${amount}`
        });

    } catch (error) {
        console.error('Manual Distribution Error:', error);
        res.status(500).json({ success: false, message: 'Distribution failed', error: error.message });
    }
};

