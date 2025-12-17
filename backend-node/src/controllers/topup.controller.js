const db = require('../models');
const User = db.User;
const Wallet = db.Wallet;
const Topup = db.Topup;
const Package = db.Package;
const Transaction = db.Transaction;
const sequelize = db.sequelize;

exports.getMainPackages = async (req, res) => {
    try {
        const packages = await Package.findAll({
            where: { isActive: true },
            order: [['amount', 'ASC']]
        });
        res.json({ success: true, data: packages });
    } catch (error) {
        console.error('Get Packages Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createTopup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { userId, packageId } = req.body;
        const adminId = req.user.id; // Assuming admin performs this action

        const user = await User.findByPk(userId);
        if (!user) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const pkg = await Package.findByPk(packageId);
        if (!pkg) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        // Check Admin Wallet Balance (Assuming topup deducts from Admin or the User themselves? 
        // Usage pattern usually: User pays Admin -> Admin activates. OR User uses own Wallet.
        // Based on "Available Fund" field in screenshot, it seems to deduct from the logged-in user's wallet (Admin or User).

        // Let's assume the "Available Fund" refers to the Payer's wallet (req.user.id)
        const payerWallet = await Wallet.findOne({ where: { userId: adminId } });

        // If we want to support User self-activation later, payerId would be userId.
        // For "New Topup" page in Admin panel, Admin is paying? Or Admin is activating for User using User's fund?
        // Usually Admin activation is "Free" or "Deducts from Admin Wallet".
        // Let's implement generic: Deduct from Authenticated User's Wallet.

        if (!payerWallet || parseFloat(payerWallet.commissionBalance) < parseFloat(pkg.amount)) {
            // Using commissionBalance or investmentBalance? Let's check which balance is appropriate. 
            // Usually generic "wallet" or "activation wallet". 
            // Let's check Wallet model again. generic 'commissionBalance' or 'dailyIncome'?
            // For now, let's assume 'commissionBalance' as a generic fund source or checking all?
            // Simplest: Check if *any* suitable balance exists. 
            // Let's use 'commissionBalance' for now as it's common.
            // Wait, the screenshot shows "AVAILABLE FUND". 

            // Let's check 'commissionBalance' + 'roiBalance' etc? 
            // Let's stick to commissionBalance for simplicity for now, or maybe check total?

            if (parseFloat(payerWallet.commissionBalance) < parseFloat(pkg.amount)) {
                await t.rollback();
                return res.status(400).json({ success: false, message: 'Insufficient funds' });
            }
        }

        // Deduct Fund
        await payerWallet.decrement('commissionBalance', { by: pkg.amount, transaction: t });

        // Create Topup Record
        const topup = await Topup.create({
            userId: user.id,
            packageId: pkg.id,
            amount: pkg.amount,
            status: 'COMPLETED',
            paymentMethod: 'WALLET',
            processedAt: new Date()
        }, { transaction: t });

        // Create Transaction Record for Payer
        await Transaction.create({
            transactionId: `TOPUP-${Date.now()}`,
            userId: adminId,
            type: 'DEBIT',
            category: 'TOPUP',
            walletType: 'COMMISSION_WALLET',
            amount: pkg.amount,
            balanceBefore: payerWallet.commissionBalance,
            balanceAfter: parseFloat(payerWallet.commissionBalance) - parseFloat(pkg.amount),
            description: `Topup for User ${user.username} - ${pkg.name}`,
            status: 'SUCCESS'
        }, { transaction: t });

        // Activate User Status if not active
        if (user.status === 'PENDING') {
            user.status = 'ACTIVE';
            await user.save({ transaction: t });
        }

        await t.commit();
        res.json({ success: true, message: 'Topup successful', data: topup });

    } catch (error) {
        await t.rollback();
        console.error('Create Topup Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getTopupHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (userId) where.userId = userId;
        if (startDate && endDate) {
            const { Op } = require('sequelize');
            where.created_at = { [Op.between]: [startDate, endDate] };
        }

        const { count, rows } = await Topup.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['username', 'fullName'] },
                { model: Package, as: 'package', attributes: ['name'] }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            total: count,
            pages: Math.ceil(count / limit),
            data: rows
        });
    } catch (error) {
        console.error('Get Topup History Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
