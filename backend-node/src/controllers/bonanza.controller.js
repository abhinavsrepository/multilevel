const { Bonanza, User, Investment, Commission } = require('../models');
const { Op } = require('sequelize');

/**
 * Admin: Create new bonanza
 */
exports.createBonanza = async (req, res) => {
    try {
        const { name, description, startDate, endDate, targetAmount, reward } = req.body;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();

        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Determine status based on dates
        let status = 'UPCOMING';
        if (today >= start && today <= end) {
            status = 'ACTIVE';
        } else if (today > end) {
            status = 'EXPIRED';
        }

        const bonanza = await Bonanza.create({
            name,
            description,
            startDate,
            endDate,
            targetAmount,
            reward,
            status
        });

        res.status(201).json({
            success: true,
            message: 'Bonanza created successfully',
            data: bonanza
        });

    } catch (error) {
        console.error('Error creating bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Get all bonanzas
 */
exports.getAllBonanzas = async (req, res) => {
    try {
        const status = req.query.status;

        const whereClause = {};
        if (status && ['ACTIVE', 'EXPIRED', 'UPCOMING'].includes(status)) {
            whereClause.status = status;
        }

        const bonanzas = await Bonanza.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: bonanzas
        });

    } catch (error) {
        console.error('Error getting bonanzas:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * User: Get active bonanzas
 */
exports.getActiveBonanzas = async (req, res) => {
    try {
        const bonanzas = await Bonanza.findAll({
            where: { status: 'ACTIVE' },
            order: [['endDate', 'ASC']]
        });

        // Calculate user's progress for each bonanza
        const userId = req.user.id;
        const bonanzasWithProgress = await Promise.all(
            bonanzas.map(async (bonanza) => {
                const progress = await calculateUserProgress(userId, bonanza);
                return {
                    ...bonanza.toJSON(),
                    userProgress: progress
                };
            })
        );

        res.json({
            success: true,
            data: bonanzasWithProgress
        });

    } catch (error) {
        console.error('Error getting active bonanzas:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Get bonanza by ID
 */
exports.getBonanzaById = async (req, res) => {
    try {
        const { id } = req.params;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        res.json({
            success: true,
            data: bonanza
        });

    } catch (error) {
        console.error('Error getting bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Update bonanza
 */
exports.updateBonanza = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate, targetAmount, reward, status } = req.body;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        await bonanza.update({
            name: name || bonanza.name,
            description: description !== undefined ? description : bonanza.description,
            startDate: startDate || bonanza.startDate,
            endDate: endDate || bonanza.endDate,
            targetAmount: targetAmount || bonanza.targetAmount,
            reward: reward || bonanza.reward,
            status: status || bonanza.status
        });

        res.json({
            success: true,
            message: 'Bonanza updated successfully',
            data: bonanza
        });

    } catch (error) {
        console.error('Error updating bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Delete bonanza
 */
exports.deleteBonanza = async (req, res) => {
    try {
        const { id } = req.params;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        await bonanza.destroy();

        res.json({
            success: true,
            message: 'Bonanza deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting bonanza:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * User: Get my bonanza achievements
 */
exports.getMyBonanzaAchievements = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all bonanza-related commissions for this user
        const achievements = await Commission.findAll({
            where: {
                userId: userId,
                commissionType: 'BONANZA_REWARD'
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: achievements
        });

    } catch (error) {
        console.error('Error getting bonanza achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Admin: Get bonanza qualifiers
 */
exports.getBonanzaQualifiers = async (req, res) => {
    try {
        const { id } = req.params;

        const bonanza = await Bonanza.findByPk(id);

        if (!bonanza) {
            return res.status(404).json({
                success: false,
                message: 'Bonanza not found'
            });
        }

        // Get all users who qualified for this bonanza
        const qualifiers = await Commission.findAll({
            where: {
                commissionType: 'BONANZA_REWARD',
                description: { [Op.like]: `%${bonanza.name}%` }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username', 'firstName', 'lastName', 'email']
                }
            ]
        });

        res.json({
            success: true,
            data: qualifiers
        });

    } catch (error) {
        console.error('Error getting bonanza qualifiers:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Helper: Calculate user's progress towards a bonanza target
 */
async function calculateUserProgress(userId, bonanza) {
    try {
        // Calculate total investments during bonanza period
        const totalInvestment = await Investment.sum('investmentAmount', {
            where: {
                userId: userId,
                createdAt: {
                    [Op.between]: [bonanza.startDate, bonanza.endDate]
                },
                status: { [Op.in]: ['ACTIVE', 'COMPLETED'] }
            }
        });

        const amount = totalInvestment || 0;
        const target = parseFloat(bonanza.targetAmount);
        const percentage = target > 0 ? (amount / target) * 100 : 0;
        const qualified = amount >= target;

        return {
            currentAmount: amount,
            targetAmount: target,
            percentage: Math.min(percentage, 100),
            qualified
        };

    } catch (error) {
        console.error('Error calculating user progress:', error);
        return {
            currentAmount: 0,
            targetAmount: parseFloat(bonanza.targetAmount),
            percentage: 0,
            qualified: false
        };
    }
}
