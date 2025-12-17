const { Wallet, Transaction } = require('../models');
const { Op } = require('sequelize');

exports.getBalance = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ where: { userId: req.user.id } });

        if (!wallet) {
            // Create wallet if not exists
            wallet = await Wallet.create({ userId: req.user.id });
        }

        res.json({
            success: true,
            data: {
                investmentBalance: wallet.investmentBalance,
                commissionBalance: wallet.commissionBalance,
                rentalIncomeBalance: wallet.rentalIncomeBalance,
                roiBalance: wallet.roiBalance,
                totalEarned: wallet.totalEarned,
                totalWithdrawn: wallet.totalWithdrawn,
                totalInvested: wallet.totalInvested,
                lockedBalance: wallet.lockedBalance,
                totalBalance: parseFloat(wallet.investmentBalance) + parseFloat(wallet.commissionBalance) + parseFloat(wallet.rentalIncomeBalance) + parseFloat(wallet.roiBalance)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        console.log('getTransactions called');
        console.log('Transaction model:', Transaction);
        const { page = 1, limit = 20, size, type, category, startDate, endDate } = req.query;

        const limitNum = parseInt(limit) || parseInt(size) || 20;
        let pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) pageNum = 1;

        const offset = (pageNum - 1) * limitNum;

        const where = { userId: req.user.id };
        if (type) where.type = type;
        if (category) where.category = category;
        if (startDate && endDate) {
            where.created_at = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Transaction.findAndCountAll({
            where,
            limit: limitNum,
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: pageNum,
                pages: Math.ceil(count / limitNum)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ where: { userId: req.user.id } });

        if (!wallet) {
            wallet = await Wallet.create({ userId: req.user.id });
        }

        res.json({
            success: true,
            data: {
                totalEarned: wallet.totalEarned,
                totalWithdrawn: wallet.totalWithdrawn,
                totalInvested: wallet.totalInvested,
                currentBalance: parseFloat(wallet.investmentBalance) + parseFloat(wallet.commissionBalance) + parseFloat(wallet.rentalIncomeBalance) + parseFloat(wallet.roiBalance)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTrends = async (req, res) => {
    try {
        const { period = 'MONTH', walletType } = req.query;

        console.log('getTrends called with period:', period, 'walletType:', walletType);
        console.log('User ID:', req.user.id);

        // Calculate date range based on period
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
            case 'WEEK':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'MONTH':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'QUARTER':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'YEAR':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(startDate.getMonth() - 1);
        }

        console.log('Date range:', startDate, 'to', endDate);

        // Build where clause
        const where = {
            userId: req.user.id,
            created_at: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (walletType) {
            where.walletType = walletType;
        }

        console.log('Where clause:', JSON.stringify(where));

        // Fetch transactions
        const transactions = await Transaction.findAll({
            where,
            attributes: ['id', 'type', 'amount', 'created_at'],
            order: [['id', 'ASC']],
            raw: true
        });

        console.log('Found transactions:', transactions.length);

        // Group transactions by date
        const trendMap = {};

        transactions.forEach(txn => {
            try {
                const date = new Date(txn.created_at).toISOString().split('T')[0];

                if (!trendMap[date]) {
                    trendMap[date] = {
                        date,
                        credits: 0,
                        debits: 0,
                        net: 0
                    };
                }

                const amount = parseFloat(txn.amount) || 0;

                if (txn.type === 'CREDIT') {
                    trendMap[date].credits += amount;
                } else if (txn.type === 'DEBIT') {
                    trendMap[date].debits += amount;
                }
            } catch (err) {
                console.error('Error processing transaction:', err, txn);
            }
        });

        // Calculate net for each date and sort by date
        const trends = Object.values(trendMap)
            .map(item => ({
                ...item,
                net: item.credits - item.debits
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Returning trends:', trends.length, 'data points');

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('getTrends error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
