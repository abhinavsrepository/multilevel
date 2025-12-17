const { Income, MatchingBonusDetail, User, sequelize } = require('../../models');
const matchingBonusService = require('../../services/matching-bonus.service');
const { Op } = require('sequelize');

/**
 * Get matching bonus history with pagination and filters
 * GET /api/v1/matching-bonus/history
 */
exports.getMatchingBonusHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { startDate, endDate, status, cyclePreset } = req.query;

        // Build where clause
        const whereClause = {
            userId: userId,
            incomeType: 'MATCHING'
        };

        // Handle date filtering with presets
        if (cyclePreset) {
            const dateRange = getDateRangeFromPreset(cyclePreset);
            if (dateRange) {
                whereClause.createdAt = {
                    [Op.between]: [dateRange.startDate, dateRange.endDate]
                };
            }
        } else if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (status) {
            whereClause.status = status;
        }

        // Get matching bonus records
        const { count, rows } = await Income.findAndCountAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],
            attributes: [
                'id',
                'amount',
                'status',
                'isWithdrawn',
                'remarks',
                'createdAt',
                'processedAt'
            ]
        });

        // Get details count for each income record
        const incomeIds = rows.map(r => r.id);
        const detailsCounts = await MatchingBonusDetail.findAll({
            where: { incomeId: { [Op.in]: incomeIds } },
            attributes: [
                'incomeId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['incomeId']
        });

        const detailsCountMap = {};
        detailsCounts.forEach(dc => {
            detailsCountMap[dc.incomeId] = parseInt(dc.dataValues.count);
        });

        // Format response
        const data = rows.map(record => ({
            id: record.id,
            date: record.createdAt,
            matchingBonus: parseFloat(record.amount),
            status: record.status,
            isWithdrawn: record.isWithdrawn,
            payable: record.status === 'APPROVED' && !record.isWithdrawn ? parseFloat(record.amount) : 0,
            contributorsCount: detailsCountMap[record.id] || 0,
            remarks: record.remarks,
            processedAt: record.processedAt
        }));

        // Calculate summary statistics
        const stats = await Income.findOne({
            where: {
                userId: userId,
                incomeType: 'MATCHING',
                ...(whereClause.createdAt && { createdAt: whereClause.createdAt })
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalMatchingBonus'],
                [sequelize.fn('SUM', sequelize.literal(
                    "CASE WHEN status = 'APPROVED' AND \"is_withdrawn\" = false THEN amount ELSE 0 END"
                )), 'totalPayable'],
                [sequelize.fn('SUM', sequelize.literal(
                    "CASE WHEN status = 'PENDING' THEN amount ELSE 0 END"
                )), 'totalPending'],
                [sequelize.fn('SUM', sequelize.literal(
                    "CASE WHEN \"is_withdrawn\" = true THEN amount ELSE 0 END"
                )), 'totalWithdrawn']
            ],
            raw: true
        });

        res.json({
            success: true,
            data: data,
            pagination: {
                total: count,
                page: page,
                limit: limit,
                pages: Math.ceil(count / limit)
            },
            summary: {
                totalMatchingBonus: parseFloat(stats?.totalMatchingBonus || 0),
                totalPayable: parseFloat(stats?.totalPayable || 0),
                totalPending: parseFloat(stats?.totalPending || 0),
                totalWithdrawn: parseFloat(stats?.totalWithdrawn || 0)
            }
        });
    } catch (error) {
        console.error('Error in getMatchingBonusHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get matching bonus source details (downline contributions)
 * GET /api/v1/matching-bonus/:incomeId/details
 */
exports.getMatchingBonusSourceDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { incomeId } = req.params;

        // Verify the income record belongs to the user
        const income = await Income.findOne({
            where: {
                id: incomeId,
                userId: userId,
                incomeType: 'MATCHING'
            }
        });

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Matching bonus record not found'
            });
        }

        // Get source details
        const details = await matchingBonusService.getMatchingBonusDetails(incomeId);

        // Group by level for summary
        const levelSummary = details.reduce((acc, detail) => {
            const level = detail.level;
            if (!acc[level]) {
                acc[level] = {
                    level: level,
                    count: 0,
                    totalContribution: 0,
                    averagePercentage: 0
                };
            }
            acc[level].count++;
            acc[level].totalContribution += detail.contributionAmount;
            acc[level].averagePercentage = detail.matchedPercentage; // Same for all in level
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                incomeId: income.id,
                totalAmount: parseFloat(income.amount),
                status: income.status,
                date: income.createdAt,
                contributors: details,
                levelSummary: Object.values(levelSummary),
                totalContributors: details.length
            }
        });
    } catch (error) {
        console.error('Error in getMatchingBonusSourceDetails:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get matching bonus eligibility and rank info
 * GET /api/v1/matching-bonus/eligibility
 */
exports.getMatchingEligibility = async (req, res) => {
    try {
        const userId = req.user.id;

        const eligibility = await matchingBonusService.checkMatchingEligibility(userId);
        const nextRankInfo = await matchingBonusService.getNextRankRequirements(eligibility.currentRank);

        // Get user's current direct referrals count
        const directReferralsCount = await User.count({
            where: { sponsorId: userId }
        });

        res.json({
            success: true,
            data: {
                eligible: eligibility.eligible,
                currentRank: eligibility.currentRank,
                matchingDepth: eligibility.matchingDepth || 0,
                matchingPercentages: eligibility.matchingPercentages || {},
                reason: eligibility.reason,
                directReferralsCount: directReferralsCount,
                nextRank: nextRankInfo.hasNext ? {
                    name: nextRankInfo.nextRank,
                    matchingDepth: nextRankInfo.nextMatchingDepth,
                    requirements: nextRankInfo.requirements,
                    progress: {
                        directReferrals: {
                            current: directReferralsCount,
                            required: nextRankInfo.requirements.minPersonallySponsored
                        }
                    }
                } : null
            }
        });
    } catch (error) {
        console.error('Error in getMatchingEligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Calculate potential matching bonus for current cycle
 * GET /api/v1/matching-bonus/calculate-current
 */
exports.calculateCurrentCycleBonus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        // Default to current month if not provided
        const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date();

        const calculation = await matchingBonusService.calculateMatchingBonus(userId, start, end);

        res.json({
            success: true,
            data: {
                eligible: calculation.success,
                period: {
                    startDate: start,
                    endDate: end
                },
                totalMatchingBonus: calculation.totalMatchingBonus,
                downlineCount: calculation.downlineCount || 0,
                matchedCommissionsCount: calculation.matchedCommissionsCount || 0,
                details: calculation.details || [],
                eligibility: calculation.eligibility
            }
        });
    } catch (error) {
        console.error('Error in calculateCurrentCycleBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Export matching bonus data to Excel
 * GET /api/v1/matching-bonus/export
 */
exports.exportMatchingBonus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, cyclePreset } = req.query;

        // Build where clause
        const whereClause = {
            userId: userId,
            incomeType: 'MATCHING'
        };

        // Handle date filtering
        if (cyclePreset) {
            const dateRange = getDateRangeFromPreset(cyclePreset);
            if (dateRange) {
                whereClause.createdAt = {
                    [Op.between]: [dateRange.startDate, dateRange.endDate]
                };
            }
        } else if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Get all matching bonus records
        const records = await Income.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        // Get all details for these records
        const incomeIds = records.map(r => r.id);
        const allDetails = await MatchingBonusDetail.findAll({
            where: { incomeId: { [Op.in]: incomeIds } },
            include: [
                {
                    model: User,
                    as: 'DownlineAgent',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ],
            order: [['incomeId', 'ASC'], ['downlineLevel', 'ASC']]
        });

        // Format for export
        const exportData = [];
        for (const record of records) {
            const details = allDetails.filter(d => d.incomeId === record.id);

            exportData.push({
                'Date': record.createdAt.toISOString().split('T')[0],
                'Matching Bonus': parseFloat(record.amount),
                'Status': record.status,
                'Contributors Count': details.length,
                'Payable': record.status === 'APPROVED' && !record.isWithdrawn ? parseFloat(record.amount) : 0
            });

            // Add detail rows if requested
            if (req.query.includeDetails === 'true') {
                details.forEach(detail => {
                    exportData.push({
                        'Date': '',
                        'Downline Agent': `${detail.DownlineAgent.firstName} ${detail.DownlineAgent.lastName} (${detail.DownlineAgent.username})`,
                        'Level': detail.downlineLevel,
                        'Base Commission': parseFloat(detail.baseCommissionAmount),
                        'Match %': parseFloat(detail.matchedPercentage),
                        'Contribution': parseFloat(detail.contributionAmount)
                    });
                });
            }
        }

        // Add cycle summary
        const totalMatchingBonus = records.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        const totalPayable = records
            .filter(r => r.status === 'APPROVED' && !r.isWithdrawn)
            .reduce((sum, r) => sum + parseFloat(r.amount), 0);

        exportData.push({});
        exportData.push({
            'Date': 'CYCLE SUMMARY',
            'Matching Bonus': totalMatchingBonus,
            'Payable': totalPayable
        });

        res.json({
            success: true,
            data: exportData,
            count: exportData.length
        });
    } catch (error) {
        console.error('Error in exportMatchingBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Helper function to get date range from preset
function getDateRangeFromPreset(preset) {
    const now = new Date();
    let startDate, endDate;

    switch (preset) {
        case 'this_cycle':
            // Assuming monthly cycle, start from first day of current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
            break;
        case 'last_7_days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
        case 'last_30_days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            endDate = now;
            break;
        case 'last_cycle':
            // Last month
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case 'quarter_to_date':
            // Current quarter
            const currentQuarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
            endDate = now;
            break;
        case 'year_to_date':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = now;
            break;
        default:
            return null;
    }

    return { startDate, endDate };
}
