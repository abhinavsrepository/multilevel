const { User, Income, FastStartBonus, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get Direct Bonus statistics for user
 * GET /api/direct-bonus/stats
 */
exports.getDirectBonusStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Total lifetime direct recruits
        const totalRecruits = await User.count({
            where: { sponsorId: userId }
        });

        // Current month recruits
        const monthRecruits = await User.count({
            where: {
                sponsorId: userId,
                createdAt: { [Op.gte]: firstDayOfMonth }
            }
        });

        // Total lifetime direct bonus
        const totalBonusResult = await Income.sum('amount', {
            where: {
                userId: userId,
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] },
                status: { [Op.in]: ['APPROVED', 'PAID'] }
            }
        });

        // Current month direct bonus
        const monthBonusResult = await Income.sum('amount', {
            where: {
                userId: userId,
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] },
                status: { [Op.in]: ['APPROVED', 'PAID'] },
                createdAt: { [Op.gte]: firstDayOfMonth }
            }
        });

        // Pending bonus
        const pendingBonusResult = await Income.sum('amount', {
            where: {
                userId: userId,
                incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] },
                status: 'PENDING'
            }
        });

        res.json({
            success: true,
            data: {
                totalRecruits: totalRecruits || 0,
                monthRecruits: monthRecruits || 0,
                totalBonus: parseFloat(totalBonusResult) || 0,
                monthBonus: parseFloat(monthBonusResult) || 0,
                pendingBonus: parseFloat(pendingBonusResult) || 0
            }
        });
    } catch (error) {
        console.error('Error in getDirectBonusStats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Direct Bonus detailed log (DR-SB Log)
 * GET /api/direct-bonus/log
 */
exports.getDirectBonusLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { startDate, endDate, status } = req.query;

        const whereClause = {
            userId: userId,
            incomeType: { [Op.in]: ['DIRECT_BONUS', 'REFERRAL'] }
        };

        if (status) {
            whereClause.status = status;
        }

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Income.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'fromUser',
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'createdAt']
                }
            ],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const log = rows.map(income => ({
            id: income.id,
            newTeamMemberName: income.fromUser ? `${income.fromUser.firstName} ${income.fromUser.lastName}` : 'N/A',
            agentId: income.fromUser ? income.fromUser.username : 'N/A',
            email: income.fromUser ? income.fromUser.email : 'N/A',
            joinDate: income.fromUser ? income.fromUser.createdAt : income.createdAt,
            bonusPaid: parseFloat(income.amount),
            percentage: income.percentage ? parseFloat(income.percentage) : null,
            baseAmount: income.baseAmount ? parseFloat(income.baseAmount) : null,
            status: income.status,
            paidDate: income.processedAt,
            remarks: income.remarks
        }));

        res.json({
            success: true,
            data: {
                log: log,
                pagination: {
                    total: count,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error in getDirectBonusLog:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get Fast Start Bonus progress
 * GET /api/direct-bonus/fast-start
 */
exports.getFastStartBonus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get active Fast Start Bonus
        const activeFSB = await FastStartBonus.findOne({
            where: {
                userId: userId,
                status: 'ACTIVE',
                endDate: { [Op.gte]: new Date() }
            }
        });

        if (!activeFSB) {
            return res.json({
                success: true,
                data: null,
                message: 'No active Fast Start Bonus'
            });
        }

        const currentDate = new Date();
        const daysRemaining = Math.ceil((activeFSB.endDate - currentDate) / (1000 * 60 * 60 * 24));

        // Calculate progress percentages
        const salesProgress = (activeFSB.currentSales / activeFSB.targetSales) * 100;
        const recruitsProgress = (activeFSB.currentRecruits / activeFSB.targetRecruits) * 100;
        const overallProgress = ((activeFSB.currentSales / activeFSB.targetSales) +
                                (activeFSB.currentRecruits / activeFSB.targetRecruits)) / 2 * 100;

        const isQualified = activeFSB.currentSales >= activeFSB.targetSales &&
                           activeFSB.currentRecruits >= activeFSB.targetRecruits;

        res.json({
            success: true,
            data: {
                id: activeFSB.id,
                targetSales: activeFSB.targetSales,
                targetRecruits: activeFSB.targetRecruits,
                currentSales: activeFSB.currentSales,
                currentRecruits: activeFSB.currentRecruits,
                bonusAmount: parseFloat(activeFSB.bonusAmount),
                periodDays: activeFSB.periodDays,
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
                startDate: activeFSB.startDate,
                endDate: activeFSB.endDate,
                salesProgress: Math.min(salesProgress, 100),
                recruitsProgress: Math.min(recruitsProgress, 100),
                overallProgress: Math.min(overallProgress, 100),
                isQualified: isQualified,
                status: activeFSB.status
            }
        });
    } catch (error) {
        console.error('Error in getFastStartBonus:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Update Fast Start Bonus progress (automatically called)
 * POST /api/direct-bonus/fast-start/update
 */
exports.updateFastStartProgress = async (req, res) => {
    try {
        const userId = req.user.id;

        const activeFSB = await FastStartBonus.findOne({
            where: {
                userId: userId,
                status: 'ACTIVE',
                endDate: { [Op.gte]: new Date() }
            }
        });

        if (!activeFSB) {
            return res.json({
                success: true,
                message: 'No active Fast Start Bonus to update'
            });
        }

        // Count sales (assuming sales are tracked in Income with referenceType='SALE')
        const salesCount = await Income.count({
            where: {
                userId: userId,
                referenceType: 'SALE',
                createdAt: {
                    [Op.between]: [activeFSB.startDate, activeFSB.endDate]
                }
            }
        });

        // Count recruits
        const recruitsCount = await User.count({
            where: {
                sponsorId: userId,
                createdAt: {
                    [Op.between]: [activeFSB.startDate, activeFSB.endDate]
                }
            }
        });

        // Update FSB
        await activeFSB.update({
            currentSales: salesCount,
            currentRecruits: recruitsCount
        });

        // Check if qualified
        if (salesCount >= activeFSB.targetSales && recruitsCount >= activeFSB.targetRecruits) {
            await activeFSB.update({
                status: 'COMPLETED',
                completedAt: new Date()
            });

            // Create income entry for FSB
            await Income.create({
                userId: userId,
                incomeType: 'FAST_START',
                amount: activeFSB.bonusAmount,
                status: 'APPROVED',
                remarks: `Fast Start Bonus completed: ${salesCount} sales and ${recruitsCount} recruits`
            });

            return res.json({
                success: true,
                message: 'Congratulations! Fast Start Bonus completed!',
                data: {
                    bonusAmount: parseFloat(activeFSB.bonusAmount),
                    qualified: true
                }
            });
        }

        res.json({
            success: true,
            message: 'Fast Start Bonus progress updated',
            data: {
                currentSales: salesCount,
                currentRecruits: recruitsCount,
                qualified: false
            }
        });
    } catch (error) {
        console.error('Error in updateFastStartProgress:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get direct referrals list
 * GET /api/direct-bonus/referrals
 */
exports.getDirectReferrals = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            where: { sponsorId: userId },
            attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phoneNumber', 'status', 'createdAt'],
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const referrals = rows.map(user => ({
            id: user.id,
            username: user.username,
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phoneNumber: user.phoneNumber,
            status: user.status,
            joinDate: user.createdAt
        }));

        res.json({
            success: true,
            data: {
                referrals: referrals,
                pagination: {
                    total: count,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(count / limit)
                }
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
