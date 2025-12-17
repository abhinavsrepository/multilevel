const { User } = require('../models');
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

        // Count direct referrals
        const directReferrals = await User.count({ where: { sponsorId: userId } });

        // Count total team size (simplified, ideally use a materialized path or recursive CTE)
        // For now, just returning direct referrals as team size placeholder or 0 if expensive to calc
        // In production, maintain a 'teamSize' field on User and update it via hooks/events
        const teamSize = 0; // Placeholder

        res.json({
            success: true,
            data: {
                leftBv: user.leftBv,
                rightBv: user.rightBv,
                carryForwardLeft: user.carryForwardLeft,
                carryForwardRight: user.carryForwardRight,
                personalBv: user.personalBv,
                teamBv: user.teamBv,
                directReferrals,
                teamSize, // To be implemented with proper tree traversal or stored field
                currentRank: user.rank
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
