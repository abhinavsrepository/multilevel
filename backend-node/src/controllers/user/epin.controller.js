const { EPin, User, Wallet, Transaction, sequelize } = require('../../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

/**
 * Generate E-Pin from wallet
 */
exports.generateEPinFromWallet = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { amount, count = 1 } = req.body;

        if (!amount || amount <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        if (count < 1 || count > 10) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Count must be between 1 and 10'
            });
        }

        // Get wallet fee setting
        const SystemSettings = require('../../models').SystemSettings;
        const feePercent = await SystemSettings.getSetting('epin_wallet_fee_percent', 10);

        const totalAmount = amount * count;
        const transactionFee = (totalAmount * feePercent) / 100;
        const totalDeduction = totalAmount + transactionFee;

        // Check wallet balance
        const wallet = await Wallet.findOne({
            where: { userId: req.user.id },
            transaction
        });

        if (!wallet || parseFloat(wallet.commissionBalance) < totalDeduction) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Insufficient balance. Required: ₹${totalDeduction.toFixed(2)} (includes ${feePercent}% fee)`
            });
        }

        // Deduct from wallet
        await wallet.decrement('commissionBalance', {
            by: totalDeduction,
            transaction
        });

        // Generate E-Pins
        const epins = [];
        for (let i = 0; i < count; i++) {
            const pinCode = `EP${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

            const epin = await EPin.create({
                pinCode,
                amount,
                generatedBy: req.user.id,
                generatedFrom: 'WALLET',
                transactionFee: transactionFee / count,
                status: 'AVAILABLE'
            }, { transaction });

            epins.push(epin);
        }

        // Create transaction record
        await Transaction.create({
            userId: req.user.id,
            type: 'EPIN_GENERATION',
            amount: totalDeduction,
            status: 'COMPLETED',
            description: `Generated ${count} E-Pin(s) of ₹${amount} each (Fee: ₹${transactionFee.toFixed(2)})`,
            balanceBefore: parseFloat(wallet.commissionBalance) + totalDeduction,
            balanceAfter: parseFloat(wallet.commissionBalance)
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: `${count} E-Pin(s) generated successfully`,
            data: {
                epins,
                totalAmount,
                transactionFee,
                totalDeduction
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Generate E-Pin from wallet error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate E-Pin',
            error: error.message
        });
    }
};

/**
 * Get my E-Pins
 */
exports.getMyEPins = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { generatedBy: req.user.id };

        if (status) {
            where.status = status;
        }

        const { rows: epins, count } = await EPin.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'activatedUser',
                    attributes: ['id', 'username', 'firstName', 'lastName']
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
        console.error('Get my E-Pins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve E-Pins',
            error: error.message
        });
    }
};

/**
 * Verify E-Pin
 */
exports.verifyEPin = async (req, res) => {
    try {
        const { pinCode } = req.body;

        if (!pinCode) {
            return res.status(400).json({
                success: false,
                message: 'Pin code is required'
            });
        }

        const epin = await EPin.findOne({
            where: { pinCode },
            include: [
                {
                    model: User,
                    as: 'generator',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ]
        });

        if (!epin) {
            return res.status(404).json({
                success: false,
                message: 'E-Pin not found'
            });
        }

        const isValid = epin.status === 'AVAILABLE' &&
            (!epin.expiryDate || new Date() < new Date(epin.expiryDate));

        res.json({
            success: true,
            data: {
                isValid,
                epin: {
                    pinCode: epin.pinCode,
                    amount: epin.amount,
                    status: epin.status,
                    expiryDate: epin.expiryDate,
                    generator: epin.generator
                },
                message: isValid ? 'E-Pin is valid' : `E-Pin is ${epin.status.toLowerCase()}`
            }
        });
    } catch (error) {
        console.error('Verify E-Pin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify E-Pin',
            error: error.message
        });
    }
};

/**
 * Activate user with E-Pin
 */
exports.activateUserWithEPin = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { pinCode, userId } = req.body;

        if (!pinCode || !userId) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Pin code and user ID are required'
            });
        }

        // Find E-Pin
        const epin = await EPin.findOne({
            where: { pinCode },
            transaction
        });

        if (!epin) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'E-Pin not found'
            });
        }

        // Check E-Pin status
        if (epin.status !== 'AVAILABLE') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `E-Pin is ${epin.status.toLowerCase()}`
            });
        }

        // Check expiry
        if (epin.expiryDate && new Date() > new Date(epin.expiryDate)) {
            await epin.update({ status: 'EXPIRED' }, { transaction });
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'E-Pin has expired'
            });
        }

        // Find user to activate
        const userToActivate = await User.findByPk(userId, { transaction });

        if (!userToActivate) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Mark E-Pin as used
        await epin.update({
            status: 'USED',
            usedBy: req.user.id,
            activatedUserId: userId,
            usedAt: new Date()
        }, { transaction });

        // Credit amount to user's wallet or activate account
        const wallet = await Wallet.findOne({
            where: { userId },
            transaction
        });

        if (wallet) {
            await wallet.increment('commissionBalance', {
                by: parseFloat(epin.amount),
                transaction
            });
        }

        // Create transaction record
        await Transaction.create({
            userId,
            type: 'EPIN_ACTIVATION',
            amount: epin.amount,
            status: 'COMPLETED',
            description: `Account activated with E-Pin ${pinCode}`,
            balanceBefore: wallet ? parseFloat(wallet.commissionBalance) - parseFloat(epin.amount) : 0,
            balanceAfter: wallet ? parseFloat(wallet.commissionBalance) : 0
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'User activated successfully with E-Pin',
            data: {
                epin: {
                    pinCode: epin.pinCode,
                    amount: epin.amount
                },
                user: {
                    id: userToActivate.id,
                    username: userToActivate.username,
                    email: userToActivate.email
                }
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Activate user with E-Pin error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to activate user',
            error: error.message
        });
    }
};

/**
 * Get E-Pin statistics
 */
exports.getMyEPinStats = async (req, res) => {
    try {
        const [totalGenerated, availableEPins, usedEPins] = await Promise.all([
            EPin.count({ where: { generatedBy: req.user.id } }),
            EPin.count({ where: { generatedBy: req.user.id, status: 'AVAILABLE' } }),
            EPin.count({ where: { generatedBy: req.user.id, status: 'USED' } })
        ]);

        const [totalValue, availableValue] = await Promise.all([
            EPin.sum('amount', { where: { generatedBy: req.user.id } }) || 0,
            EPin.sum('amount', { where: { generatedBy: req.user.id, status: 'AVAILABLE' } }) || 0
        ]);

        res.json({
            success: true,
            data: {
                totalGenerated,
                availableEPins,
                usedEPins,
                totalValue: parseFloat(totalValue),
                availableValue: parseFloat(availableValue)
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
