const { User, Investment, Income, Commission, sequelize } = require('../../models');
const { Op } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');

// Helper to get all descendant IDs (Unilevel)
const getDescendantIds = async (userId) => {
    let descendants = [];
    let queue = [userId];
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

// Helper to build tree recursively for binary tree view
const buildBinaryTree = async (userId, maxDepth, currentDepth = 1) => {
    if (currentDepth > maxDepth) return null;

    const user = await User.findByPk(userId, {
        attributes: [
            'id', 'username', 'rank', 'status', 'createdAt',
            'personalBv', 'teamBv', 'leftBv', 'rightBv', 'placement'
        ]
    });

    if (!user) return null;

    // Get left and right children for binary tree
    const leftChild = await User.findOne({ where: { placementUserId: userId, placement: 'LEFT' } });
    const rightChild = await User.findOne({ where: { placementUserId: userId, placement: 'RIGHT' } });

    // Get total downline count
    const downlineIds = await getDescendantIds(userId);

    return {
        userId: user.id,
        username: user.username,
        rank: user.rank,
        status: user.status,
        joiningDate: user.createdAt,
        personalBv: user.personalBv || 0,
        teamBv: user.teamBv || 0,
        leftBv: user.leftBv || 0,
        rightBv: user.rightBv || 0,
        totalDownline: downlineIds.length,
        placement: user.placement,
        level: currentDepth,
        leftChild: leftChild ? await buildBinaryTree(leftChild.id, maxDepth, currentDepth + 1) : null,
        rightChild: rightChild ? await buildBinaryTree(rightChild.id, maxDepth, currentDepth + 1) : null
    };
};

// Helper to calculate level unlock status based on Ecogram rules
const calculateLevelUnlock = (directReferralCount) => {
    const unlockMap = {};

    // Ecogram Eligibility Rules
    if (directReferralCount < 1) {
        // Lock all levels
        for (let i = 1; i <= 10; i++) {
            unlockMap[i] = false;
        }
    } else if (directReferralCount === 1) {
        // Unlock Level 1 only
        unlockMap[1] = true;
        for (let i = 2; i <= 10; i++) {
            unlockMap[i] = false;
        }
    } else if (directReferralCount === 2) {
        // Unlock Level 1-2
        for (let i = 1; i <= 2; i++) {
            unlockMap[i] = true;
        }
        for (let i = 3; i <= 10; i++) {
            unlockMap[i] = false;
        }
    } else if (directReferralCount === 3 || directReferralCount === 4) {
        // Unlock Levels 1-5
        for (let i = 1; i <= 5; i++) {
            unlockMap[i] = true;
        }
        for (let i = 6; i <= 10; i++) {
            unlockMap[i] = false;
        }
    } else if (directReferralCount >= 5) {
        // Unlock all 10 levels
        for (let i = 1; i <= 10; i++) {
            unlockMap[i] = true;
        }
    }

    return unlockMap;
};

// Helper to calculate next unlock requirement
const getNextUnlockRequirement = (directReferralCount) => {
    if (directReferralCount < 1) return { needed: 1, message: "Sponsor 1 more person to unlock Level 1" };
    if (directReferralCount === 1) return { needed: 1, message: "Sponsor 1 more person to unlock Level 2" };
    if (directReferralCount === 2) return { needed: 1, message: "Sponsor 1 more person to unlock Levels 3-5" };
    if (directReferralCount === 3 || directReferralCount === 4) return { needed: 5 - directReferralCount, message: `Sponsor ${5 - directReferralCount} more people to unlock all 10 levels` };
    return { needed: 0, message: "All levels unlocked" };
};

// Helper to build unilevel tree recursively with enhanced data
const buildUnilevelTree = async (userId, maxDepth, currentDepth = 1, rootDirectReferralCount = null) => {
    if (currentDepth > maxDepth) return null;

    const user = await User.findByPk(userId, {
        attributes: [
            'id', 'username', 'fullName', 'rank', 'status', 'createdAt',
            'personalBv', 'teamBv', 'profilePhotoUrl'
        ]
    });

    if (!user) return null;

    // Count direct referrals for this user
    const directReferrals = await User.findAll({
        where: { sponsorUserId: userId },
        attributes: ['id', 'status']
    });

    const directReferralCount = directReferrals.length;

    // Use root user's direct referral count for level unlock calculations
    if (currentDepth === 1) {
        rootDirectReferralCount = directReferralCount;
    }

    // Calculate if this level is unlocked based on root user's direct referrals
    const levelUnlockMap = calculateLevelUnlock(rootDirectReferralCount);
    const isLevelUnlocked = levelUnlockMap[currentDepth] || false;

    // Calculate Group Business Volume (40:40:20 ratio check)
    // For simplicity, we'll use personalBv and teamBv
    const totalBv = (user.personalBv || 0) + (user.teamBv || 0);

    // Get active vs inactive count from direct referrals
    const activeDirectCount = directReferrals.filter(r => r.status === 'ACTIVE').length;

    // Get total downline count
    const downlineIds = await getDescendantIds(userId);

    // Calculate total investment for this user
    const totalInvestment = await Investment.sum('investmentAmount', {
        where: { userId: userId }
    }) || 0;

    const children = [];
    for (const referral of directReferrals) {
        const childNode = await buildUnilevelTree(referral.id, maxDepth, currentDepth + 1, rootDirectReferralCount);
        if (childNode) {
            children.push(childNode);
        }
    }

    return {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        firstName: user.fullName ? user.fullName.split(' ')[0] : '',
        lastName: user.fullName ? user.fullName.split(' ').slice(1).join(' ') : '',
        rank: user.rank,
        status: user.status,
        joiningDate: user.createdAt,
        personalBv: user.personalBv || 0,
        teamBv: user.teamBv || 0,
        totalBv: totalBv,
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalDownline: downlineIds.length,
        directReferralCount: directReferralCount,
        activeDirectReferrals: activeDirectCount,
        inactiveDirectReferrals: directReferralCount - activeDirectCount,
        profilePicture: user.profilePhotoUrl,
        level: currentDepth,
        isLevelUnlocked: isLevelUnlocked,
        hasChildren: children.length > 0,
        children: children
    };
};

/**
 * Get Binary Tree View
 * GET /api/team/admin/tree-view
 */
exports.getTreeView = catchAsync(async (req, res) => {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId) : null;
        const maxLevels = parseInt(req.query.maxLevels) || 5;

        let targetUserId = userId;

        // If no userId specified, get the root user or first user
        if (!targetUserId) {
            const rootUser = await User.findOne({
                where: { placementUserId: null },
                order: [['id', 'ASC']]
            });
            targetUserId = rootUser ? rootUser.id : 1;
        }

        const tree = await buildBinaryTree(targetUserId, Math.min(maxLevels, 10));

        if (!tree) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get stats
        const allUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'ACTIVE' } });

        res.json({
            success: true,
            data: tree,
            stats: {
                totalUsers: allUsers,
                activeUsers: activeUsers,
                maxLevels: maxLevels
            }
        });
    } catch (error) {
        console.error('Error in getTreeView:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
            stack: error.stack
        });
    }
});

/**
 * Get Level Tree View (Unilevel) with Enhanced Ecogram Features
 * GET /api/team/admin/level-tree-view or /api/team/level-tree-view
 */
exports.getLevelTreeView = async (req, res) => {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId) : null;
        const maxLevels = parseInt(req.query.maxLevels) || 3;
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

        let targetUserId = userId;

        // Security check: Non-admin users can only view their own tree
        if (!isAdmin) {
            targetUserId = req.user.id;
        } else if (!targetUserId) {
            // Admin without specified userId - get the first user
            const firstUser = await User.findOne({
                order: [['id', 'ASC']]
            });
            targetUserId = firstUser ? firstUser.id : 1;
        }

        // Additional security check: Ensure target user is in downline if not admin
        if (!isAdmin && userId && userId !== req.user.id) {
            const descendantIds = await getDescendantIds(req.user.id);
            if (!descendantIds.includes(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only view your own team.'
                });
            }
        }

        // Get the root user's direct referral count for unlock calculations
        const rootUser = await User.findByPk(targetUserId);
        if (!rootUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const rootDirectReferralCount = await User.count({
            where: { sponsorUserId: targetUserId }
        });

        // Build the tree with enhanced data
        const tree = await buildUnilevelTree(targetUserId, Math.min(maxLevels, 10));

        if (!tree) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate level unlock map and next unlock requirement
        const levelUnlockMap = calculateLevelUnlock(rootDirectReferralCount);
        const nextUnlockInfo = getNextUnlockRequirement(rootDirectReferralCount);

        // Calculate global KPIs for the tree
        const calculateTreeStats = (node) => {
            let totalNodes = 1;
            let activeNodes = node.status === 'ACTIVE' ? 1 : 0;
            let inactiveNodes = node.status !== 'ACTIVE' ? 1 : 0;
            let totalBusiness = parseFloat(node.totalBv) || 0;

            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    const childStats = calculateTreeStats(child);
                    totalNodes += childStats.totalNodes;
                    activeNodes += childStats.activeNodes;
                    inactiveNodes += childStats.inactiveNodes;
                    totalBusiness += childStats.totalBusiness;
                });
            }

            return { totalNodes, activeNodes, inactiveNodes, totalBusiness };
        };

        const treeStats = calculateTreeStats(tree);

        // Response with comprehensive data
        res.json({
            success: true,
            data: {
                tree: tree,
                rootUser: {
                    userId: rootUser.id,
                    username: rootUser.username,
                    fullName: rootUser.fullName,
                    rank: rootUser.rank,
                    directReferralCount: rootDirectReferralCount
                },
                levelUnlockStatus: levelUnlockMap,
                nextUnlockRequirement: nextUnlockInfo,
                globalKPIs: {
                    totalNodesRendered: treeStats.totalNodes,
                    totalActiveMembers: treeStats.activeNodes,
                    totalInactiveMembers: treeStats.inactiveNodes,
                    totalBusinessVolume: parseFloat((treeStats.totalBusiness || 0).toFixed(2))
                }
            }
        });
    } catch (error) {
        console.error('Error in getLevelTreeView:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Direct Referrals
 * GET /api/team/admin/direct-referral
 */
exports.getDirectReferrals = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, status, level } = req.query;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        // Only get users who have a sponsor (direct referrals)
        whereClause.sponsorUserId = { [Op.ne]: null };

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'status', 'createdAt', 'personalBv', 'teamBv', 'sponsorId'
            ],
            include: [
                {
                    model: User,
                    as: 'Sponsor',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const data = rows.map(user => ({
            id: user.id,
            userId: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            rank: user.rank,
            status: user.status,
            joiningDate: user.createdAt,
            personalBv: user.personalBv || 0,
            teamBv: user.teamBv || 0,
            sponsor: user.Sponsor ? {
                id: user.Sponsor.id,
                username: user.Sponsor.username,
                name: `${user.Sponsor.firstName} ${user.Sponsor.lastName}`
            } : null
        }));

        // Get statistics
        const totalDirectReferrals = count;
        const activeReferrals = await User.count({ where: { ...whereClause, status: 'ACTIVE' } });

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
                total: totalDirectReferrals,
                active: activeReferrals,
                inactive: totalDirectReferrals - activeReferrals
            }
        });
    } catch (error) {
        console.error('Error in getDirectReferrals:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Total Downline
 * GET /api/team/admin/total-downline
 */
/**
 * Get Total Downline (Admin Audit)
 * GET /api/team/admin/total-downline
 */
exports.getTotalDownline = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Filters
        const { search, status, sponsorId, dateFrom, dateTo, minDownline, topupStatus } = req.query;

        let whereClause = {};

        // 1. Search Filter
        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // 2. Status Filter
        if (status && status !== 'ALL') {
            whereClause.status = status;
        }

        // 3. Date Range Filter
        if (dateFrom && dateTo) {
            whereClause.createdAt = {
                [Op.between]: [new Date(dateFrom), new Date(dateTo)]
            };
        }

        // 4. Sponsor ID Filter (Show team of specific sponsor)
        if (sponsorId) {
            const sponsor = await User.findOne({
                where: {
                    [Op.or]: [{ username: sponsorId }, { id: sponsorId }]
                }
            });

            if (sponsor) {
                // Get all descendants of this sponsor
                const descendantIds = await getDescendantIds(sponsor.id);
                if (descendantIds.length > 0) {
                    whereClause.id = { [Op.in]: descendantIds };
                } else {
                    // No downline
                    return res.json({
                        success: true,
                        data: [],
                        pagination: { total: 0, page, limit, pages: 0 }
                    });
                }
            }
        }

        // 5. Fetch Users
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'status', 'createdAt', 'personalBv', 'teamBv', 'sponsorId'
            ],
            include: [
                {
                    model: User,
                    as: 'Sponsor',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const { Commission, Topup, Package } = require('../../models');

        // 6. Enrich Data
        const data = await Promise.all(rows.map(async (user) => {
            // A. Downline Count
            const downlineIds = await getDescendantIds(user.id);
            const directReferrals = await User.count({ where: { sponsorUserId: user.id } });

            // B. Upline Path (Trace back up to 3 levels for perf)
            const uplinePath = [];
            let currentSponsor = user.Sponsor;
            let depth = 0;
            while (currentSponsor && depth < 3) {
                uplinePath.push(`${currentSponsor.firstName} ${currentSponsor.lastName} (${currentSponsor.username})`);
                // Fetch next sponsor
                if (currentSponsor.sponsorId) { // user.sponsorId is string ID? No in model it's string, but association uses sponsor_user_id (fk)
                    // Re-fetch to get parent's sponsor
                    const parent = await User.findByPk(currentSponsor.id, {
                        include: [{ model: User, as: 'Sponsor', attributes: ['id', 'username', 'firstName', 'lastName'] }]
                    });
                    currentSponsor = parent ? parent.Sponsor : null;
                } else {
                    currentSponsor = null;
                }
                depth++;
            }

            // C. Last Commission
            const lastCommission = await Commission.findOne({
                where: { userId: user.id },
                order: [['createdAt', 'DESC']],
                attributes: ['amount', 'createdAt']
            });

            // D. Topup / Expiry
            // Assuming Topup has package
            const lastTopup = await Topup.findOne({
                where: { userId: user.id, status: 'COMPLETED' },
                order: [['createdAt', 'DESC']],
                include: [{ model: Package, as: 'package', attributes: ['name'] }]
            });

            let topUpExpiry = null;
            let topUpStatusDetail = 'No Topup';

            if (lastTopup) {
                // Default validity is 30 days
                const validityDays = 30;
                const expiryDate = new Date(lastTopup.createdAt);
                expiryDate.setDate(expiryDate.getDate() + validityDays);
                topUpExpiry = expiryDate;

                const now = new Date();
                topUpStatusDetail = expiryDate > now ? 'Active' : 'Expired';
            }

            return {
                id: user.id,
                userId: user.username,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                rank: user.rank,
                status: user.status,
                joiningDate: user.createdAt,
                personalBv: user.personalBv || 0,
                teamBv: user.teamBv || 0,
                totalDownline: downlineIds.length,
                directReferrals: directReferrals,
                uplinePath: uplinePath.join(' -> '),
                lastCommissionDate: lastCommission ? lastCommission.createdAt : null,
                lastCommissionAmount: lastCommission ? parseFloat(lastCommission.amount) : 0,
                topUpExpiry: topUpExpiry,
                topUpStatus: topUpStatusDetail,
                sponsorName: user.Sponsor ? `${user.Sponsor.firstName} ${user.Sponsor.lastName}` : 'N/A'
            };
        }));

        res.json({
            success: true,
            data: data,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error in getTotalDownline:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Team Level Downline
 * GET /api/team/admin/level-downline
 */
exports.getTeamLevelDownline = async (req, res) => {
    try {
        const userId = req.query.userId ? parseInt(req.query.userId) : null;
        const maxLevel = parseInt(req.query.maxLevel) || 10;

        let targetUserId = userId;

        if (!targetUserId) {
            const firstUser = await User.findOne({ order: [['id', 'ASC']] });
            targetUserId = firstUser ? firstUser.id : 1;
        }

        const levels = [];
        let currentLevelIds = [targetUserId];
        let level = 1;

        while (currentLevelIds.length > 0 && level <= maxLevel) {
            const levelUsers = await User.findAll({
                where: { sponsorUserId: { [Op.in]: currentLevelIds } },
                attributes: [
                    'id', 'username', 'firstName', 'lastName', 'email',
                    'rank', 'status', 'createdAt', 'personalBv', 'teamBv'
                ]
            });

            if (levelUsers.length === 0) break;

            const activeCount = levelUsers.filter(u => u.status === 'ACTIVE').length;
            const totalBv = levelUsers.reduce((sum, u) => sum + (u.personalBv || 0), 0);

            levels.push({
                level: level,
                members: levelUsers.map(u => ({
                    id: u.id,
                    userId: u.id,
                    username: u.username,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email: u.email,
                    rank: u.rank,
                    status: u.status,
                    joiningDate: u.createdAt,
                    personalBv: u.personalBv || 0,
                    teamBv: u.teamBv || 0
                })),
                count: levelUsers.length,
                active: activeCount,
                totalBv: totalBv
            });

            currentLevelIds = levelUsers.map(u => u.id);
            level++;
        }

        res.json({
            success: true,
            data: levels
        });
    } catch (error) {
        console.error('Error in getTeamLevelDownline:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Downline Business
 * GET /api/team/admin/downline-business
 */
exports.getDownlineBusiness = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { search, status } = req.query;

        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { username: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'status', 'createdAt', 'personalBv', 'teamBv', 'leftBv', 'rightBv'
            ],
            limit: limit,
            offset: offset,
            order: [['teamBv', 'DESC']]
        });

        // Calculate business metrics for each user
        const data = await Promise.all(rows.map(async (user) => {
            const downlineIds = await getDescendantIds(user.id);

            // Get total investment
            const totalInvestment = await Investment.sum('investmentAmount', {
                where: { userId: { [Op.in]: [user.id, ...downlineIds] } }
            }) || 0;

            // Get total income
            const totalIncome = await Income.sum('amount', {
                where: {
                    userId: user.id,
                    status: { [Op.in]: ['APPROVED', 'PAID'] }
                }
            }) || 0;

            return {
                id: user.id,
                userId: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                rank: user.rank,
                status: user.status,
                joiningDate: user.createdAt,
                personalBv: user.personalBv || 0,
                teamBv: user.teamBv || 0,
                leftBv: user.leftBv || 0,
                rightBv: user.rightBv || 0,
                totalDownline: downlineIds.length,
                totalInvestment: totalInvestment,
                totalIncome: totalIncome
            };
        }));

        // Calculate overall stats
        const totalBv = data.reduce((sum, user) => sum + user.teamBv, 0);
        const totalInvestments = data.reduce((sum, user) => sum + user.totalInvestment, 0);

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
                totalBv: totalBv,
                totalInvestments: totalInvestments,
                averageBvPerUser: count > 0 ? totalBv / count : 0
            }
        });
    } catch (error) {
        console.error('Error in getDownlineBusiness:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Team Stats
 * GET /api/team/admin/stats
 */
exports.getTeamStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'ACTIVE' } });
        const totalDirectReferrals = await User.count({ where: { sponsorUserId: { [Op.ne]: null } } });

        // Today's New Registrations
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayRegistrations = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfDay
                }
            }
        });

        // Total Commission Payouts (YTD)
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const totalCommissionsYTD = await Commission.sum('amount', {
            where: {
                createdAt: { [Op.gte]: startOfYear },
                status: 'PAID'
            }
        }) || 0;

        // Calculate total downline (all users minus root users)
        const totalDownline = await User.count({ where: { sponsorUserId: { [Op.ne]: null } } });

        // Get total BV
        const totalBvResult = await User.sum('personalBv') || 0;
        const totalTeamBvResult = await User.sum('teamBv') || 0;

        // Get total investments
        const totalInvestments = await Investment.sum('investmentAmount') || 0;

        // Count levels
        let maxLevel = 0;
        const firstUser = await User.findOne({ order: [['id', 'ASC']] });
        if (firstUser) {
            let currentLevelIds = [firstUser.id];
            let level = 0;
            const MAX_LEVELS = 20;

            while (currentLevelIds.length > 0 && level < MAX_LEVELS) {
                const nextLevelUsers = await User.findAll({
                    where: { sponsorUserId: { [Op.in]: currentLevelIds } },
                    attributes: ['id']
                });

                if (nextLevelUsers.length === 0) break;

                maxLevel = level + 1;
                currentLevelIds = nextLevelUsers.map(u => u.id);
                level++;
            }
        }

        res.json({
            success: true,
            data: {
                totalMembers: totalUsers,
                activeMembers: activeUsers,
                inactiveMembers: totalUsers - activeUsers,
                todayRegistrations: todayRegistrations,
                totalCommissionsYTD: parseFloat(totalCommissionsYTD) || 0,
                directReferrals: totalDirectReferrals,
                totalDownline: totalDownline,
                totalLevels: maxLevel,
                totalPersonalBv: totalBvResult,
                totalTeamBv: totalTeamBvResult,
                totalInvestments: totalInvestments
            }
        });
    } catch (error) {
        console.error('Error in getTeamStats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Lazy Load Node Children
 * GET /api/team/admin/level-tree-view/expand/:nodeId
 */
exports.expandTreeNode = async (req, res) => {
    try {
        const nodeId = parseInt(req.params.nodeId);
        const maxLevels = parseInt(req.query.maxLevels) || 3;
        const rootUserId = req.query.rootUserId ? parseInt(req.query.rootUserId) : null;

        // Get the root user's direct referral count for unlock calculations
        let rootDirectReferralCount = 0;
        if (rootUserId) {
            rootDirectReferralCount = await User.count({
                where: { sponsorUserId: rootUserId }
            });
        }

        // Build tree starting from this node
        const subtree = await buildUnilevelTree(nodeId, maxLevels, 1, rootDirectReferralCount);

        if (!subtree) {
            return res.status(404).json({
                success: false,
                message: 'Node not found'
            });
        }

        res.json({
            success: true,
            data: subtree
        });
    } catch (error) {
        console.error('Error in expandTreeNode:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Search Team Members in Tree
 * GET /api/team/admin/level-tree-view/search
 */
exports.searchTreeMembers = async (req, res) => {
    try {
        const { query, rootUserId } = req.query;
        const rootId = rootUserId ? parseInt(rootUserId) : null;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        // Get all descendants of root user if specified
        let searchScope = [];
        if (rootId) {
            searchScope = await getDescendantIds(rootId);
            searchScope.push(rootId); // Include root itself
        }

        // Build where clause
        const whereClause = {
            [Op.or]: [
                { username: { [Op.like]: `%${query}%` } },
                { fullName: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ]
        };

        // Limit to root's downline if specified
        if (searchScope.length > 0) {
            whereClause.id = { [Op.in]: searchScope };
        }

        const results = await User.findAll({
            where: whereClause,
            attributes: ['id', 'username', 'fullName', 'rank', 'status', 'profilePhotoUrl'],
            limit: 20
        });

        // For each result, calculate the path from root
        const enrichedResults = await Promise.all(results.map(async (user) => {
            // Build upline path
            const uplinePath = [];
            let currentUser = user;
            let depth = 0;
            const MAX_DEPTH = 20;

            while (currentUser && depth < MAX_DEPTH) {
                const parent = await User.findOne({
                    where: { id: currentUser.sponsorUserId },
                    attributes: ['id', 'username', 'fullName', 'sponsorUserId']
                });

                if (!parent) break;

                uplinePath.unshift({
                    userId: parent.id,
                    username: parent.username,
                    fullName: parent.fullName
                });

                currentUser = parent;
                depth++;

                // Stop if we reached the root user
                if (rootId && parent.id === rootId) break;
            }

            return {
                userId: user.id,
                username: user.username,
                fullName: user.fullName,
                rank: user.rank,
                status: user.status,
                profilePicture: user.profilePhotoUrl,
                uplinePath: uplinePath
            };
        }));

        res.json({
            success: true,
            data: enrichedResults
        });
    } catch (error) {
        console.error('Error in searchTreeMembers:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Export Team Data
 * GET /api/team/admin/export
 */
exports.exportTeam = async (req, res) => {
    try {
        const { type = 'all' } = req.query;

        let whereClause = {};

        if (type === 'direct') {
            whereClause.sponsorUserId = { [Op.ne]: null };
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber',
                'rank', 'status', 'createdAt', 'personalBv', 'teamBv', 'sponsorId'
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
            'Joining Date': user.createdAt,
            'Personal BV': user.personalBv || 0,
            'Team BV': user.teamBv || 0,
            'Sponsor': user.Sponsor ? `${user.Sponsor.firstName} ${user.Sponsor.lastName} (${user.Sponsor.username})` : 'N/A'
        }));

        res.json({
            success: true,
            data: exportData,
            count: exportData.length
        });
    } catch (error) {
        console.error('Error in exportTeam:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
