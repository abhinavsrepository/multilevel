const clubService = require('../services/club.service');
const { User } = require('../models');

/**
 * Get club status and progress for current user
 */
exports.getMyClubStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Calculate current GBV and club status
        const gbvData = await clubService.calculateGroupBusinessVolume(userId);

        const user = await User.findByPk(userId, {
            attributes: ['clubStatus', 'clubProgress']
        });

        res.json({
            success: true,
            data: {
                currentClub: user.clubStatus,
                qualified: gbvData.qualified,
                nextClub: getNextClubLevel(user.clubStatus),
                groups: gbvData.groups,
                totalGBV: gbvData.totalGBV,
                clubProgress: gbvData.clubProgress,
                thresholds: {
                    thresholds: {
                        'Rising Stars Club': 100 * 100000, // 1 Cr
                        'Business Leaders Club': 250 * 100000, // 2.5 Cr
                        'Millionaire CLUB': 500 * 100000 // 5 Cr
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error getting club status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get club income history for current user
 */
exports.getMyClubIncome = async (req, res) => {
    try {
        const userId = req.user.id;
        const { Commission } = require('../models');
        const { Op } = require('sequelize');

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Commission.findAndCountAll({
            where: {
                userId: userId,
                commissionType: { [Op.in]: ['CLUB_ACHIEVEMENT', 'CLUB_ROYALTY'] }
            },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                commissions: rows,
                total: count,
                page,
                limit
            }
        });

    } catch (error) {
        console.error('Error getting club income:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Get all club members
 */
exports.getAllClubMembers = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const clubLevel = req.query.clubLevel;

        const whereClause = {
            clubStatus: { [Op.in]: ['Rising Stars Club', 'Business Leaders Club', 'Millionaire CLUB'] }
        };

        if (clubLevel && ['Rising Stars Club', 'Business Leaders Club', 'Millionaire CLUB'].includes(clubLevel)) {
            whereClause.clubStatus = clubLevel;
        }

        const members = await User.findAll({
            where: whereClause,
            attributes: [
                'id', 'username', 'firstName', 'lastName', 'email',
                'clubStatus', 'clubProgress', 'createdAt'
            ],
            order: [
                ['clubStatus', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });

        res.json({
            success: true,
            data: members
        });

    } catch (error) {
        console.error('Error getting club members:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Get club statistics
 */
exports.getClubStatistics = async (req, res) => {
    try {
        const stats = await clubService.getClubStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting club statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Manually trigger club status update for a user
 */
exports.updateUserClubStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const gbvData = await clubService.updateClubStatus(parseInt(userId));

        res.json({
            success: true,
            message: 'Club status updated successfully',
            data: gbvData
        });

    } catch (error) {
        console.error('Error updating club status:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Manually trigger monthly royalty distribution
 */
exports.distributeMonthlyRoyalty = async (req, res) => {
    try {
        await clubService.distributeClubRoyalty();

        res.json({
            success: true,
            message: 'Monthly royalty distribution completed successfully'
        });

    } catch (error) {
        console.error('Error distributing royalty:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Helper: Get next club level
 */
function getNextClubLevel(currentClub) {
    const hierarchy = ['NONE', 'Rising Stars Club', 'Business Leaders Club', 'Millionaire CLUB'];
    const currentIndex = hierarchy.indexOf(currentClub);

    if (currentIndex === -1 || currentIndex === hierarchy.length - 1) {
        return null;
    }

    return hierarchy[currentIndex + 1];
}
