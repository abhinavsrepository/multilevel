const { Installment, Investment, Property, User } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notification.service');

exports.getPendingInstallments = async (req, res) => {
    try {
        const userId = req.user.id;
        const installments = await Installment.findAll({
            where: { userId, status: 'PENDING' },
            include: [{ model: Investment, include: [Property] }]
        });

        res.json({
            success: true,
            data: installments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getOverdueInstallments = async (req, res) => {
    try {
        const userId = req.user.id;
        const installments = await Installment.findAll({
            where: { userId, status: 'OVERDUE' },
            include: [{ model: Investment, include: [Property] }]
        });

        res.json({
            success: true,
            data: installments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Cron job function (to be called by a scheduler)
exports.checkOverdueInstallments = async () => {
    try {
        const today = new Date();
        const overdueInstallments = await Installment.findAll({
            where: {
                status: 'PENDING',
                dueDate: { [Op.lt]: today }
            }
        });

        for (const installment of overdueInstallments) {
            await installment.update({ status: 'OVERDUE' });
            await notificationService.sendNotification(installment.userId, 'Installment Overdue', `Your installment #${installment.id} is overdue.`, 'INSTALLMENT');
        }
    } catch (error) {
        console.error('Error checking overdue installments:', error);
    }
};
