const { Investment, User, Property, Installment } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

exports.getInvestments = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.investmentStatus = status;
        }

        if (search) {
            where[Op.or] = [
                { investmentId: { [Op.like]: `%${search}%` } },
                { '$User.username$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } },
                { '$Property.title$': { [Op.like]: `%${search}%` } }
            ];
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Investment.findAndCountAll({
            where,
            include: [
                { model: User, attributes: ['id', 'username', 'email', 'firstName', 'lastName'] },
                { model: Property, attributes: ['id', 'title', 'propertyId'] }
            ],
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
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInvestmentStats = async (req, res) => {
    try {
        const totalInvested = await Investment.sum('investmentAmount', { where: { investmentStatus: 'ACTIVE' } });
        const totalInvestments = await Investment.count();
        const activeInvestments = await Investment.count({ where: { investmentStatus: 'ACTIVE' } });
        const totalROI = await Investment.sum('roiEarned');

        res.json({
            success: true,
            data: {
                totalInvested: totalInvested || 0,
                totalInvestments,
                activeInvestments,
                totalROI: totalROI || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveInvestment = async (req, res) => {
    try {
        const investment = await Investment.findByPk(req.params.id);
        if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });

        if (investment.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Investment already processed' });
        }

        await investment.update({ status: 'ACTIVE', approvedAt: new Date() });
        await notificationService.sendNotification(investment.userId, 'Investment Approved', `Your investment #${investment.id} has been approved.`, 'INVESTMENT');

        res.json({ success: true, message: 'Investment approved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectInvestment = async (req, res) => {
    try {
        const { reason } = req.body;
        const investment = await Investment.findByPk(req.params.id);
        if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });

        if (investment.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Investment already processed' });
        }

        await investment.update({ status: 'REJECTED', rejectionReason: reason });
        await notificationService.sendNotification(investment.userId, 'Investment Rejected', `Your investment #${investment.id} has been rejected.`, 'INVESTMENT');

        res.json({ success: true, message: 'Investment rejected successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelInvestment = async (req, res) => {
    try {
        const { reason } = req.body;
        const investment = await Investment.findByPk(req.params.id);
        if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });

        await investment.update({ status: 'CANCELLED', cancellationReason: reason });
        await notificationService.sendNotification(investment.userId, 'Investment Cancelled', `Your investment #${investment.id} has been cancelled.`, 'INVESTMENT');

        res.json({ success: true, message: 'Investment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstallments = async (req, res) => {
    try {
        const installments = await Installment.findAll({
            where: { investmentId: req.params.id },
            order: [['installmentNumber', 'ASC']]
        });
        res.json({ success: true, data: installments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markInstallmentPaid = async (req, res) => {
    try {
        const installment = await Installment.findByPk(req.params.installmentId);
        if (!installment) return res.status(404).json({ success: false, message: 'Installment not found' });

        await installment.update({ status: 'PAID', paidAt: new Date() });
        res.json({ success: true, message: 'Installment marked as paid' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportInvestments = async (req, res) => {
    try {
        const investments = await Investment.findAll();
        const fields = ['id', 'userId', 'propertyId', 'amount', 'status', 'createdAt'];
        const csv = [
            fields.join(','),
            ...investments.map(i => fields.map(f => i[f]).join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('investments.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
