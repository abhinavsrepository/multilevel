const { ActivityLog, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getAuditLogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 20, userId, action, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (startDate && endDate) {
        where.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
        where,
        include: [{
            model: User,
            attributes: ['id', 'username', 'email', 'role']
        }],
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
});

exports.logAction = async (userId, action, description, req = null, metadata = null) => {
    try {
        await ActivityLog.create({
            userId,
            action,
            entityType: metadata?.entityType || null,
            entityId: metadata?.entityId || null,
            newValues: metadata ? { description, ...metadata } : { description },
            ipAddress: req ? req.ip : null,
            userAgent: req ? req.get('User-Agent') : null,
            status: 'SUCCESS'
        });
    } catch (error) {
        console.error('Failed to log action:', error);
    }
};
