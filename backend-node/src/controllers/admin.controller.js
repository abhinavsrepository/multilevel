const { User, Payout, KycDocument, Property, Investment, Commission, Wallet } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const pageNum = Math.max(1, parseInt(page)); // Ensure page is at least 1
        const offset = (pageNum - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { fullName: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Wallet,
                    as: 'wallet',
                    required: false
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Convert to plain object to avoid serialization issues
        const userData = user.toJSON();

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Get User By ID Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.update(req.body);
        res.json({ success: true, data: user, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.destroy();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { title, message, type } = req.body;
        await notificationService.sendNotification(user.id, title, message, type || 'INFO');

        res.json({ success: true, message: 'Notification sent successfully' });
    } catch (error) {
        console.error('Send Notification Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        console.log('createUser body:', req.body);
        let { username, email, password, firstName, lastName, fullName, phoneNumber, mobile, sponsorCode, placement, role, status } = req.body;
        console.log('Sponsor Code received:', sponsorCode, 'Type:', typeof sponsorCode);

        // Handle fullName: combine firstName + lastName if fullName not provided
        if (!fullName) {
            if (firstName && lastName) {
                fullName = `${firstName.trim()} ${lastName.trim()}`;
            } else if (firstName) {
                fullName = firstName.trim();
            } else if (lastName) {
                fullName = lastName.trim();
            } else {
                return res.status(400).json({ success: false, message: 'Either fullName or firstName/lastName is required' });
            }
        }

        // Handle mobile: use phoneNumber as fallback
        if (!mobile && phoneNumber) {
            mobile = phoneNumber;
        }

        // Validate required fields
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }
        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        // Generate User ID (EG + Sequential) if not provided
        if (!username) {
            let isUniqueId = false;
            while (!isUniqueId) {
                // Find the last user to get the next sequential number
                const lastUser = await User.findOne({
                    where: {
                        username: {
                            [Op.like]: 'EG%'
                        }
                    },
                    order: [['id', 'DESC']]
                });

                let nextNumber = 1;
                if (lastUser && lastUser.username) {
                    // Extract number from last username (EG0000001 -> 1)
                    const lastNumber = parseInt(lastUser.username.replace('EG', ''), 10);
                    nextNumber = lastNumber + 1;
                }

                // Format as EG + 7 digits with leading zeros (EG0000001)
                username = `EG${nextNumber.toString().padStart(7, '0')}`;

                // Double check uniqueness
                const existing = await User.findOne({ where: { username } });
                if (!existing) isUniqueId = true;
            }
        }

        // Check if user exists
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const mobileExists = await User.findOne({ where: { mobile } });
        if (mobileExists) {
            return res.status(400).json({ success: false, message: 'Mobile number already exists' });
        }

        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Validate sponsor if provided
        let sponsor = null;
        if (sponsorCode && sponsorCode.trim() !== '') {
            sponsor = await User.findOne({
                where: {
                    [Op.or]: [
                        { referralCode: sponsorCode.trim() },
                        { username: sponsorCode.trim() }
                    ]
                }
            });
            if (!sponsor) {
                return res.status(400).json({ success: false, message: 'Invalid sponsor code' });
            }
        }

        // Generate unique referral code
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
            referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await User.findOne({ where: { referralCode } });
            if (!existing) isUnique = true;
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            fullName,
            mobile,
            referralCode,
            sponsorId: sponsor ? sponsor.username : null,
            sponsorUserId: sponsor ? sponsor.id : null,
            placementUserId: sponsor ? sponsor.id : null,
            placement: placement ? placement.toUpperCase() : 'AUTO',
            role: role || 'MEMBER',
            status: status || 'ACTIVE',
            emailVerified: true, // Admin created users are verified by default
            phoneVerified: true
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.activateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await user.update({ status: 'ACTIVE' });
        await notificationService.sendNotification(user.id, 'Account Activated', 'Your account has been activated.', 'ACCOUNT');

        res.json({ success: true, message: 'User activated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.blockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await user.update({ status: 'SUSPENDED' }); // Mapping BLOCKED to SUSPENDED enum
        await notificationService.sendNotification(user.id, 'Account Suspended', 'Your account has been suspended.', 'ACCOUNT');

        res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        const sequelize = require('../models').sequelize;
        const models = require('../models');
        const ActivityLog = models.ActivityLog || null;
        const Income = models.Income || null;

        // Calculate date ranges
        const today = new Date();
        const todayStart = new Date(today.setHours(0, 0, 0, 0));
        const todayEnd = new Date(today.setHours(23, 59, 59, 999));

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

        // Parallel queries for better performance
        const [
            totalUsers,
            activeUsers,
            todayRegistrations,
            lastMonthUsers,
            twoMonthsAgoUsers,
            totalProperties,
            activeProperties,
            totalInvestments,
            todayInvestments,
            lastMonthInvestments,
            pendingPayoutsCount,
            pendingPayoutsAmount,
            pendingKyc,
            commissionsPaid,
            registrationTrend,
            investmentTrend,
            commissionBreakdown,
            topPerformers,
            recentActivityLogs
        ] = await Promise.all([
            // User stats
            User.count(),
            User.count({ where: { status: 'ACTIVE' } }),
            User.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
            User.count({ where: { createdAt: { [Op.gte]: lastMonth } } }),
            User.count({ where: { createdAt: { [Op.gte]: twoMonthsAgo, [Op.lt]: lastMonth } } }),

            // Property stats
            Property.count(),
            Property.count({ where: { status: 'ACTIVE' } }),

            // Investment stats
            Investment.sum('investmentAmount') || 0,
            Investment.sum('investmentAmount', { where: { createdAt: { [Op.gte]: todayStart } } }) || 0,
            Investment.sum('investmentAmount', { where: { createdAt: { [Op.gte]: lastMonth } } }) || 0,

            // Payout stats
            Payout.count({ where: { status: 'REQUESTED' } }),
            Payout.sum('requestedAmount', { where: { status: 'REQUESTED' } }) || 0,

            // KYC stats
            KycDocument.count({ where: { status: 'PENDING' } }),

            // Commission stats
            Commission.sum('amount') || 0,

            // Chart 1: Registration Trend (Last 30 days)
            User.findAll({
                attributes: [
                    [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD'), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'value']
                ],
                where: {
                    createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD')],
                order: [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD'), 'ASC']],
                raw: true
            }).catch(() => []),

            // Chart 2: Investment Trend (Last 30 days)
            Investment.findAll({
                attributes: [
                    [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD'), 'date'],
                    [sequelize.fn('SUM', sequelize.col('investment_amount')), 'value']
                ],
                where: {
                    createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                },
                group: [sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD')],
                order: [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), 'YYYY-MM-DD'), 'ASC']],
                raw: true
            }).catch(() => []),

            // Chart 3: Commission Distribution by Type
            Income ? Income.findAll({
                attributes: [
                    'incomeType',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'value']
                ],
                group: ['incomeType'],
                raw: true
            }).catch(() => []) : Promise.resolve([]),

            // Chart 4: Top Performers (by total investment)
            sequelize.query(`
                SELECT
                    u.username as name,
                    u.id as "userId",
                    COALESCE(SUM(i.investment_amount), 0) as value,
                    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(i.investment_amount), 0) DESC) as rank
                FROM users u
                LEFT JOIN investments i ON u.id = i.user_id
                GROUP BY u.id, u.username
                ORDER BY value DESC
                LIMIT 5
            `, { type: sequelize.QueryTypes.SELECT }).catch(() => []),

            // Recent Activities (Last 10)
            ActivityLog ? ActivityLog.findAll({
                limit: 10,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'firstName', 'lastName'],
                    required: false
                }]
            }).catch(() => []) : Promise.resolve([])
        ]);

        // Calculate growth percentages safely
        const userGrowth = twoMonthsAgoUsers > 0
            ? parseFloat(((lastMonthUsers - twoMonthsAgoUsers) / twoMonthsAgoUsers * 100).toFixed(1))
            : 0;

        const investmentGrowthValue = totalInvestments > lastMonthInvestments && lastMonthInvestments > 0
            ? parseFloat(((lastMonthInvestments / (totalInvestments - lastMonthInvestments)) * 100).toFixed(1))
            : 0;

        // Process commission breakdown to match frontend interface
        const processedCommissionBreakdown = (commissionBreakdown || []).map(item => ({
            category: item.incomeType || 'Other',
            value: parseFloat(item.value) || 0
        }));

        // Add default categories if empty
        if (processedCommissionBreakdown.length === 0) {
            processedCommissionBreakdown.push(
                { category: 'Direct Bonus', value: 0 },
                { category: 'Level Bonus', value: 0 },
                { category: 'Matching Bonus', value: 0 }
            );
        }

        // Process top performers
        const processedTopPerformers = (topPerformers || []).map(item => ({
            name: item.name || 'Unknown',
            value: parseFloat(item.value) || 0,
            rank: parseInt(item.rank) || 0,
            userId: item.userId || item.id
        }));

        // Process recent activities
        const processedActivities = (recentActivityLogs || []).map(activity => ({
            id: activity.id,
            timestamp: activity.createdAt || new Date().toISOString(),
            activityType: activity.action || 'ACTIVITY',
            user: {
                userId: activity.user?.username || 'Unknown',
                fullName: activity.user ? `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim() : 'Unknown User'
            },
            amount: activity.amount || null,
            status: activity.status || 'SUCCESS',
            description: activity.description || activity.action || 'Activity'
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    todayRegistrations,
                    totalInvestment: parseFloat(totalInvestments),
                    todayInvestment: parseFloat(todayInvestments),
                    activeProperties,
                    totalProperties,
                    pendingPayouts: {
                        count: pendingPayoutsCount,
                        amount: parseFloat(pendingPayoutsAmount)
                    },
                    commissionsPaid: parseFloat(commissionsPaid) || 0,
                    pendingKYC: pendingKyc || 0,
                    activeTickets: 0,
                    userGrowth: userGrowth,
                    investmentGrowth: investmentGrowthValue
                },
                charts: {
                    registrationTrend: (registrationTrend || []).map(item => ({
                        date: item.date || new Date().toISOString().split('T')[0],
                        value: parseInt(item.value) || 0
                    })),
                    investmentTrend: (investmentTrend || []).map(item => ({
                        date: item.date || new Date().toISOString().split('T')[0],
                        value: parseFloat(item.value) || 0
                    })),
                    commissionDistribution: processedCommissionBreakdown,
                    topPerformers: processedTopPerformers,
                    propertyStatus: [],
                    revenueByType: [],
                    monthlyComparison: []
                },
                recentActivities: processedActivities
            }
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.approvePayout = async (req, res) => {
    try {
        const payout = await Payout.findOne({ where: { payoutId: req.params.payoutId } });
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        if (payout.status !== 'REQUESTED') {
            return res.status(400).json({ success: false, message: 'Payout already processed' });
        }

        await payout.update({
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: req.user.username
        });

        const user = await User.findByPk(payout.userId);
        await notificationService.sendPayoutStatusEmail(user, 'APPROVED', payout.requestedAmount);

        res.json({ success: true, message: 'Payout approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.rejectPayout = async (req, res) => {
    try {
        const { reason } = req.body;
        const payout = await Payout.findOne({ where: { payoutId: req.params.payoutId } });
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        if (payout.status !== 'REQUESTED') {
            return res.status(400).json({ success: false, message: 'Payout already processed' });
        }

        await payout.update({
            status: 'REJECTED',
            rejectionReason: reason,
            processedAt: new Date(),
            processedBy: req.user.username
        });

        // Refund to wallet
        const wallet = await Wallet.findOne({ where: { userId: payout.userId } });
        if (wallet) {
            await wallet.increment('commissionBalance', { by: payout.requestedAmount }); // Assuming refund to commission balance
            await wallet.decrement('totalWithdrawn', { by: payout.requestedAmount });
        }

        const user = await User.findByPk(payout.userId);
        await notificationService.sendPayoutStatusEmail(user, 'REJECTED', payout.requestedAmount);

        res.json({ success: true, message: 'Payout rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPendingKyc = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await KycDocument.findAndCountAll({
            where: { status: 'PENDING' },
            include: [{ model: User, attributes: ['id', 'username', 'firstName', 'lastName'] }],
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

exports.approveKyc = async (req, res) => {
    try {
        const kyc = await KycDocument.findByPk(req.params.id);
        if (!kyc) return res.status(404).json({ success: false, message: 'KYC document not found' });

        if (kyc.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'KYC already processed' });
        }

        await kyc.update({
            status: 'APPROVED',
            verifiedAt: new Date(),
            verifiedBy: req.user.username
        });

        // Update user status if needed (simplified)
        const user = await User.findByPk(kyc.userId);
        await user.update({ kycStatus: 'APPROVED', kycLevel: 'FULL' }); // Assuming full approval

        await notificationService.sendKycStatusEmail(user, 'APPROVED');

        res.json({ success: true, message: 'KYC approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.rejectKyc = async (req, res) => {
    try {
        const { reason } = req.body;
        const kyc = await KycDocument.findByPk(req.params.id);
        if (!kyc) return res.status(404).json({ success: false, message: 'KYC document not found' });

        if (kyc.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'KYC already processed' });
        }

        await kyc.update({
            status: 'REJECTED',
            rejectionReason: reason,
            verifiedAt: new Date(),
            verifiedBy: req.user.username
        });

        const user = await User.findByPk(kyc.userId);
        await user.update({ kycStatus: 'REJECTED' });

        await notificationService.sendKycStatusEmail(user, 'REJECTED');

        res.json({ success: true, message: 'KYC rejected successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        await user.update({ status: 'ACTIVE' });
        await notificationService.sendNotification(user.id, 'Account Unblocked', 'Your account has been unblocked.', 'ACCOUNT');

        res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({ password: hashedPassword });
        await notificationService.sendNotification(user.id, 'Password Reset', 'Your password has been reset by admin.', 'SECURITY');

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.bulkActivate = async (req, res) => {
    try {
        const { userIds } = req.body;
        await User.update({ status: 'ACTIVE' }, { where: { id: userIds } });
        res.json({ success: true, message: 'Users activated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.bulkBlock = async (req, res) => {
    try {
        const { userIds } = req.body;
        await User.update({ status: 'SUSPENDED' }, { where: { id: userIds } });
        res.json({ success: true, message: 'Users blocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.bulkDelete = async (req, res) => {
    try {
        const { userIds } = req.body;
        await User.destroy({ where: { id: userIds } });
        res.json({ success: true, message: 'Users deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.exportUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        const fields = ['id', 'username', 'email', 'firstName', 'lastName', 'status', 'createdAt'];
        const csv = [
            fields.join(','),
            ...users.map(user => fields.map(field => user[field]).join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('users.csv');
        res.send(csv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getUserActivityLogs = async (req, res) => {
    res.json({ success: true, data: [] });
};

exports.getUserInvestments = async (req, res) => {
    try {
        const investments = await Investment.findAll({ where: { userId: req.params.id } });
        res.json({ success: true, data: investments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserCommissions = async (req, res) => {
    try {
        const commissions = await Commission.findAll({ where: { userId: req.params.id } });
        res.json({ success: true, data: commissions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserPayouts = async (req, res) => {
    try {
        const payouts = await Payout.findAll({ where: { userId: req.params.id } });
        res.json({ success: true, data: payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserTickets = async (req, res) => {
    res.json({ success: true, data: [] });
};

// Manual Commission Distribution
exports.addManualCommission = async (req, res) => {
    try {
        const { userId, propertyId, amount, type, description } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const commission = await Commission.create({
            userId,
            commissionId: `MANUAL-${Date.now()}`,
            commissionType: type || 'MANUAL_ADJUSTMENT',
            level: 0,
            amount,
            propertyId: propertyId || null,
            description: description || 'Manual commission adjustment by admin',
            status: 'CREDITED',
            createdBy: req.user.username
        });

        // Credit to Wallet
        const wallet = await Wallet.findOne({ where: { userId } });
        if (wallet) {
            await wallet.increment('commissionBalance', { by: amount });
            await wallet.increment('totalCommission', { by: amount });
        }

        res.json({ success: true, message: 'Manual commission added successfully', data: commission });
    } catch (error) {
        console.error('Manual Commission Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPendingPayouts = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Payout.findAndCountAll({
            where: { status: 'REQUESTED' },
            include: [{ model: User, attributes: ['id', 'username', 'firstName', 'lastName'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['requestedAt', 'DESC']]
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
