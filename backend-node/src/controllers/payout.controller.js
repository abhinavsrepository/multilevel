const { Payout, Wallet } = require('../models');
const { Op } = require('sequelize');

exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, paymentMethod, bankDetails, upiId } = req.body;
        const userId = req.user.id;

        // KYC Hard Gate
        if (req.user.kycStatus !== 'APPROVED') {
            return res.status(403).json({
                success: false,
                message: 'KYC Verification Required. Please complete your KYC to request withdrawals.'
            });
        }

        // Check wallet balance
        const wallet = await Wallet.findOne({ where: { userId } });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }

        const withdrawableBalance = parseFloat(wallet.commissionBalance) + parseFloat(wallet.rentalIncomeBalance) + parseFloat(wallet.roiBalance) - parseFloat(wallet.lockedBalance);

        if (withdrawableBalance < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient withdrawable balance' });
        }

        // Calculate deductions
        // TDS is already deducted at Source (Income Generation). Only Admin Charge applies here.
        const tdsAmount = 0;
        const adminCharge = amount * 0.02; // 2% Service Fee
        const netAmount = amount - adminCharge;

        // Create payout request
        const payout = await Payout.create({
            payoutId: 'PO' + Date.now(),
            userId,
            requestedAmount: amount,
            tdsAmount,
            adminCharge,
            netAmount,
            paymentMethod,
            bankName: bankDetails?.bankName,
            accountNumber: bankDetails?.accountNumber,
            ifscCode: bankDetails?.ifscCode,
            accountHolderName: bankDetails?.accountHolderName,
            branchName: bankDetails?.branchName,
            upiId,
            status: 'REQUESTED',
            requestedAt: new Date()
        });

        // Deduct from wallet (logic to be refined based on specific balance priority)
        // For simplicity, reducing commission balance first, then others
        // This part requires a more complex logic to distribute deduction across balances
        // For now, we'll just update totalWithdrawn and let the balance calculation handle it dynamically or update specific fields
        // A better approach is to have a single 'currentBalance' or deduct from specific buckets.
        // Let's assume we deduct from commissionBalance for now.
        if (wallet.commissionBalance >= amount) {
            await wallet.decrement('commissionBalance', { by: amount });
        } else {
            // Fallback logic needed
        }
        await wallet.increment('totalWithdrawn', { by: amount });

        res.status(201).json({ success: true, data: payout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPayoutHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Payout.findAndCountAll({
            where: { userId: req.user.id },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['requestedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPayoutDetails = async (req, res) => {
    try {
        const payout = await Payout.findOne({
            where: { payoutId: req.params.payoutId, userId: req.user.id }
        });

        if (payout) {
            res.json({ success: true, data: payout });
        } else {
            res.status(404).json({ success: false, message: 'Payout not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Admin: Get all payouts with filtering
exports.getAllPayouts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, userId } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (userId) where.userId = userId;

        const { count, rows } = await Payout.findAndCountAll({
            where,
            include: [{
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['requestedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Admin: Process payout (Approve, Reject, Pay)
exports.processPayout = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { status, transactionId, remarks } = req.body; // status: APPROVED, REJECTED, PAID

        const payout = await Payout.findOne({ where: { payoutId } });
        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }

        if (payout.status === 'PAID' || payout.status === 'REJECTED') {
            return res.status(400).json({ success: false, message: 'Payout is already finalized' });
        }

        const wallet = await Wallet.findOne({ where: { userId: payout.userId } });

        if (status === 'REJECTED') {
            // Refund the amount to wallet
            if (wallet) {
                await wallet.increment('commissionBalance', { by: payout.requestedAmount });
                await wallet.decrement('totalWithdrawn', { by: payout.requestedAmount });
            }
            payout.status = 'REJECTED';
            payout.remarks = remarks;
        } else if (status === 'APPROVED') {
            payout.status = 'APPROVED';
            payout.remarks = remarks;
        } else if (status === 'PAID') {
            payout.status = 'PAID';
            payout.transactionId = transactionId;
            payout.processedAt = new Date();
            payout.remarks = remarks;
        }

        await payout.save();

        res.json({ success: true, data: payout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Admin: Update payout amount manually
exports.updatePayoutAmount = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const { amount } = req.body;

        const payout = await Payout.findOne({ where: { payoutId } });
        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }

        if (payout.status !== 'REQUESTED' && payout.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Cannot update amount for processed payouts' });
        }

        const oldAmount = parseFloat(payout.requestedAmount);
        const newAmount = parseFloat(amount);
        const difference = newAmount - oldAmount;

        const wallet = await Wallet.findOne({ where: { userId: payout.userId } });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'User wallet not found' });
        }

        // If new amount is higher, check if user has enough balance (technically we already deducted oldAmount, so we need to check if they have enough for the difference)
        // If difference is positive (increase payout), we need to deduct MORE from wallet.
        // If difference is negative (decrease payout), we need to REFUND the difference to wallet.

        if (difference > 0) {
            if (wallet.commissionBalance < difference) {
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance for increase' });
            }
            await wallet.decrement('commissionBalance', { by: difference });
            await wallet.increment('totalWithdrawn', { by: difference });
        } else if (difference < 0) {
            const refund = Math.abs(difference);
            await wallet.increment('commissionBalance', { by: refund });
            await wallet.decrement('totalWithdrawn', { by: refund });
        }

        // Recalculate Admin Charge (TDS is 0 as per new policy)
        const tdsAmount = 0;
        const adminCharge = newAmount * 0.02;
        const netAmount = newAmount - adminCharge;

        payout.requestedAmount = newAmount;
        payout.tdsAmount = tdsAmount;
        payout.adminCharge = adminCharge;
        payout.netAmount = netAmount;

        await payout.save();

        res.json({ success: true, data: payout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
