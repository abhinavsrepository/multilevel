const { Payout, User } = require('../models');
const notificationService = require('../services/notification.service');

exports.getPayouts = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        const { count, rows } = await Payout.findAndCountAll({
            where,
            include: [{ model: User, attributes: ['id', 'username', 'email'] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
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
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.requestMoreInfo = async (req, res) => {
    try {
        const { message } = req.body;
        const payout = await Payout.findByPk(req.params.id);
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        await notificationService.sendNotification(payout.userId, 'Payout Info Requested', `Admin requested more info: ${message}`, 'PAYOUT');
        res.json({ success: true, message: 'Info requested successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.batchProcess = async (req, res) => {
    try {
        const { payoutIds } = req.body;
        // Mock batch processing
        await Payout.update({ status: 'PROCESSING' }, { where: { payoutId: payoutIds } });
        res.json({ success: true, message: 'Batch processing started' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.retryPayout = async (req, res) => {
    try {
        const payout = await Payout.findByPk(req.params.id);
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        await payout.update({ status: 'REQUESTED' }); // Reset to requested
        res.json({ success: true, message: 'Payout retry initiated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportPayouts = async (req, res) => {
    try {
        const payouts = await Payout.findAll();
        const fields = ['payoutId', 'userId', 'amount', 'status', 'createdAt'];
        const csv = [
            fields.join(','),
            ...payouts.map(p => fields.map(f => p[f]).join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('payouts.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPayoutStats = async (req, res) => {
    try {
        const total = await Payout.sum('amount');
        const pending = await Payout.sum('amount', { where: { status: 'REQUESTED' } });
        const paid = await Payout.sum('amount', { where: { status: 'APPROVED' } }); // Assuming APPROVED means paid

        res.json({
            success: true,
            data: {
                totalPayouts: total || 0,
                pendingPayouts: pending || 0,
                paidPayouts: paid || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
