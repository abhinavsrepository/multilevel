const { User, Investment } = require('../models');
const { Op } = require('sequelize');

// Helper to build tree recursively
// Helper to build tree recursively
const buildTree = async (userId, currentDepth, maxDepth, placement = 'ROOT') => {
    if (currentDepth > maxDepth) return null;

    const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'firstName', 'lastName', 'rank', 'status', 'leftBv', 'rightBv', 'createdAt']
    });

    if (!user) return null;

    const node = {
        id: user.id,
        userId: user.username, // Frontend expects userId string, using username
        name: `${user.firstName} ${user.lastName}`,
        rank: user.rank,
        profilePicture: user.profilePicture, // Frontend expects profilePicture
        status: user.status,
        joiningDate: user.createdAt,
        bv: {
            left: user.leftBv || 0,
            right: user.rightBv || 0,
            total: (user.leftBv || 0) + (user.rightBv || 0)
        },
        teamSize: 0, // Placeholder
        totalInvestment: user.totalInvestment || 0,
        placement: placement,
        children: []
    };

    // Find left and right children
    const leftChild = await User.findOne({
        where: { placementUserId: userId, placement: 'LEFT' },
        attributes: ['id']
    });
    const rightChild = await User.findOne({
        where: { placementUserId: userId, placement: 'RIGHT' },
        attributes: ['id']
    });

    if (leftChild) {
        const leftNode = await buildTree(leftChild.id, currentDepth + 1, maxDepth, 'LEFT');
        if (leftNode) node.children.push(leftNode);
    }
    // If we want to show empty slots, we might need to handle that in frontend or return nulls here.
    // Frontend types say children?: TreeNode[], so it expects nodes.
    // If frontend renders empty slots based on missing children, this is fine.
    // However, binary tree usually expects explicit nulls for empty slots if positional.
    // Let's check if frontend handles missing children as empty slots.
    // If not, we might need to return a "dummy" node or null.
    // But TreeNode[] implies just a list of existing children.
    // Let's stick to returning existing children for now.

    if (rightChild) {
        const rightNode = await buildTree(rightChild.id, currentDepth + 1, maxDepth, 'RIGHT');
        if (rightNode) node.children.push(rightNode);
    }

    return node;
};

// Helper to check if descendantId is in ancestorId's downline
const isDescendant = async (ancestorId, descendantId) => {
    if (ancestorId == descendantId) return true;

    let currentId = descendantId;
    // Safety limit to prevent infinite loops if cycle exists (though shouldn't in tree)
    let depth = 0;
    const MAX_DEPTH = 100;

    while (currentId && depth < MAX_DEPTH) {
        const user = await User.findByPk(currentId, { attributes: ['id', 'placementUserId'] });
        if (!user || !user.placementUserId) return false;

        if (user.placementUserId == ancestorId) return true;
        currentId = user.placementUserId;
        depth++;
    }
    return false;
};

// Helper to get all descendant IDs (for team stats calculation)
const getDescendantIds = async (userId) => {
    let descendants = [];
    let queue = [userId];
    let loops = 0;
    const MAX_LOOPS = 10000; // Safety break to prevent infinite loops

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

exports.getBinaryTree = async (req, res) => {
    try {
        let targetUserId = req.user.id;

        if (req.query.userId) {
            // If userId is provided, check if it's a username or ID
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { username: req.query.userId },
                        { id: req.query.userId }
                    ]
                }
            });

            if (user) {
                // Security Check: Allow if admin, self, or downline
                if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
                    const isAllowed = await isDescendant(req.user.id, user.id);
                    if (!isAllowed) {
                        return res.status(403).json({ success: false, message: 'Access denied. You can only view your own team.' });
                    }
                }
                targetUserId = user.id;
            } else {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
        }

        const depth = parseInt(req.query.depth) || 3;
        const maxDepth = Math.min(depth, 5); // Limit depth for performance

        const tree = await buildTree(targetUserId, 1, maxDepth);

        if (!tree) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTreeStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get start of current month for monthly stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Count direct referrals (sponsorUserId matches current user)
        const directReferrals = await User.count({
            where: { sponsorUserId: userId }
        });

        // 2. Count direct referrals this month
        const directReferralsThisMonth = await User.count({
            where: {
                sponsorUserId: userId,
                createdAt: { [Op.gte]: startOfMonth }
            }
        });

        // 3. Get all team members (downline) - using sponsorship tree
        const descendantIds = await getDescendantIds(userId);
        const totalTeam = descendantIds.length;

        // 4. Count active/inactive members in team
        let active = 0;
        let inactive = 0;

        if (descendantIds.length > 0) {
            active = await User.count({
                where: {
                    id: { [Op.in]: descendantIds },
                    status: 'ACTIVE'
                }
            });
            inactive = totalTeam - active;
        }

        // 5. Count left and right leg members (using placement tree)
        const leftLeg = await countPlacementLeg(userId, 'LEFT');
        const rightLeg = await countPlacementLeg(userId, 'RIGHT');

        // 6. Calculate matching BV (minimum of left and right)
        const matchingBV = Math.min(user.leftBv || 0, user.rightBv || 0);

        // 7. Calculate carry forward (sum of both legs)
        const carryForward = parseFloat((user.carryForwardLeft || 0)) + parseFloat((user.carryForwardRight || 0));

        // 8. Get team investment totals
        let teamInvestment = 0;
        let teamInvestmentThisMonth = 0;

        if (descendantIds.length > 0) {
            teamInvestment = await Investment.sum('investmentAmount', {
                where: { userId: { [Op.in]: descendantIds } }
            }) || 0;

            teamInvestmentThisMonth = await Investment.sum('investmentAmount', {
                where: {
                    userId: { [Op.in]: descendantIds },
                    createdAt: { [Op.gte]: startOfMonth }
                }
            }) || 0;
        }

        // Return complete stats matching frontend TeamStats interface
        res.json({
            success: true,
            data: {
                // Team counts
                totalTeam,
                leftLeg,
                rightLeg,
                active,
                inactive,
                directReferrals,
                directReferralsThisMonth,

                // Business Volume
                teamBV: parseFloat(user.teamBv || 0),
                leftBV: parseFloat(user.leftBv || 0),
                rightBV: parseFloat(user.rightBv || 0),
                matchingBV: parseFloat(matchingBV.toFixed(2)),
                carryForward: parseFloat(carryForward.toFixed(2)),

                // Investment
                teamInvestment: parseFloat(teamInvestment.toFixed(2)),
                teamInvestmentThisMonth: parseFloat(teamInvestmentThisMonth.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error in getTreeStats:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Helper function to count members in a placement leg recursively
const countPlacementLeg = async (userId, placement) => {
    try {
        let count = 0;
        let queue = [userId];
        let loops = 0;
        const MAX_LOOPS = 10000;

        while (queue.length > 0 && loops < MAX_LOOPS) {
            const currentId = queue.shift();

            // Find children in this placement leg
            const children = await User.findAll({
                where: {
                    placementUserId: currentId,
                    ...(placement ? { placement } : {})
                },
                attributes: ['id']
            });

            if (children.length > 0) {
                count += children.length;
                // Add children to queue for recursive counting (only direct placement children)
                for (const child of children) {
                    queue.push(child.id);
                }
            }
            loops++;
        }

        return count;
    } catch (error) {
        console.error('Error in countPlacementLeg:', error);
        return 0;
    }
};
