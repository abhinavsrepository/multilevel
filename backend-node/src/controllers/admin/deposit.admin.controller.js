const { Deposit, User, EPin, Wallet, sequelize } = require('../../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

/**
 * Get all deposits
 */
exports.getAllDeposits = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { rows: deposits, count } = await Deposit.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phoneNumber'],
                    where: search ? {
                        [Op.or]: [
                            { username: { [Op.like]: `%${search}%` } },
                            { email: { [Op.like]: `%${search}%` } }
                        ]
                    } : undefined
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                },
                {
                    model: EPin,
                    as: 'epin',
                    attributes: ['id', 'pinCode', 'amount']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                deposits,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve deposits',
            error: error.message
        });
    }
};

/**
 * Get pending deposits
 */
exports.getPendingDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.findAll({
            where: { status: 'PENDING' },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phoneNumber']
                }
            ]
        });

        res.json({
            success: true,
            data: deposits
        });
    } catch (error) {
        console.error('Get pending deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending deposits',
            error: error.message
        });
    }
};

/**
 * Approve deposit and generate E-Pin
 */
exports.approveDeposit = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { generateEPin = true, adminNotes } = req.body;

        const deposit = await Deposit.findByPk(id, {
            include: [{ model: User, as: 'user' }],
            transaction
        });

        if (!deposit) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Deposit not found'
            });
        }

        if (deposit.status !== 'PENDING') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Deposit has already been processed'
            });
        }

        // Update deposit status
        await deposit.update({
            status: 'APPROVED',
            approvedBy: req.user.id,
            approvedAt: new Date(),
            adminNotes
        }, { transaction });

        let epin = null;

        // Generate E-Pin if requested
        if (generateEPin) {
            const pinCode = `EP${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            epin = await EPin.create({
                pinCode,
                amount: deposit.amount,
                generatedBy: req.user.id,
                generatedFrom: 'DEPOSIT',
                status: 'AVAILABLE'
            }, { transaction });

            await deposit.update({
                epinGenerated: true,
                epinId: epin.id
            }, { transaction });
        }

        await transaction.commit();

        // Reload with associations
        await deposit.reload({
            include: [
                { model: User, as: 'user' },
                { model: User, as: 'approver' },
                { model: EPin, as: 'epin' }
            ]
        });

        res.json({
            success: true,
            message: 'Deposit approved successfully',
            data: {
                deposit,
                epin
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Approve deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve deposit',
            error: error.message
        });
    }
};

/**
 * Reject deposit
 */
exports.rejectDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejectionReason, adminNotes } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const deposit = await Deposit.findByPk(id);

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Deposit not found'
            });
        }

        if (deposit.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Deposit has already been processed'
            });
        }

        await deposit.update({
            status: 'REJECTED',
            approvedBy: req.user.id,
            approvedAt: new Date(),
            rejectionReason,
            adminNotes
        });

        // Reload with associations
        await deposit.reload({
            include: [
                { model: User, as: 'user' },
                { model: User, as: 'approver' }
            ]
        });

        res.json({
            success: true,
            message: 'Deposit rejected successfully',
            data: deposit
        });
    } catch (error) {
        console.error('Reject deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject deposit',
            error: error.message
        });
    }
};

/**
 * Get deposit statistics
 */
exports.getDepositStats = async (req, res) => {
    try {
        const [totalDeposits, pendingDeposits, approvedDeposits, rejectedDeposits] = await Promise.all([
            Deposit.count(),
            Deposit.count({ where: { status: 'PENDING' } }),
            Deposit.count({ where: { status: 'APPROVED' } }),
            Deposit.count({ where: { status: 'REJECTED' } })
        ]);

        const [totalAmount, approvedAmount] = await Promise.all([
            Deposit.sum('amount') || 0,
            Deposit.sum('amount', { where: { status: 'APPROVED' } }) || 0
        ]);

        // Get today's deposits
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [todayDeposits, todayAmount] = await Promise.all([
            Deposit.count({
                where: {
                    createdAt: { [Op.gte]: todayStart }
                }
            }),
            Deposit.sum('amount', {
                where: {
                    status: 'APPROVED',
                    createdAt: { [Op.gte]: todayStart }
                }
            }) || 0
        ]);

        res.json({
            success: true,
            data: {
                totalDeposits,
                pendingDeposits,
                approvedDeposits,
                rejectedDeposits,
                totalAmount: parseFloat(totalAmount),
                approvedAmount: parseFloat(approvedAmount),
                todayDeposits,
                todayAmount: parseFloat(todayAmount)
            }
        });
    } catch (error) {
        console.error('Get deposit stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve deposit statistics',
            error: error.message
        });
    }
};
