const { Notification, User } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.getNotifications = catchAsync(async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        // Transform to match frontend interface
        const formatted = notifications.map(n => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.isRead,
            createdAt: n.createdAt
        }));

        res.status(200).json({ status: 'success', data: formatted });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

exports.markAsRead = catchAsync(async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!notification) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({ status: 'success', data: notification });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

exports.markAllAsRead = catchAsync(async (req, res) => {
    try {
        await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { userId: req.user.id, isRead: false } }
        );

        res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

exports.sendManualNotification = catchAsync(async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        if (userId === 'ALL') {
            const users = await User.findAll({ where: { status: 'ACTIVE' } });
            const notifications = users.map(user => ({
                userId: user.id,
                title,
                message,
                type: type || 'GENERAL',
                isRead: false
            }));
            await Notification.bulkCreate(notifications);
        } else {
            await Notification.create({
                userId,
                title,
                message,
                type: type || 'GENERAL',
                isRead: false
            });
        }

        res.status(200).json({ status: 'success', message: 'Notification sent successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

exports.getNotificationSettings = catchAsync(async (req, res) => {
    try {
        // Return default notification settings
        // In a production app, these would be stored in a database table
        const settings = {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            preferences: {
                transactions: true,
                commissions: true,
                bonuses: true,
                referrals: true,
                rankUpdates: true,
                announcements: true,
                systemAlerts: true,
                marketing: false
            }
        };
        res.status(200).json({ success: true, status: 'success', data: settings });
    } catch (error) {
        res.status(500).json({ success: false, status: 'error', message: error.message });
    }
});

exports.updateNotificationSettings = catchAsync(async (req, res) => {
    try {
        // In a production app, you would save these settings to a database
        const settings = req.body;
        res.status(200).json({ success: true, status: 'success', data: settings, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, status: 'error', message: error.message });
    }
});
