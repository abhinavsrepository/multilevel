const { Income, User, Wallet, LevelCommissionRule, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get dashboard income stats
 */
/**
 * Get dashboard income stats
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get wallet data
        const wallet = await Wallet.findOne({
            where: { userId }
        });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found'
            });
        }

        // Helper to get sum for date range
        const getSum = async (startDate) => {
            return await Income.sum('amount', {
                where: {
                    userId,
                    status: 'APPROVED',
                    createdAt: { [Op.gte]: startDate }
                }
            }) || 0;
        };

        // Today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayIncome = await getSum(todayStart);

        // This Week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const thisWeekIncome = await getSum(weekStart);

        // This Month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const thisMonthIncome = await getSum(monthStart);

        // Get income by type (Grouped)
        const incomeByTypeRaw = await Income.findAll({
            attributes: [
                'incomeType',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                userId,
                status: 'APPROVED'
            },
            group: ['incomeType']
        });

        // Convert to Map { TYPE: Amount }
        const incomeByType = {};
        incomeByTypeRaw.forEach(item => {
            incomeByType[item.incomeType] = parseFloat(item.get('totalAmount'));
        });

        // Get level-wise income
        const levelIncomeRaw = await Income.findAll({
            attributes: [
                'level',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                userId,
                incomeType: 'LEVEL_COMMISSION',
                status: 'APPROVED',
                level: { [Op.not]: null }
            },
            group: ['level'],
            order: [['level', 'ASC']]
        });

        const levelWiseIncome = levelIncomeRaw.map(item => ({
            level: item.level,
            income: parseFloat(item.get('totalAmount'))
        }));

        res.json({
            success: true,
            data: {
                walletBalances: {
                    commissionBalance: parseFloat(wallet.commissionBalance),
                    levelProfitBalance: parseFloat(wallet.levelProfitBalance),
                    cashbackBalance: parseFloat(wallet.cashbackBalance),
                    repurchaseBalance: parseFloat(wallet.repurchaseBalance),
                    coinBalance: parseFloat(wallet.coinBalance),
                    dailyIncome: parseFloat(wallet.dailyIncome),
                    roiBalance: parseFloat(wallet.roiBalance)
                },
                totalIncome: parseFloat(wallet.totalEarned),
                availableBalance: parseFloat(wallet.commissionBalance), // redundant but keep for compat if needed
                totalEarnings: parseFloat(wallet.totalEarned),
                todayIncome: parseFloat(todayIncome),
                thisWeekIncome: parseFloat(thisWeekIncome),
                thisMonthIncome: parseFloat(thisMonthIncome),
                incomeByType,
                levelWiseIncome
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard statistics',
            error: error.message
        });
    }
};

/**
 * Get level overview with eligibility
 */
exports.getLevelOverview = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all level rules
        const levelRules = await LevelCommissionRule.findAll({
            where: { isActive: true },
            order: [['level', 'ASC']]
        });

        // Get user's team hierarchy
        const teamMembers = await User.findAll({
            attributes: ['id', 'level', 'status'],
            where: {
                sponsorId: userId,
                status: { [Op.in]: ['ACTIVE', 'INACTIVE'] }
            }
        });

        // Count members per level
        const levelCounts = {};
        const activeLevelCounts = {};

        teamMembers.forEach(member => {
            const memberLevel = member.level || 1;
            levelCounts[memberLevel] = (levelCounts[memberLevel] || 0) + 1;
            if (member.status === 'ACTIVE') {
                activeLevelCounts[memberLevel] = (activeLevelCounts[memberLevel] || 0) + 1;
            }
        });

        // Get income per level
        const levelIncomes = await Income.findAll({
            attributes: [
                'level',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                userId,
                incomeType: 'LEVEL_COMMISSION',
                status: 'APPROVED',
                level: { [Op.not]: null }
            },
            group: ['level']
        });

        const levelIncomeMap = {};
        levelIncomes.forEach(income => {
            levelIncomeMap[income.level] = parseFloat(income.get('totalAmount'));
        });

        // Build level overview
        const levelOverview = levelRules.map(rule => {
            const level = rule.level;
            const totalMembers = levelCounts[level] || 0;
            const activeMembers = activeLevelCounts[level] || 0;
            const totalIncome = levelIncomeMap[level] || 0;

            // Check eligibility
            const isEligible = totalMembers > 0;
            const eligibilityReason = !isEligible ? 'No team members at this level' : 'Eligible';

            return {
                level,
                commissionPercentage: parseFloat(rule.value),
                commissionType: rule.commissionType,
                requiredRank: rule.requiredRank,
                totalMembers,
                activeMembers,
                totalIncome,
                isEligible,
                eligibilityReason
            };
        });

        res.json({
            success: true,
            data: {
                levels: levelOverview,
                totalTeamMembers: teamMembers.length,
                totalActiveMembers: teamMembers.filter(m => m.status === 'ACTIVE').length
            }
        });
    } catch (error) {
        console.error('Get level overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve level overview',
            error: error.message
        });
    }
};

/**
 * Get income history
 */
exports.getIncomeHistory = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            incomeType,
            level,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { userId: req.user.id };

        if (incomeType) {
            where.incomeType = incomeType;
        }

        if (level) {
            where.level = level;
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { rows: incomes, count } = await Income.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'username', 'fullName']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                incomes,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get income history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve income history',
            error: error.message
        });
    }
};

/**
 * Get daily income breakdown
 */
exports.getDailyIncome = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const userId = req.user.id;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const dailyIncomes = await Income.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                'incomeType',
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
            ],
            where: {
                userId,
                status: 'APPROVED',
                createdAt: { [Op.gte]: startDate }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt')), 'incomeType'],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'DESC']]
        });

        // Group by date
        const grouped = {};
        dailyIncomes.forEach(income => {
            const date = income.get('date');
            if (!grouped[date]) {
                grouped[date] = {
                    date,
                    total: 0,
                    byType: {}
                };
            }
            const amount = parseFloat(income.get('totalAmount'));
            grouped[date].total += amount;
            grouped[date].byType[income.incomeType] = amount;
        });

        const result = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get daily income error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve daily income',
            error: error.message
        });
    }
};

/**
 * Get team hierarchy for level calculation
 */
exports.getTeamHierarchy = async (req, res) => {
    try {
        const userId = req.user.id;
        const { maxDepth = 10 } = req.query;

        // Recursive function to build team tree
        const buildTeamTree = async (sponsorId, currentDepth = 1) => {
            if (currentDepth > maxDepth) return [];

            const members = await User.findAll({
                attributes: ['id', 'username', 'fullName', 'email', 'status', 'createdAt'],
                where: { sponsorId },
                include: [
                    {
                        model: Wallet,
                        attributes: ['totalEarned', 'totalInvested']
                    }
                ]
            });

            const tree = await Promise.all(
                members.map(async (member) => {
                    const children = await buildTeamTree(member.id, currentDepth + 1);
                    return {
                        ...member.toJSON(),
                        level: currentDepth,
                        children
                    };
                })
            );

            return tree;
        };

        const teamTree = await buildTeamTree(userId);

        // Calculate totals
        const calculateTotals = (tree) => {
            let total = 0;
            let active = 0;

            tree.forEach(member => {
                total++;
                if (member.status === 'ACTIVE') active++;
                if (member.children.length > 0) {
                    const childTotals = calculateTotals(member.children);
                    total += childTotals.total;
                    active += childTotals.active;
                }
            });

            return { total, active };
        };

        const totals = calculateTotals(teamTree);

        res.json({
            success: true,
            data: {
                teamTree,
                totalMembers: totals.total,
                activeMembers: totals.active
            }
        });
    } catch (error) {
        console.error('Get team hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve team hierarchy',
            error: error.message
        });
    }
};
