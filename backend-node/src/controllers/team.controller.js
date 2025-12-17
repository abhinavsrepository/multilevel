const { User, Investment, Commission, Topup, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to get all descendant IDs (Unilevel)
const getDescendantIds = async (userId) => {
    let descendants = [];
    let queue = [userId];
    // Safety break to prevent infinite loops
    let loops = 0;
    const MAX_LOOPS = 10000;

    while (queue.length > 0 && loops < MAX_LOOPS) {
        const currentId = queue.shift();
        const directReports = await User.findAll({
            where: { sponsorUserId: currentId },
            attributes: ['id']
        });

        if (directReports.length > 0) {
            const ids = directReports.map(u => u.id);
            descendants = [...descendants, ...ids];
            queue = [...queue, ...ids];
        }
        loops++;
    }
    return descendants;
};

// Helper to get all descendant IDs with metadata (Unilevel)
const getDescendantMap = async (userId) => {
    const descendantMap = new Map(); // userId -> depth
    let currentLevelIds = [userId];
    let level = 1;
    const MAX_LEVELS = 20; // Safety limit

    while (currentLevelIds.length > 0 && level <= MAX_LEVELS) {
        const directReports = await User.findAll({
            where: { sponsorUserId: { [Op.in]: currentLevelIds } },
            attributes: ['id']
        });

        if (directReports.length === 0) break;

        const nextLevelIds = [];
        for (const user of directReports) {
            descendantMap.set(user.id, level);
            nextLevelIds.push(user.id);
        }

        currentLevelIds = nextLevelIds;
        level++;
    }
    return descendantMap;
};

exports.getTeamMembers = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Filters
        const { status, search, rank, level, dateFrom, dateTo, sortBy = 'createdAt', sortDirection = 'DESC' } = req.query;

        // 1. Get Downline IDs and Depths
        const descendantMap = await getDescendantMap(userId);

        if (descendantMap.size === 0) {
            return res.json({
                success: true,
                data: { content: [], total: 0, page, limit }
            });
        }

        let eligibleIds = Array.from(descendantMap.keys());

        // 2. Filter by Level (if requested)
        if (level) {
            const targetLevel = parseInt(level);
            eligibleIds = eligibleIds.filter(id => descendantMap.get(id) === targetLevel);
        }

        if (eligibleIds.length === 0) {
            return res.json({
                success: true,
                data: { content: [], total: 0, page, limit }
            });
        }

        // 3. Build Query
        const whereClause = {
            id: { [Op.in]: eligibleIds }
        };

        if (status && status !== 'ALL') {
            whereClause.status = status;
        }

        if (rank && rank !== 'ALL') {
            whereClause.rank = rank;
        }

        if (dateFrom && dateTo) {
            whereClause.createdAt = {
                [Op.between]: [new Date(dateFrom), new Date(dateTo)]
            };
        }

        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // 4. Fetch Users with Pagination
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'createdAt', 'status', 'profilePhotoUrl', 'personalBv', 'sponsorId'
            ],
            include: [
                {
                    model: User,
                    as: 'Sponsor',
                    attributes: ['id', 'username', 'firstName', 'lastName'] // For Sponsor Name
                }
            ],
            limit: limit,
            offset: offset,
            order: [[sortBy, sortDirection]]
        });

        // 5. Enrich Data (RSV, etc.)
        const members = await Promise.all(rows.map(async (user) => {
            // Calculate Referral Sales Volume (RSV) - Total Investment by this user
            const rsv = await Investment.sum('investmentAmount', {
                where: { userId: user.id }
            }) || 0;

            return {
                id: user.id,
                userId: user.username, // Display ID
                name: `${user.firstName} ${user.lastName}`,
                sponsorId: user.Sponsor ? user.Sponsor.username : 'N/A',
                sponsorName: user.Sponsor ? `${user.Sponsor.firstName} ${user.Sponsor.lastName}` : 'N/A',
                depthLevel: descendantMap.get(user.id), // Identify depth level
                rank: user.rank,
                joiningDate: user.createdAt,
                status: user.status,
                rsv: parseFloat(rsv.toFixed(2)), // Referral Sales Volume
                mobile: user.phoneNumber,
                email: user.email,
                profilePicture: user.profilePhotoUrl
            };
        }));

        res.json({
            success: true,
            data: {
                content: members,
                total: count,
                page,
                limit
            }
        });
    } catch (error) {
        console.error('Error in getTeamMembers:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTeamStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const descendantIds = await getDescendantIds(userId);

        const total = descendantIds.length;

        const direct = await User.count({
            where: { sponsorUserId: userId }
        });

        const active = await User.count({
            where: {
                id: { [Op.in]: descendantIds },
                status: 'ACTIVE'
            }
        });

        const inactive = total - active;

        const totalInvestmentResult = await Investment.sum('investmentAmount', {
            where: {
                userId: { [Op.in]: descendantIds }
            }
        });

        const totalBVResult = await User.sum('personalBv', {
            where: {
                id: { [Op.in]: descendantIds }
            }
        });

        res.json({
            success: true,
            data: {
                total,
                direct,
                active,
                inactive,
                totalInvestment: totalInvestmentResult || 0,
                totalBV: totalBVResult || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Helper to build unilevel tree recursively
const buildUnilevelTree = async (userId, currentDepth, maxDepth) => {
    if (currentDepth > maxDepth) return null;

    const user = await User.findByPk(userId, {
        attributes: [
            'id', 'username', 'firstName', 'lastName', 'rank', 'status', 'createdAt', 'personalBv', 'teamBv',
            [sequelize.literal('(SELECT COALESCE(SUM("investmentAmount"), 0) FROM "Investments" WHERE "Investments"."userId" = "User"."id")'), 'totalInvestment']
        ]
    });

    if (!user) return null;

    const directReferrals = await User.findAll({
        where: { sponsorUserId: userId },
        attributes: ['id']
    });

    const children = [];
    for (const referral of directReferrals) {
        const childNode = await buildUnilevelTree(referral.id, currentDepth + 1, maxDepth);
        if (childNode) {
            children.push(childNode);
        }
    }

    return {
        id: user.id,
        userId: user.username,
        name: `${user.firstName} ${user.lastName}`,
        rank: user.rank,
        status: user.status,
        joiningDate: user.createdAt,
        totalInvestment: parseFloat(user.getDataValue('totalInvestment')) || 0,
        bv: {
            personal: user.personalBv || 0,
            team: user.teamBv || 0,
            total: (user.personalBv || 0) + (user.teamBv || 0)
        },
        teamSize: children.length, // Direct children count for tree node
        children: children
    };
};

exports.getUnilevelTree = async (req, res) => {
    try {
        let targetUserId = req.user.id;

        if (req.query.userId) {
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: req.query.userId },
                        { id: req.query.userId }
                    ]
                }
            });

            if (user) {
                // Security check: ensure target is downline
                const descendantIds = await getDescendantIds(req.user.id);
                if (user.id !== req.user.id && !descendantIds.includes(user.id) && req.user.role !== 'ADMIN') {
                    return res.status(403).json({ success: false, message: 'Access denied' });
                }
                targetUserId = user.id;
            } else {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        }

        const maxLevels = parseInt(req.query.maxLevels) || 3;
        const tree = await buildUnilevelTree(targetUserId, 1, Math.min(maxLevels, 5));

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getLevelBreakdown = async (req, res) => {
    try {
        const userId = req.user.id;
        const levels = [];
        let currentLevelIds = [userId];
        let level = 1;
        const MAX_LEVELS = 10; // Limit for performance

        while (currentLevelIds.length > 0 && level <= MAX_LEVELS) {
            const nextLevelUsers = await User.findAll({
                where: { sponsorUserId: { [Op.in]: currentLevelIds } },
                attributes: ['id', 'status', 'personalBv', 'teamBv']
            });

            if (nextLevelUsers.length === 0) break;

            const activeCount = nextLevelUsers.filter(u => u.status === 'ACTIVE').length;

            const totalInvestment = await Investment.sum('investmentAmount', {
                where: { userId: { [Op.in]: nextLevelUsers.map(u => u.id) } }
            });

            const totalBv = nextLevelUsers.reduce((sum, u) => sum + (u.personalBv || 0), 0);

            levels.push({
                level: level,
                members: nextLevelUsers.length,
                active: activeCount,
                investment: totalInvestment || 0,
                bv: totalBv
            });

            currentLevelIds = nextLevelUsers.map(u => u.id);
            level++;
        }

        res.json({
            success: true,
            data: levels
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTeamReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Team Summary
        const descendantIds = await getDescendantIds(userId);
        const totalMembers = descendantIds.length;

        // Level Breakdown (Reuse logic)
        const levels = [];
        let currentLevelIds = [userId];
        let level = 1;
        const MAX_LEVELS = 10;

        while (currentLevelIds.length > 0 && level <= MAX_LEVELS) {
            const nextLevelUsers = await User.findAll({
                where: { sponsorUserId: { [Op.in]: currentLevelIds } },
                attributes: ['id', 'status', 'personalBv']
            });

            if (nextLevelUsers.length === 0) break;

            const activeCount = nextLevelUsers.filter(u => u.status === 'ACTIVE').length;

            const totalInvestment = await Investment.sum('investmentAmount', {
                where: { userId: { [Op.in]: nextLevelUsers.map(u => u.id) } }
            });

            const totalBv = nextLevelUsers.reduce((sum, u) => sum + (u.personalBv || 0), 0);

            levels.push({
                level: level,
                members: nextLevelUsers.length,
                active: activeCount,
                investment: totalInvestment || 0,
                bv: totalBv
            });

            currentLevelIds = nextLevelUsers.map(u => u.id);
            level++;
        }

        // Top Performers
        const topByInvestment = await User.findAll({
            where: { id: { [Op.in]: descendantIds } },
            attributes: [
                'id', 'username', 'firstName', 'lastName',
                [sequelize.literal('(SELECT COALESCE(SUM("investmentAmount"), 0) FROM "Investments" WHERE "Investments"."userId" = "User"."id")'), 'totalInvestment']
            ],
            order: [[sequelize.literal('"totalInvestment"'), 'DESC']],
            limit: 5
        });

        const topByEarnings = await User.findAll({
            where: { id: { [Op.in]: descendantIds } },
            order: [['personalBv', 'DESC']], // Placeholder for earnings
            limit: 5,
            attributes: ['id', 'username', 'firstName', 'lastName', 'personalBv']
        });

        const report = {
            summary: {
                totalMembers,
                legComparison: {
                    left: user.leftBv || 0,
                    right: user.rightBv || 0
                },
                levelBreakdown: levels.map(l => ({
                    level: l.level,
                    members: l.members,
                    percentage: totalMembers > 0 ? (l.members / totalMembers) * 100 : 0
                }))
            },
            businessVolume: {
                personalBV: user.personalBv || 0,
                teamBV: user.teamBv || 0,
                matchingBV: 0, // Placeholder
                leftBV: user.leftBv || 0,
                rightBV: user.rightBv || 0,
                carryForward: (user.carryForwardLeft || 0) + (user.carryForwardRight || 0)
            },
            performance: {
                totalInvestment: levels.reduce((sum, l) => sum + l.investment, 0),
                activeInvestors: levels.reduce((sum, l) => sum + l.active, 0),
                propertiesInvested: 0 // Placeholder
            },
            topPerformers: {
                byInvestment: topByInvestment.map(u => ({
                    id: u.id,
                    userId: u.username,
                    fullName: `${u.firstName} ${u.lastName}`,
                    totalInvestment: parseFloat(u.getDataValue('totalInvestment')) || 0
                })),
                byTeamSize: [], // Placeholder
                byEarnings: topByEarnings.map(u => ({
                    id: u.id,
                    userId: u.username,
                    fullName: `${u.firstName} ${u.lastName}`,
                    bv: { total: u.personalBv }
                }))
            },
            levelAnalysis: levels
        };

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getDirectReferrals = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const offset = page * size;

        const { count, rows } = await User.findAndCountAll({
            where: { sponsorUserId: userId },
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber', 'rank', 'createdAt', 'status'],
            limit: size,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const referrals = rows.map(user => ({
            id: user.id,
            userId: user.username,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            mobile: user.phoneNumber,
            rank: { name: user.rank },
            joiningDate: user.createdAt,
            isActive: user.status === 'ACTIVE',
            totalInvestment: 0 // Placeholder as we removed it from attributes
        }));

        res.json({
            success: true,
            data: {
                content: referrals,
                totalElements: count,
                totalPages: Math.ceil(count / size),
                number: page,
                size: size
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTeamMemberDetails = async (req, res) => {
    try {
        const { memberId } = req.params;
        const currentUserId = req.user.id;

        // Find the member
        const member = await User.findByPk(memberId, {
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'status', 'createdAt', 'profilePhotoUrl', 'sponsorId', 'placementUserId',
                'personalBv', 'teamBv', 'leftBv', 'rightBv', 'carryForwardLeft', 'carryForwardRight'
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
            ]
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Security check: Ensure member is in the current user's downline (unless admin)
        if (req.user.role !== 'ADMIN') {
            const descendantIds = await getDescendantIds(currentUserId);
            if (!descendantIds.includes(parseInt(memberId))) {
                return res.status(403).json({ success: false, message: 'Access denied. User is not in your team.' });
            }
        }

        // Get additional stats
        const totalInvestment = await Investment.sum('investmentAmount', {
            where: { userId: memberId }
        });

        const directReferralsCount = await User.count({
            where: { sponsorUserId: memberId }
        });

        const teamSize = (await getDescendantIds(memberId)).length;

        res.json({
            success: true,
            data: {
                ...member.toJSON(),
                totalInvestment: totalInvestment || 0,
                directReferralsCount,
                teamSize
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getDirectReferralsStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const total = await User.count({
            where: { sponsorUserId: userId }
        });

        const active = await User.count({
            where: {
                sponsorUserId: userId,
                status: 'ACTIVE'
            }
        });

        const inactive = total - active;

        const thisMonth = await User.count({
            where: {
                sponsorUserId: userId,
                createdAt: { [Op.gte]: startOfMonth }
            }
        });

        // Get all direct referral IDs
        const directReferrals = await User.findAll({
            where: { sponsorUserId: userId },
            attributes: ['id']
        });
        const referralIds = directReferrals.map(u => u.id);

        let totalInvestment = 0;
        if (referralIds.length > 0) {
            totalInvestment = await Investment.sum('investmentAmount', {
                where: { userId: { [Op.in]: referralIds } }
            });
        }

        const totalBV = await User.sum('personalBv', {
            where: { sponsorUserId: userId }
        });

        res.json({
            success: true,
            data: {
                total,
                active,
                inactive,
                thisMonth,
                totalInvestment: totalInvestment || 0,
                totalBV: totalBV || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// New endpoint: Get Direct Referral Performance for Leadership Dashboard
exports.getDirectReferralPerformance = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 10;
        const offset = page * size;

        // Filters
        const { status, performanceFilter, sortBy = 'createdAt', sortDirection = 'DESC', search } = req.query;

        // Build where clause for direct referrals
        const whereClause = { sponsorUserId: userId };

        if (status && status !== 'ALL') {
            whereClause.status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Get direct referrals with enriched data
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'createdAt', 'status', 'profilePhotoUrl', 'personalBv'
            ],
            limit: size,
            offset: offset,
            order: [[sortBy === 'joiningDate' ? 'createdAt' : sortBy, sortDirection]]
        });

        // Enrich each referral with performance data
        const enrichedReferrals = await Promise.all(rows.map(async (referral) => {
            // 1. Get last topup date
            const lastTopup = await Topup.findOne({
                where: { userId: referral.id, status: 'COMPLETED' },
                order: [['createdAt', 'DESC']],
                attributes: ['createdAt']
            });

            // 2. Calculate Referral Sales Volume (RSV) - total property investments
            const rsv = await Investment.sum('investmentAmount', {
                where: { userId: referral.id }
            }) || 0;

            // 3. Count L2 Downline (direct referrals of this referral)
            const l2Count = await User.count({
                where: { sponsorUserId: referral.id }
            });

            // 4. Calculate Direct Commission earned by current user from this referral
            const directCommission = await Commission.sum('amount', {
                where: {
                    userId: userId,
                    fromUserId: referral.id,
                    commissionType: { [Op.like]: '%DIRECT%' },
                    status: { [Op.in]: ['EARNED', 'CREDITED', 'PAID'] }
                }
            }) || 0;

            // 5. Determine Performance Status Indicator
            // Green (Active & has sales), Yellow (Active & no sales), Red (Inactive)
            let performanceStatus = 'RED'; // Default: Inactive
            let performanceColor = '#ef4444'; // red

            if (referral.status === 'ACTIVE') {
                if (rsv > 0) {
                    performanceStatus = 'GREEN'; // Active with sales
                    performanceColor = '#22c55e'; // green
                } else {
                    performanceStatus = 'YELLOW'; // Active but no sales
                    performanceColor = '#eab308'; // yellow
                }
            }

            return {
                id: referral.id,
                userId: referral.username,
                name: `${referral.firstName} ${referral.lastName}`,
                email: referral.email,
                mobile: referral.phoneNumber,
                status: referral.status,
                rank: { name: referral.rank },
                joiningDate: referral.createdAt,
                lastTopupDate: lastTopup ? lastTopup.createdAt : null,
                referralSalesVolume: parseFloat(rsv.toFixed(2)),
                l2DownlineCount: l2Count,
                directCommission: parseFloat(directCommission.toFixed(2)),
                performanceStatus: performanceStatus,
                performanceColor: performanceColor,
                profilePicture: referral.profilePhotoUrl,
                personalBv: parseFloat(referral.personalBv || 0)
            };
        }));

        // Apply performance filter if specified
        let filteredReferrals = enrichedReferrals;
        if (performanceFilter) {
            if (performanceFilter === 'TOP_PERFORMERS') {
                // Top performers: RSV > 0 (has made sales)
                filteredReferrals = enrichedReferrals.filter(r => r.referralSalesVolume > 0);
            } else if (performanceFilter === 'NEEDS_COACHING') {
                // Needs coaching: Active but RSV = 0
                filteredReferrals = enrichedReferrals.filter(r =>
                    r.status === 'ACTIVE' && r.referralSalesVolume === 0
                );
            }
        }

        res.json({
            success: true,
            data: {
                content: filteredReferrals,
                totalElements: performanceFilter ? filteredReferrals.length : count,
                totalPages: Math.ceil((performanceFilter ? filteredReferrals.length : count) / size),
                number: page,
                size: size
            }
        });
    } catch (error) {
        console.error('Error in getDirectReferralPerformance:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Get Team Business Volume (BV) Details
exports.getTeamBV = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ['id', 'personalBv', 'teamBv', 'leftBv', 'rightBv', 'carryForwardLeft', 'carryForwardRight']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate matching BV (min of left and right for binary matching usually, or store specifically if available)
        const matchingBV = Math.min(user.leftBv || 0, user.rightBv || 0);

        res.json({
            success: true,
            data: {
                personalBV: user.personalBv || 0,
                teamBV: user.teamBv || 0,
                leftBV: user.leftBv || 0,
                rightBV: user.rightBv || 0,
                matchingBV: matchingBV,
                carryForward: (user.carryForwardLeft || 0) + (user.carryForwardRight || 0)
            }
        });
    } catch (error) {
        console.error('Error in getTeamBV:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
