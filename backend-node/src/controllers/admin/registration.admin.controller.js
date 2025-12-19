const { User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Get all registrations with filters
 * GET /api/registrations/admin
 */
exports.getAllRegistrations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, status, kycStatus, startDate, endDate, sponsorId } = req.query;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phoneNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        if (kycStatus) {
            whereClause.kycStatus = kycStatus;
        }

        if (sponsorId) {
            whereClause.sponsorId = sponsorId;
        }

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'sponsorId', 'placementUserId', 'placement', 'rank', 'status',
                'kycStatus', 'emailVerified', 'phoneVerified', 'createdAt', 'profilePhotoUrl'
            ],
            include: [
                {
                    model: User,
                    as: 'Sponsor',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'PlacementUser',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const data = rows.map(user => ({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            sponsor: user.Sponsor ? {
                id: user.Sponsor.id,
                username: user.Sponsor.username,
                name: `${user.Sponsor.firstName} ${user.Sponsor.lastName}`
            } : null,
            placementUser: user.PlacementUser ? {
                id: user.PlacementUser.id,
                username: user.PlacementUser.username,
                name: `${user.PlacementUser.firstName} ${user.PlacementUser.lastName}`
            } : null,
            placement: user.placement,
            rank: user.rank,
            status: user.status,
            kycStatus: user.kycStatus,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            registrationDate: user.createdAt,
            profilePicture: user.profilePhotoUrl
        }));

        // Get statistics
        const totalRegistrations = count;
        const activeUsers = await User.count({ where: { ...whereClause, status: 'ACTIVE' } });
        const pendingKYC = await User.count({ where: { ...whereClause, kycStatus: 'PENDING' } });
        const verifiedEmail = await User.count({ where: { ...whereClause, emailVerified: true } });

        res.json({
            success: true,
            data: data,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                pages: Math.ceil(count / limit)
            },
            stats: {
                total: totalRegistrations,
                active: activeUsers,
                inactive: totalRegistrations - activeUsers,
                pendingKYC: pendingKYC,
                verifiedEmail: verifiedEmail
            }
        });
    } catch (error) {
        console.error('Error in getAllRegistrations:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get registration by ID
 * GET /api/registrations/admin/:id
 */
exports.getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'Sponsor',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email']
                },
                {
                    model: User,
                    as: 'PlacementUser',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get additional stats
        const directReferrals = await User.count({ where: { sponsorId: id } });

        res.json({
            success: true,
            data: {
                ...user.toJSON(),
                directReferralsCount: directReferrals,
                password: undefined // Remove password from response
            }
        });
    } catch (error) {
        console.error('Error in getRegistrationById:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Create new registration (Admin)
 * POST /api/registrations/admin
 */
exports.createRegistration = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            sponsorId,
            placementUserId,
            placement,
            dateOfBirth,
            fatherHusbandName,
            panNumber,
            cityState,
            address,
            addressProof,
            addressProofNo,
            pinCode
        } = req.body;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, first name, and last name are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.username === username
                    ? 'Username already exists'
                    : 'Email already exists'
            });
        }

        // Generate referral code
        const referralCode = `REF${Date.now()}${Math.random().toString(36).substring(7).toUpperCase()}`;

        // Create user
        const newUser = await User.create({
            username,
            email,
            password, // Will be hashed by beforeCreate hook
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            phoneNumber,
            sponsorId: sponsorId || null,
            placementUserId: placementUserId || null,
            placement: placement || null,
            referralCode,
            dateOfBirth,
            fatherHusbandName,
            panNumber,
            cityState,
            address,
            addressProof,
            addressProofNo,
            pinCode
        });

        res.status(201).json({
            success: true,
            message: 'Registration created successfully',
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                referralCode: newUser.referralCode
            }
        });
    } catch (error) {
        console.error('Error in createRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Update registration
 * PUT /api/registrations/admin/:id
 */
exports.updateRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated via this endpoint
        delete updateData.password;
        delete updateData.referralCode;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update(updateData);

        res.json({
            success: true,
            message: 'Registration updated successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in updateRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Delete registration
 * DELETE /api/registrations/admin/:id
 */
exports.deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user has downline
        const hasDownline = await User.count({ where: { sponsorId: id } });

        if (hasDownline > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user with existing downline members'
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'Registration deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Approve registration
 * POST /api/registrations/admin/:id/approve
 */
exports.approveRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({
            status: 'ACTIVE',
            emailVerified: true
        });

        res.json({
            success: true,
            message: 'Registration approved successfully'
        });
    } catch (error) {
        console.error('Error in approveRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Reject registration
 * POST /api/registrations/admin/:id/reject
 */
exports.rejectRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.update({
            status: 'SUSPENDED'
        });

        res.json({
            success: true,
            message: 'Registration rejected successfully'
        });
    } catch (error) {
        console.error('Error in rejectRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get registration statistics
 * GET /api/registrations/admin/stats
 */
exports.getRegistrationStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'ACTIVE' } });
        const inactiveUsers = await User.count({ where: { status: 'INACTIVE' } });
        const suspendedUsers = await User.count({ where: { status: 'SUSPENDED' } });
        const verifiedEmail = await User.count({ where: { emailVerified: true } });
        const verifiedPhone = await User.count({ where: { phoneVerified: true } });
        const pendingKYC = await User.count({ where: { kycStatus: 'PENDING' } });
        const approvedKYC = await User.count({ where: { kycStatus: 'APPROVED' } });

        // Get registrations by month (last 6 months)
        let monthlyRegistrations = [];
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            monthlyRegistrations = await User.findAll({
                attributes: [
                    [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    createdAt: { [Op.gte]: sixMonthsAgo }
                },
                group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
                raw: true
            });
        } catch (monthlyError) {
            console.error('Error fetching monthly registrations (continuing without it):', monthlyError);
            // Continue without monthly data if there's an error
            monthlyRegistrations = [];
        }

        res.json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                suspended: suspendedUsers,
                verifiedEmail: verifiedEmail,
                verifiedPhone: verifiedPhone,
                pendingKYC: pendingKYC,
                approvedKYC: approvedKYC,
                monthlyTrend: monthlyRegistrations
            }
        });
    } catch (error) {
        console.error('Error in getRegistrationStats:', error);
        console.error('Error stack:', error.stack);
        console.error('Error details:', JSON.stringify(error, null, 2));
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Export registrations
 * GET /api/registrations/admin/export
 */
exports.exportRegistrations = async (req, res) => {
    try {
        const { status, kycStatus, startDate, endDate } = req.query;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (kycStatus) {
            whereClause.kycStatus = kycStatus;
        }

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'status', 'kycStatus', 'emailVerified', 'phoneVerified', 'createdAt'
            ],
            include: [
                {
                    model: User,
                    as: 'Sponsor',
                    attributes: ['username', 'firstName', 'lastName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const exportData = users.map(user => ({
            'User ID': user.id,
            'Username': user.username,
            'Full Name': `${user.firstName} ${user.lastName}`,
            'Email': user.email,
            'Phone': user.phoneNumber,
            'Rank': user.rank,
            'Status': user.status,
            'KYC Status': user.kycStatus,
            'Email Verified': user.emailVerified ? 'Yes' : 'No',
            'Phone Verified': user.phoneVerified ? 'Yes' : 'No',
            'Registration Date': user.createdAt,
            'Sponsor': user.Sponsor ? `${user.Sponsor.firstName} ${user.Sponsor.lastName} (${user.Sponsor.username})` : 'N/A'
        }));

        res.json({
            success: true,
            data: exportData,
            count: exportData.length
        });
    } catch (error) {
        console.error('Error in exportRegistrations:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
