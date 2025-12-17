const { Withdrawal, BankAccount, Wallet, User, SystemSettings, Transaction, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Request withdrawal
 */
exports.requestWithdrawal = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { amount, bankAccountId, remarks } = req.body;

        if (!amount || amount <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        // Get withdrawal settings
        const minAmount = await SystemSettings.getSetting('withdrawal_min_amount', 1000);
        const maxAmount = await SystemSettings.getSetting('withdrawal_max_amount', 50000);
        const chargePercent = await SystemSettings.getSetting('withdrawal_transaction_charge_percent', 5);
        const chargeFixed = await SystemSettings.getSetting('withdrawal_transaction_charge_fixed', 0);

        // Validate amount
        if (amount < minAmount) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Minimum withdrawal amount is ₹${minAmount}`
            });
        }

        if (amount > maxAmount) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Maximum withdrawal amount is ₹${maxAmount}`
            });
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({
            where: { userId: req.user.id },
            transaction
        });

        if (!wallet || parseFloat(wallet.commissionBalance) < amount) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        // Calculate charges
        const transactionCharge = (amount * chargePercent / 100) + chargeFixed;
        const netAmount = amount - transactionCharge;

        // Verify bank account
        let bankAccount = null;
        if (bankAccountId) {
            bankAccount = await BankAccount.findOne({
                where: {
                    id: bankAccountId,
                    userId: req.user.id,
                    isVerified: true
                },
                transaction
            });

            if (!bankAccount) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Bank account not found or not verified'
                });
            }
        }

        // Deduct from wallet
        await wallet.decrement('commissionBalance', {
            by: amount,
            transaction
        });

        await wallet.increment('totalWithdrawn', {
            by: amount,
            transaction
        });

        // Create withdrawal request
        const withdrawal = await Withdrawal.create({
            userId: req.user.id,
            amount,
            transactionCharge,
            netAmount,
            withdrawalType: 'BANK_TRANSFER',
            bankAccountId,
            status: 'PENDING',
            remarks
        }, { transaction });

        // Create transaction record
        await Transaction.create({
            userId: req.user.id,
            type: 'WITHDRAWAL_REQUEST',
            amount,
            status: 'PENDING',
            description: `Withdrawal request of ₹${amount} (Net: ₹${netAmount.toFixed(2)})`,
            balanceBefore: parseFloat(wallet.commissionBalance) + amount,
            balanceAfter: parseFloat(wallet.commissionBalance)
        }, { transaction });

        await transaction.commit();

        // Reload with associations
        await withdrawal.reload({
            include: [
                {
                    model: BankAccount,
                    as: 'bankAccount'
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: withdrawal
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Request withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to request withdrawal',
            error: error.message
        });
    }
};

/**
 * Get my withdrawals
 */
exports.getMyWithdrawals = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { userId: req.user.id };

        if (status) {
            where.status = status;
        }

        const { rows: withdrawals, count } = await Withdrawal.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: BankAccount,
                    as: 'bankAccount'
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'firstName', 'lastName']
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
        console.error('Get my withdrawals error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve withdrawals',
            error: error.message
        });
    }
};

/**
 * Get withdrawal limits and settings
 */
exports.getWithdrawalLimits = async (req, res) => {
    try {
        const minAmount = await SystemSettings.getSetting('withdrawal_min_amount', 1000);
        const maxAmount = await SystemSettings.getSetting('withdrawal_max_amount', 50000);
        const chargePercent = await SystemSettings.getSetting('withdrawal_transaction_charge_percent', 5);
        const chargeFixed = await SystemSettings.getSetting('withdrawal_transaction_charge_fixed', 0);

        // Get wallet balance
        const wallet = await Wallet.findOne({
            where: { userId: req.user.id }
        });

        const availableBalance = wallet ? parseFloat(wallet.commissionBalance) : 0;

        res.json({
            success: true,
            data: {
                minAmount,
                maxAmount,
                chargePercent,
                chargeFixed,
                availableBalance
            }
        });
    } catch (error) {
        console.error('Get withdrawal limits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve withdrawal limits',
            error: error.message
        });
    }
};

/**
 * Calculate withdrawal charges
 */
exports.calculateCharges = async (req, res) => {
    try {
        const { amount } = req.query;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const chargePercent = await SystemSettings.getSetting('withdrawal_transaction_charge_percent', 5);
        const chargeFixed = await SystemSettings.getSetting('withdrawal_transaction_charge_fixed', 0);

        const transactionCharge = (parseFloat(amount) * chargePercent / 100) + chargeFixed;
        const netAmount = parseFloat(amount) - transactionCharge;

        res.json({
            success: true,
            data: {
                requestedAmount: parseFloat(amount),
                transactionCharge: parseFloat(transactionCharge.toFixed(2)),
                netAmount: parseFloat(netAmount.toFixed(2)),
                chargePercent,
                chargeFixed
            }
        });
    } catch (error) {
        console.error('Calculate charges error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate charges',
            error: error.message
        });
    }
};

/**
 * Get withdrawal details
 */
exports.getWithdrawalDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const withdrawal = await Withdrawal.findOne({
            where: {
                id,
                userId: req.user.id
            },
            include: [
                {
                    model: BankAccount,
                    as: 'bankAccount'
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ]
        });

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        res.json({
            success: true,
            data: withdrawal
        });
    } catch (error) {
        console.error('Get withdrawal details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve withdrawal details',
            error: error.message
        });
    }
};

/**
 * Cancel pending withdrawal
 */
exports.cancelWithdrawal = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const withdrawal = await Withdrawal.findOne({
            where: {
                id,
                userId: req.user.id,
                status: 'PENDING'
            },
            transaction
        });

        if (!withdrawal) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Pending withdrawal not found'
            });
        }

        // Credit back to wallet
        const wallet = await Wallet.findOne({
            where: { userId: req.user.id },
            transaction
        });

        if (wallet) {
            await wallet.increment('commissionBalance', {
                by: parseFloat(withdrawal.amount),
                transaction
            });
        }

        // Update withdrawal
        await withdrawal.update({
            status: 'REJECTED',
            rejectionReason: 'Cancelled by user'
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Withdrawal cancelled and amount credited back',
            data: withdrawal
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Cancel withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel withdrawal',
            error: error.message
        });
    }
};
