const { User, Wallet, Investment, Commission, Income, ActivityLog, Announcement } = require('../models');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await User.findOne({ where: { email: req.body.email } });
                if (emailExists) {
                    return res.status(400).json({ success: false, message: 'Email already in use' });
                }
                user.email = req.body.email;
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    phoneNumber: updatedUser.phoneNumber,
                    role: updatedUser.role
                }
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (user) {
            res.json({
                success: true,
                data: user
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (user && (await user.validatePassword(currentPassword))) {
            user.password = newPassword; // Will be hashed by hook
            await user.save();
            res.json({ success: true, message: 'Password updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid current password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


// Helper function to convert date to "time ago" format
const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return Math.floor(seconds) + ' seconds ago';
};

// Map activity action to type
const getActivityType = (action) => {
    const mapping = {
        'USER_REGISTERED': 'NEW_MEMBER',
        'INVESTMENT_MADE': 'INVESTMENT',
        'COMMISSION_EARNED': 'COMMISSION',
        'WITHDRAWAL_REQUESTED': 'PAYOUT',
        'RANK_UPGRADED': 'RANK_UPGRADE',
        'INSTALLMENT_PAID': 'INSTALLMENT_PAID',
        'PROPERTY_LAUNCHED': 'PROPERTY_LAUNCH'
    };
    return mapping[action] || 'NEW_MEMBER';
};

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { Op } = require('sequelize');
        const sequelize = require('../models').sequelize;

        // Safe wrapper to handle errors in individual queries
        const safeQuery = async (queryFn, defaultValue = null) => {
            try {
                return await queryFn();
            } catch (error) {
                console.error('Query error:', error.message);
                return defaultValue;
            }
        };

        // Parallelize queries for performance with error handling
        const [
            wallet,
            investmentsCount,
            totalInvestment,
            directReferralsCount,
            teamSize,
            user,
            recentActivities,
            todayCommissions,
            commissionBreakdown,
            earningsTrend,
            portfolioDistribution,
            teamGrowth,
            announcements
        ] = await Promise.all([
            // 1. Wallet Data
            safeQuery(() => Wallet.findOne({ where: { userId } })),

            // 2. Investment Stats
            safeQuery(() => Investment.count({ where: { userId, investmentStatus: 'ACTIVE' } }), 0),
            safeQuery(() => Investment.sum('investmentAmount', { where: { userId } }), 0),

            // 3. Team Stats
            safeQuery(() => User.count({ where: { sponsorId: userId } }), 0),
            safeQuery(async () => {
                try {
                    const query = `
                        WITH RECURSIVE downline AS (
                            SELECT id FROM users WHERE placement_user_id = :userId
                            UNION ALL
                            SELECT u.id FROM users u
                            INNER JOIN downline d ON u.placement_user_id = d.id
                        )
                        SELECT count(*) as count FROM downline;
                    `;
                    const result = await sequelize.query(query, {
                        replacements: { userId },
                        type: sequelize.QueryTypes.SELECT
                    });
                    return parseInt(result[0].count);
                } catch (e) {
                    console.error('Team size query error:', e);
                    return 0;
                }
            }, 0),

            // 4. User Details (for BV)
            safeQuery(() => User.findByPk(userId, { attributes: ['leftBv', 'rightBv', 'rank', 'referralCode'] })),

            // 5. Recent Activities
            safeQuery(() => ActivityLog.findAll({
                where: { userId },
                limit: 5,
                order: [['createdAt', 'DESC']]
            }), []),

            // 6. Today's Income
            safeQuery(() => Income.sum('amount', {
                where: {
                    userId,
                    createdAt: {
                        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }), 0),

            // 7. Commission Breakdown (Pie Chart)
            safeQuery(() => Income.findAll({
                attributes: [
                    'incomeType',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
                ],
                where: { userId },
                group: ['incomeType']
            }), []),

            // 8. Earnings Trend (Line Chart - Last 7 days)
            safeQuery(() => Income.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalEarnings'],
                    'incomeType'
                ],
                where: {
                    userId,
                    createdAt: {
                        [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at')), 'incomeType'],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
            }), []),

            // 9. Portfolio Distribution (Donut Chart)
            safeQuery(() => Investment.findAll({
                attributes: [
                    'propertyId',
                    [sequelize.fn('SUM', sequelize.col('investmentAmount')), 'totalInvested']
                ],
                where: { userId },
                group: ['propertyId']
            }), []),

            // 10. Team Growth (Bar Chart - Last 6 months) - Left/Right Leg
            safeQuery(async () => {
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                const leftLegData = await User.findAll({
                    attributes: [
                        [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM'), 'month'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    where: {
                        placementUserId: userId,
                        placementSide: 'LEFT',
                        createdAt: { [Op.gte]: sixMonthsAgo }
                    },
                    group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM')],
                    raw: true
                });

                const rightLegData = await User.findAll({
                    attributes: [
                        [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM'), 'month'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                    ],
                    where: {
                        placementUserId: userId,
                        placementSide: 'RIGHT',
                        createdAt: { [Op.gte]: sixMonthsAgo }
                    },
                    group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM')],
                    raw: true
                });

                return { leftLegData, rightLegData };
            }, { leftLegData: [], rightLegData: [] }),

            // 11. Announcements
            safeQuery(() => Announcement.findAll({
                where: {
                    isActive: true,
                    startDate: { [Op.lte]: new Date() },
                    endDate: { [Op.gte]: new Date() }
                },
                order: [['priority', 'DESC'], ['createdAt', 'DESC']],
                limit: 5
            }), [])
        ]);

        // Process Charts Data - Earnings Trend
        // Group by date and separate commission and ROI
        const earningsMap = {};
        earningsTrend.forEach(e => {
            const date = e.get('date');
            if (!earningsMap[date]) {
                earningsMap[date] = { date, totalEarnings: 0, commission: 0, roi: 0 };
            }
            const amount = parseFloat(e.get('totalEarnings')) || 0;
            const type = e.incomeType;

            earningsMap[date].totalEarnings += amount;

            if (type && type.toLowerCase().includes('commission')) {
                earningsMap[date].commission += amount;
            } else if (type && (type.toLowerCase().includes('roi') || type.toLowerCase().includes('rental'))) {
                earningsMap[date].roi += amount;
            }
        });
        const processedEarningsTrend = Object.values(earningsMap);

        const processedCommissionBreakdown = commissionBreakdown.map((c, index) => {
            const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
            return {
                type: c.incomeType,
                amount: parseFloat(c.get('totalAmount')),
                percentage: 0, // Calculate if needed
                color: colors[index % colors.length]
            };
        });

        const processedPortfolio = portfolioDistribution.map((p, index) => {
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899'];
            return {
                propertyType: `Property ${p.propertyId}`, // Placeholder name
                currentValue: parseFloat(p.get('totalInvested')), // Simplified
                invested: parseFloat(p.get('totalInvested')),
                count: 1,
                color: colors[index % colors.length]
            };
        });

        // Process Team Growth - Merge left and right leg data
        const teamGrowthMap = {};

        teamGrowth.leftLegData?.forEach(item => {
            const month = item.month;
            if (!teamGrowthMap[month]) {
                teamGrowthMap[month] = { month, leftLeg: 0, rightLeg: 0 };
            }
            teamGrowthMap[month].leftLeg = parseInt(item.count) || 0;
        });

        teamGrowth.rightLegData?.forEach(item => {
            const month = item.month;
            if (!teamGrowthMap[month]) {
                teamGrowthMap[month] = { month, leftLeg: 0, rightLeg: 0 };
            }
            teamGrowthMap[month].rightLeg = parseInt(item.count) || 0;
        });

        const processedTeamGrowth = Object.values(teamGrowthMap).sort((a, b) =>
            a.month.localeCompare(b.month)
        );

        // Process Activities
        const processedActivities = recentActivities.map(a => {
            const activityType = getActivityType(a.action);
            return {
                id: a.id,
                type: activityType,
                icon: activityType.toLowerCase(),
                description: a.description || a.action,
                amount: a.amount || null,
                timeAgo: getTimeAgo(a.createdAt),
                status: 'Completed',
                statusColor: 'success'
            };
        });

        // Process Announcements
        const processedAnnouncements = announcements.map(a => {
            const createdDate = a.createdAt || new Date();
            return {
                id: a.id,
                title: a.title,
                description: a.description,
                date: createdDate instanceof Date ? createdDate.toISOString().split('T')[0] : createdDate,
                link: a.link || null
            };
        });

        const dashboardData = {
            user: {
                fullName: `${req.user.firstName} ${req.user.lastName}`,
                userId: req.user.username, // Using username as ID for display
                rank: user?.rank || 'Associate',
                profilePicture: req.user.profilePhoto || req.user.profilePicture || null,
                rankIcon: null // Add if rank icons are implemented
            },
            stats: {
                totalInvestment: totalInvestment || 0,
                totalEarnings: wallet ? parseFloat(wallet.totalEarned) : 0,
                availableBalance: wallet ? (
                    parseFloat(wallet.commissionBalance || 0) +
                    parseFloat(wallet.roiBalance || 0) +
                    parseFloat(wallet.rentalIncomeBalance || 0)
                ) : 0,
                teamSize: teamSize || 0,
                activeProperties: investmentsCount || 0,
                todayIncome: todayCommissions || 0,
                currentRank: user?.rank || 'Associate',
                leftLeg: parseFloat(user?.leftBv || 0),
                rightLeg: parseFloat(user?.rightBv || 0),
                referralCode: user?.referralCode || '',
                nextRankProgress: 75 // Mock progress
            },
            charts: {
                earningsTrend: processedEarningsTrend,
                commissionBreakdown: processedCommissionBreakdown,
                portfolioDistribution: processedPortfolio,
                teamGrowth: processedTeamGrowth
            },
            recentActivities: processedActivities,
            announcements: processedAnnouncements
        };

        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getReferralLink = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Assuming frontend URL is in environment variables or hardcoded for now
        // In production, this should be configurable
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const referralLink = `${frontendUrl}/register?ref=${user.referralCode}`;

        res.json({
            success: true,
            data: {
                referralLink,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Session Management ====================

exports.getSessions = async (req, res) => {
    try {
        // TODO: Implement actual session management with Redis or database
        // For now, return empty array or current session
        const currentSession = {
            id: '1',
            deviceName: req.headers['user-agent'] || 'Unknown Device',
            browser: 'Browser',
            ipAddress: req.ip || 'Unknown',
            location: 'Unknown',
            lastActive: new Date().toISOString(),
            isCurrent: true,
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            data: [currentSession]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getLoginHistory = async (req, res) => {
    try {
        const { page = 0, size = 5 } = req.query;

        // TODO: Implement actual login history tracking
        // For now, return mock data
        const loginHistory = [
            {
                id: 1,
                deviceName: req.headers['user-agent'] || 'Unknown Device',
                browser: 'Browser',
                ipAddress: req.ip || 'Unknown',
                location: 'Unknown',
                status: 'success',
                timestamp: new Date().toISOString()
            }
        ];

        res.json({
            success: true,
            data: {
                content: loginHistory,
                totalElements: loginHistory.length,
                totalPages: 1,
                currentPage: parseInt(page),
                size: parseInt(size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        // Return default settings for now as we don't have a settings table/column yet
        const settings = {
            notifications: {
                email: true,
                sms: true,
                push: true,
                news: true,
                transactions: true
            },
            security: {
                twoFactorAuth: false,
                loginAlerts: true
            },
            appearance: {
                theme: 'system', // light, dark, system
                language: 'en'
            }
        };

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        // In a real app, save these to a UserSettings table or a JSON column in User table
        // For now, just acknowledge the update
        const { notifications, security, appearance } = req.body;

        res.json({
            success: true,
            data: {
                notifications: notifications || { email: true, sms: true, push: true },
                security: security || { twoFactorAuth: false },
                appearance: appearance || { theme: 'system' }
            },
            message: 'Settings updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
