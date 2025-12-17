const { Withdrawal, User, BankAccount, Wallet, Income, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get all withdrawals
 */
exports.getAllWithdrawals = async (req, res) => {
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

        const { rows: withdrawals, count } = await Withdrawal.findAndCountAll({
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
                    model: BankAccount,
                    as: 'bankAccount'
                }
            ]
        });

        res.json({
            success: true,
            data: {
                withdrawals,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve withdrawals',
            error: error.message
        });
    }
};

/**
 * Get pending withdrawals
 */
exports.getPendingWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.findAll({
            where: { status: 'PENDING' },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'phoneNumber']
                },
                {
                    model: BankAccount,
                    as: 'bankAccount'
                }
            ]
        });

        res.json({
            success: true,
            data: withdrawals
        });
    } catch (error) {
        console.error('Get pending withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve pending withdrawals',
            error: error.message
        });
    }
};

/**
 * Approve withdrawal
 */
exports.approveWithdrawal = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { transactionId, adminNotes } = req.body;

        const withdrawal = await Withdrawal.findByPk(id, {
            include: [{ model: User, as: 'user' }],
            transaction
        });

        if (!withdrawal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        if (withdrawal.status !== 'PENDING') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Withdrawal has already been processed'
            });
        }

        // Update withdrawal status
        await withdrawal.update({
            status: 'PROCESSING',
            approvedBy: req.user.id,
            approvedAt: new Date(),
            transactionId,
            adminNotes
        }, { transaction });

        await transaction.commit();

        // Reload with associations
        await withdrawal.reload({
            include: [
                { model: User, as: 'user' },
                { model: User, as: 'approver' },
                { model: BankAccount, as: 'bankAccount' }
            ]
        });

        res.json({
            success: true,
            message: 'Withdrawal approved successfully',
            data: withdrawal
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Approve withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve withdrawal',
            error: error.message
        });
    }
};

/**
 * Reject withdrawal (credit back to wallet)
 */
exports.rejectWithdrawal = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { rejectionReason, adminNotes } = req.body;

        if (!rejectionReason) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const withdrawal = await Withdrawal.findByPk(id, { transaction });

        if (!withdrawal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'PROCESSING') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Withdrawal cannot be rejected in current status'
            });
        }

        // Credit back to user wallet
        const wallet = await Wallet.findOne({
            where: { userId: withdrawal.userId },
            transaction
        });

        if (wallet) {
            await wallet.increment('commissionBalance', {
                by: parseFloat(withdrawal.amount),
                transaction
            });
        }

        // Update withdrawal status
        await withdrawal.update({
            status: 'REJECTED',
            approvedBy: req.user.id,
            approvedAt: new Date(),
            rejectionReason,
            adminNotes
        }, { transaction });

        await transaction.commit();

        // Reload with associations
        await withdrawal.reload({
            include: [
                { model: User, as: 'user' },
                { model: User, as: 'approver' }
            ]
        });

        res.json({
            success: true,
            message: 'Withdrawal rejected and amount credited back to wallet',
            data: withdrawal
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Reject withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject withdrawal',
            error: error.message
        });
    }
};

/**
 * Mark withdrawal as completed
 */
exports.completeWithdrawal = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { transactionId, adminNotes } = req.body;

        const withdrawal = await Withdrawal.findByPk(id, { transaction });

        if (!withdrawal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        if (withdrawal.status !== 'PROCESSING' && withdrawal.status !== 'APPROVED') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Withdrawal must be in processing or approved status'
            });
        }

        // Update withdrawal status
        await withdrawal.update({
            status: 'COMPLETED',
            processedAt: new Date(),
            transactionId: transactionId || withdrawal.transactionId,
            adminNotes: adminNotes || withdrawal.adminNotes
        }, { transaction });

        // Mark associated incomes as withdrawn
        await Income.update(
            { isWithdrawn: true, withdrawalId: withdrawal.id },
            {
                where: {
                    userId: withdrawal.userId,
                    isWithdrawn: false,
                    status: 'APPROVED'
                },
                transaction
            }
        );

        await transaction.commit();

        // Reload with associations
        await withdrawal.reload({
            include: [
                { model: User, as: 'user' },
                { model: User, as: 'approver' },
                { model: BankAccount, as: 'bankAccount' }
            ]
        });

        res.json({
            success: true,
            message: 'Withdrawal marked as completed',
            data: withdrawal
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Complete withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete withdrawal',
            error: error.message
        });
    }
};

/**
 * Get withdrawal statistics
 */
exports.getWithdrawalStats = async (req, res) => {
    try {
        const [totalWithdrawals, pendingWithdrawals, processingWithdrawals, completedWithdrawals, rejectedWithdrawals] = await Promise.all([
            Withdrawal.count(),
            Withdrawal.count({ where: { status: 'PENDING' } }),
            Withdrawal.count({ where: { status: 'PROCESSING' } }),
            Withdrawal.count({ where: { status: 'COMPLETED' } }),
            Withdrawal.count({ where: { status: 'REJECTED' } })
        ]);

        const [totalAmount, completedAmount, pendingAmount] = await Promise.all([
            Withdrawal.sum('netAmount') || 0,
            Withdrawal.sum('netAmount', { where: { status: 'COMPLETED' } }) || 0,
            Withdrawal.sum('netAmount', { where: { status: 'PENDING' } }) || 0
        ]);

        // Get today's withdrawals
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [todayWithdrawals, todayAmount] = await Promise.all([
            Withdrawal.count({
                where: {
                    createdAt: { [Op.gte]: todayStart }
                }
            }),
            Withdrawal.sum('netAmount', {
                where: {
                    status: 'COMPLETED',
                    createdAt: { [Op.gte]: todayStart }
                }
            }) || 0
        ]);

        res.json({
            success: true,
            data: {
                totalWithdrawals,
                pendingWithdrawals,
                processingWithdrawals,
                completedWithdrawals,
                rejectedWithdrawals,
                totalAmount: parseFloat(totalAmount),
                completedAmount: parseFloat(completedAmount),
                pendingAmount: parseFloat(pendingAmount),
                todayWithdrawals,
                todayAmount: parseFloat(todayAmount)
            }
        });
    } catch (error) {
        console.error('Get withdrawal stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve withdrawal statistics',
            error: error.message
        });
    }
};
