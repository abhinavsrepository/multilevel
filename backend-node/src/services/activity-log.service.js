const { ActivityLog } = require('../models');

exports.logActivity = async (userId, action, description, req = null, metadata = null) => {
    try {
        const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
        const userAgent = req ? req.headers['user-agent'] : null;

        await ActivityLog.create({
            userId,
            action,
            description,
            ipAddress,
            userAgent,
            metadata
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};
