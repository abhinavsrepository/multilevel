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
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
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

exports.createUser = async (req, res) => {
    try {
        console.log('createUser body:', req.body);
        let { username, email, password, firstName, lastName, phoneNumber, sponsorCode, placement, role, status } = req.body;
        console.log('Sponsor Code received:', sponsorCode, 'Type:', typeof sponsorCode);

        // Generate username from email if not provided
        if (!username && email) {
            username = email.split('@')[0];
            // Ensure uniqueness by appending random number if needed (simplified for now)
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                username = `${username}${Math.floor(Math.random() * 1000)}`;
            }
        }

        // Check if user exists
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // Validate sponsor if provided
        let sponsor = null;
        if (sponsorCode && sponsorCode.trim() !== '') {
            sponsor = await User.findOne({ where: { referralCode: sponsorCode.trim() } });
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
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            phoneNumber,
            referralCode,
            sponsorId: sponsor ? sponsor.id : null,
            placementUserId: sponsor ? sponsor.id : null,
            placement: placement || 'AUTO',
            role: role || 'USER',
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
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'ACTIVE' } });
        const totalProperties = await Property.count();
        const totalInvestments = await Investment.sum('investmentAmount') || 0;
        const pendingPayoutsCount = await Payout.count({ where: { status: 'REQUESTED' } });
        const pendingPayoutsAmount = await Payout.sum('requestedAmount', { where: { status: 'REQUESTED' } }) || 0;
        const pendingKyc = await KycDocument.count({ where: { status: 'PENDING' } });
        const commissionsPaid = await Commission.sum('amount') || 0;

        // Mock chart data for now
        const charts = {
            registrationTrend: [
                { date: '2023-01', value: 10 },
                { date: '2023-02', value: 20 },
                { date: '2023-03', value: 15 },
                { date: '2023-04', value: 30 },
                { date: '2023-05', value: 50 },
            ],
            investmentTrend: [
                { date: '2023-01', value: 1000 },
                { date: '2023-02', value: 2000 },
                { date: '2023-03', value: 1500 },
                { date: '2023-04', value: 3000 },
                { date: '2023-05', value: 5000 },
            ],
            commissionDistribution: [
                { category: 'Direct', value: 40 },
                { category: 'Binary', value: 30 },
                { category: 'Unilevel', value: 20 },
                { category: 'Bonus', value: 10 },
            ],
            topPerformers: [
                { name: 'User A', value: 10000 },
                { name: 'User B', value: 8000 },
                { name: 'User C', value: 6000 },
                { name: 'User D', value: 4000 },
                { name: 'User E', value: 2000 },
            ]
        };

        const recentActivities = []; // Populate with real logs if available

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    activeUsers,
                    userGrowth: 5, // Mock
                    todayRegistrations: 2, // Mock
                    totalProperties,
                    activeProperties: totalProperties, // Mock
                    totalInvestment: totalInvestments,
                    investmentGrowth: 10, // Mock
                    todayInvestment: 500, // Mock
                    pendingPayouts: {
                        count: pendingPayoutsCount,
                        amount: pendingPayoutsAmount
                    },
                    commissionsPaid,
                    pendingKYC: pendingKyc
                },
                charts,
                recentActivities
            }
        });
    } catch (error) {
        console.error(error);
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
        await user.update({ kycStatus: 'FULL', kycLevel: 'FULL' }); // Assuming full approval

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
