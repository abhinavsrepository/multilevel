const { Bonanza, BonanzaQualification, User } = require('../../models');
const { Op } = require('sequelize');
const bonanzaService = require('../../services/bonanza-enhanced.service');

/**
 * USER BONANZA CONTROLLER
 * Handles all user-facing bonanza operations
 */

/**
 * Get all active bonanzas for user
 * GET /api/v1/bonanza/active
 */
exports.getActiveBonanzas = async (req, res) => {
    try {
        const userId = req.user.id;

        const activeBonanzas = await Bonanza.findAll({
            where: {
                status: 'ACTIVE',
                isVisible: true
            },
            order: [['priority', 'DESC'], ['createdAt', 'DESC']],
            include: [{
                model: BonanzaQualification,
                as: 'qualifications',
                where: { userId },
                required: false
            }]
        });

        // Calculate time remaining for each bonanza
        const bonanzasWithProgress = activeBonanzas.map(bonanza => {
            const qualification = bonanza.qualifications && bonanza.qualifications[0];
            const endDate = new Date(bonanza.endDate);
            const now = new Date();
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            return {
                id: bonanza.id,
                name: bonanza.name,
                description: bonanza.description,
                startDate: bonanza.startDate,
                endDate: bonanza.endDate,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                qualificationCriteria: bonanza.qualificationCriteria,
                rewardType: bonanza.rewardType,
                rewardAmount: bonanza.rewardAmount,
                rewardDescription: bonanza.rewardDescription,
                bannerImage: bonanza.bannerImage,
                iconImage: bonanza.iconImage,
                maxQualifiers: bonanza.maxQualifiers,
                currentQualifiers: bonanza.currentQualifiers,
                slotsRemaining: bonanza.maxQualifiers ? bonanza.maxQualifiers - bonanza.currentQualifiers : null,
                myProgress: qualification ? {
                    status: qualification.status,
                    overallProgress: qualification.overallProgress,
                    salesProgress: qualification.salesProgress,
                    referralProgress: qualification.referralProgress,
                    teamVolumeProgress: qualification.teamVolumeProgress,
                    progressData: qualification.progressData,
                    rank: qualification.rank,
                    qualifiedDate: qualification.qualifiedDate
                } : null
            };
        });

        res.json({
            success: true,
            data: bonanzasWithProgress
        });

    } catch (error) {
        console.error('Error getting active bonanzas:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active bonanzas',
            error: error.message
        });
    }
};

/**
 * Get upcoming bonanzas
 * GET /api/v1/bonanza/upcoming
 */
exports.getUpcomingBonanzas = async (req, res) => {
    try {
        const upcomingBonanzas = await Bonanza.findAll({
            where: {
                status: 'UPCOMING',
                isVisible: true
            },
            order: [['startDate', 'ASC']],
            attributes: [
                'id', 'name', 'description', 'startDate', 'endDate',
                'qualificationCriteria', 'rewardType', 'rewardAmount',
                'rewardDescription', 'bannerImage', 'iconImage', 'priority'
            ]
        });

        const bonanzasWithCountdown = upcomingBonanzas.map(bonanza => {
            const startDate = new Date(bonanza.startDate);
            const now = new Date();
            const daysUntilStart = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

            return {
                ...bonanza.toJSON(),
                daysUntilStart: daysUntilStart > 0 ? daysUntilStart : 0
            };
        });

        res.json({
            success: true,
            data: bonanzasWithCountdown
        });

    } catch (error) {
        console.error('Error getting upcoming bonanzas:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming bonanzas',
            error: error.message
        });
    }
};

/**
 * Get my bonanza achievements/history
 * GET /api/v1/bonanza/my-achievements
 */
exports.getMyAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 20 } = req.query;

        const where = { userId };

        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: qualifications } = await BonanzaQualification.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [{
                model: Bonanza,
                as: 'bonanza',
                attributes: [
                    'id', 'name', 'description', 'startDate', 'endDate',
                    'rewardType', 'rewardAmount', 'rewardDescription', 'status'
                ]
            }]
        });

        // Calculate totals
        const totalEarned = await BonanzaQualification.sum('rewardAmount', {
            where: {
                userId,
                status: 'AWARDED'
            }
        });

        const summary = {
            totalAchievements: count,
            qualified: await BonanzaQualification.count({
                where: { userId, status: { [Op.in]: ['QUALIFIED', 'AWARDED'] } }
            }),
            awarded: await BonanzaQualification.count({
                where: { userId, status: 'AWARDED' }
            }),
            inProgress: await BonanzaQualification.count({
                where: { userId, status: 'IN_PROGRESS' }
            }),
            totalEarned: totalEarned || 0
        };

        res.json({
            success: true,
            data: qualifications,
            summary,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements',
            error: error.message
        });
    }
};

/**
 * Get detailed progress for a specific bonanza
 * GET /api/v1/bonanza/:id/my-progress
 */
exports.getMyProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Trigger real-time check
        await bonanzaService.checkAndUpdateQualification(userId);

        // Get updated qualification
        const qualification = await BonanzaQualification.findOne({
            where: {
                bonanzaId: id,
                userId
            }
        });

        if (!qualification) {
            // Create initial qualification record
            const progressData = {
                salesVolume: 0,
                directReferrals: 0,
                teamVolume: 0,
                groupVolumes: [],
                salesProgress: 0,
                referralProgress: 0,
                teamVolumeProgress: 0,
                overallProgress: 0
            };

            return res.json({
                success: true,
                data: {
                    bonanza: bonanza,
                    qualification: {
                        status: 'PENDING',
                        progressData: progressData,
                        overallProgress: 0
                    },
                    criteria: bonanza.qualificationCriteria,
                    isQualified: false
                }
            });
        }

        // Calculate what's needed to qualify
        const criteria = bonanza.qualificationCriteria;
        const progress = qualification.progressData || {};

        const requirementsStatus = {
            salesVolume: criteria.salesVolume ? {
                required: criteria.salesVolume,
                current: progress.salesVolume || 0,
                remaining: Math.max(0, criteria.salesVolume - (progress.salesVolume || 0)),
                percentage: qualification.salesProgress || 0,
                met: (progress.salesVolume || 0) >= criteria.salesVolume
            } : null,
            directReferrals: criteria.directReferrals ? {
                required: criteria.directReferrals,
                current: progress.directReferrals || 0,
                remaining: Math.max(0, criteria.directReferrals - (progress.directReferrals || 0)),
                percentage: qualification.referralProgress || 0,
                met: (progress.directReferrals || 0) >= criteria.directReferrals
            } : null,
            teamVolume: criteria.teamVolume ? {
                required: criteria.teamVolume,
                current: progress.teamVolume || 0,
                remaining: Math.max(0, criteria.teamVolume - (progress.teamVolume || 0)),
                percentage: qualification.teamVolumeProgress || 0,
                met: (progress.teamVolume || 0) >= criteria.teamVolume
            } : null,
            rank: criteria.minRank ? {
                required: criteria.minRank,
                current: progress.currentRank,
                met: progress.currentRank && meetsRankRequirement(progress.currentRank, criteria.minRank)
            } : null,
            club: criteria.minClub ? {
                required: criteria.minClub,
                current: progress.currentClub,
                met: progress.currentClub && meetsClubRequirement(progress.currentClub, criteria.minClub)
            } : null
        };

        // Time remaining
        const endDate = new Date(bonanza.endDate);
        const now = new Date();
        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        res.json({
            success: true,
            data: {
                bonanza: {
                    id: bonanza.id,
                    name: bonanza.name,
                    description: bonanza.description,
                    startDate: bonanza.startDate,
                    endDate: bonanza.endDate,
                    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                    rewardType: bonanza.rewardType,
                    rewardAmount: bonanza.rewardAmount,
                    rewardDescription: bonanza.rewardDescription
                },
                qualification: {
                    status: qualification.status,
                    overallProgress: qualification.overallProgress,
                    qualifiedDate: qualification.qualifiedDate,
                    awardedDate: qualification.awardedDate,
                    rewardAmount: qualification.rewardAmount,
                    rank: qualification.rank
                },
                requirements: requirementsStatus,
                milestones: qualification.milestonesAchieved || [],
                isQualified: qualification.status === 'QUALIFIED' || qualification.status === 'AWARDED'
            }
        });

    } catch (error) {
        console.error('Error getting progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch progress',
            error: error.message
        });
    }
};

/**
 * Get leaderboard for a bonanza
 * GET /api/v1/bonanza/:id/leaderboard
 */
exports.getLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 20 } = req.query;
        const userId = req.user.id;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Get leaderboard
        const leaderboard = await bonanzaService.getBonanzaLeaderboard(id, parseInt(limit));

        // Find user's position
        const myQualification = await BonanzaQualification.findOne({
            where: {
                bonanzaId: id,
                userId
            }
        });

        let myPosition = null;
        if (myQualification) {
            const myRank = await BonanzaQualification.count({
                where: {
                    bonanzaId: id,
                    leaderboardScore: {
                        [Op.gt]: myQualification.leaderboardScore
                    }
                }
            });

            myPosition = {
                rank: myRank + 1,
                overallProgress: myQualification.overallProgress,
                leaderboardScore: myQualification.leaderboardScore,
                status: myQualification.status
            };
        }

        res.json({
            success: true,
            data: {
                leaderboard: leaderboard,
                myPosition: myPosition,
                totalParticipants: await BonanzaQualification.count({
                    where: { bonanzaId: id }
                })
            }
        });

    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard',
            error: error.message
        });
    }
};

/**
 * Trigger qualification check manually (user refresh)
 * POST /api/v1/bonanza/check-qualification
 */
exports.checkQualification = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await bonanzaService.checkAndUpdateQualification(userId, 'MANUAL_REFRESH');

        res.json({
            success: true,
            message: 'Qualification check completed',
            data: result
        });

    } catch (error) {
        console.error('Error checking qualification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check qualification',
            error: error.message
        });
    }
};

/**
 * Get bonanza summary for dashboard widget
 * GET /api/v1/bonanza/summary
 */
exports.getBonanzaSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get active bonanzas count
        const activeBonanzasCount = await Bonanza.count({
            where: {
                status: 'ACTIVE',
                isVisible: true
            }
        });

        // Get user's qualifications summary
        const myQualifications = await BonanzaQualification.findAll({
            where: { userId },
            include: [{
                model: Bonanza,
                as: 'bonanza',
                where: { status: 'ACTIVE' },
                required: true
            }]
        });

        // Calculate summary stats
        const inProgress = myQualifications.filter(q => q.status === 'IN_PROGRESS').length;
        const qualified = myQualifications.filter(q => q.status === 'QUALIFIED' || q.status === 'AWARDED').length;

        // Get highest progress bonanza
        const topProgress = myQualifications.sort((a, b) => b.overallProgress - a.overallProgress)[0];

        // Total earned from bonanzas
        const totalEarned = await BonanzaQualification.sum('rewardAmount', {
            where: {
                userId,
                status: 'AWARDED'
            }
        });

        res.json({
            success: true,
            data: {
                activeBonanzas: activeBonanzasCount,
                participating: myQualifications.length,
                inProgress: inProgress,
                qualified: qualified,
                totalEarned: totalEarned || 0,
                topProgress: topProgress ? {
                    bonanzaName: topProgress.bonanza.name,
                    progress: topProgress.overallProgress,
                    status: topProgress.status
                } : null
            }
        });

    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch summary',
            error: error.message
        });
    }
};

// Helper functions
function meetsRankRequirement(currentRank, minRank) {
    const rankHierarchy = ['STARTER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'CROWN'];
    const currentIndex = rankHierarchy.indexOf(currentRank);
    const requiredIndex = rankHierarchy.indexOf(minRank);
    return currentIndex >= requiredIndex;
}

function meetsClubRequirement(currentClub, minClub) {
    const clubHierarchy = ['NONE', 'SILVER', 'GOLD', 'DIAMOND'];
    const currentIndex = clubHierarchy.indexOf(currentClub);
    const requiredIndex = clubHierarchy.indexOf(minClub);
    return currentIndex >= requiredIndex;
}

module.exports = exports;
