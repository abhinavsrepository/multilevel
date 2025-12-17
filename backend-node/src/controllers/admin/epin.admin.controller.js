const { EPin, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

/**
 * Generate E-Pins (Admin)
 */
exports.generateEPins = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { count, amount, expiryDays } = req.body;

        if (!count || !amount || count < 1 || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid count or amount'
            });
        }

        const epins = [];
        const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;

        for (let i = 0; i < count; i++) {
            const pinCode = `EP${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            const epin = await EPin.create({
                pinCode,
                amount,
                generatedBy: req.user.id,
                generatedFrom: 'ADMIN',
                expiryDate
            }, { transaction });

            epins.push(epin);
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: `${count} E-Pins generated successfully`,
            data: epins
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Generate E-Pins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate E-Pins',
            error: error.message
        });
    }
};

/**
 * Get all E-Pins with filters
 */
exports.getAllEPins = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            generatedFrom,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (generatedFrom) {
            where.generatedFrom = generatedFrom;
        }

        if (search) {
            where[Op.or] = [
                { pinCode: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: epins, count } = await EPin.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: User,
                    as: 'generator',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'activatedUser',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                epins,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get E-Pins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve E-Pins',
            error: error.message
        });
    }
};

/**
 * Block/Unblock E-Pin
 */
exports.toggleEPinStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'BLOCK' or 'ACTIVATE'

        const epin = await EPin.findByPk(id);

        if (!epin) {
            return res.status(404).json({
                success: false,
                message: 'E-Pin not found'
            });
        }

        if (epin.status === 'USED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify used E-Pin'
            });
        }

        const newStatus = action === 'BLOCK' ? 'BLOCKED' : 'AVAILABLE';
        await epin.update({ status: newStatus });

        res.json({
            success: true,
            message: `E-Pin ${action === 'BLOCK' ? 'blocked' : 'activated'} successfully`,
            data: epin
        });
    } catch (error) {
        console.error('Toggle E-Pin status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update E-Pin status',
            error: error.message
        });
    }
};

/**
 * Delete E-Pin (only unused)
 */
exports.deleteEPin = async (req, res) => {
    try {
        const { id } = req.params;

        const epin = await EPin.findByPk(id);

        if (!epin) {
            return res.status(404).json({
                success: false,
                message: 'E-Pin not found'
            });
        }

        if (epin.status === 'USED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete used E-Pin'
            });
        }

        await epin.destroy();

        res.json({
            success: true,
            message: 'E-Pin deleted successfully'
        });
    } catch (error) {
        console.error('Delete E-Pin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete E-Pin',
            error: error.message
        });
    }
};

/**
 * Get E-Pin statistics
 */
exports.getEPinStats = async (req, res) => {
    try {
        const [totalEPins, availableEPins, usedEPins, blockedEPins, expiredEPins] = await Promise.all([
            EPin.count(),
            EPin.count({ where: { status: 'AVAILABLE' } }),
            EPin.count({ where: { status: 'USED' } }),
            EPin.count({ where: { status: 'BLOCKED' } }),
            EPin.count({ where: { status: 'EXPIRED' } })
        ]);

        const totalValue = await EPin.sum('amount', { where: { status: 'AVAILABLE' } }) || 0;
        const usedValue = await EPin.sum('amount', { where: { status: 'USED' } }) || 0;

        res.json({
            success: true,
            data: {
                totalEPins,
                availableEPins,
                usedEPins,
                blockedEPins,
                expiredEPins,
                availableValue: parseFloat(totalValue),
                usedValue: parseFloat(usedValue)
            }
        });
    } catch (error) {
        console.error('Get E-Pin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve E-Pin statistics',
            error: error.message
        });
    }
};
