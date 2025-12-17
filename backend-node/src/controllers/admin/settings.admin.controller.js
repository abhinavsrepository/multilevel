const { SystemSettings, LevelCommissionRule, Announcement, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get all system settings
 */
exports.getSystemSettings = async (req, res) => {
    try {
        const { category } = req.query;

        const where = { isActive: true };
        if (category) {
            where.category = category;
        }

        const settings = await SystemSettings.findAll({
            where,
            order: [['category', 'ASC'], ['settingKey', 'ASC']]
        });

        // Group by category
        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push({
                key: setting.settingKey,
                value: setting.settingValue,
                type: setting.settingType,
                description: setting.description
            });
            return acc;
        }, {});

        res.json({
            success: true,
            data: grouped
        });
    } catch (error) {
        console.error('Get system settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system settings',
            error: error.message
        });
    }
};

/**
 * Update system setting
 */
exports.updateSystemSetting = async (req, res) => {
    try {
        const { settingKey, settingValue, settingType, category, description } = req.body;

        if (!settingKey) {
            return res.status(400).json({
                success: false,
                message: 'Setting key is required'
            });
        }

        const setting = await SystemSettings.setSetting(
            settingKey,
            settingValue,
            settingType || 'STRING',
            category || 'GENERAL',
            description,
            req.user.id
        );

        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: setting
        });
    } catch (error) {
        console.error('Update system setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update setting',
            error: error.message
        });
    }
};

/**
 * Bulk update settings
 */
exports.bulkUpdateSettings = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { settings } = req.body;

        if (!Array.isArray(settings) || settings.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Settings array is required'
            });
        }

        const updates = [];

        for (const setting of settings) {
            const { settingKey, settingValue, settingType, category, description } = setting;

            if (!settingKey) continue;

            const updated = await SystemSettings.setSetting(
                settingKey,
                settingValue,
                settingType || 'STRING',
                category || 'GENERAL',
                description,
                req.user.id
            );

            updates.push(updated);
        }

        await transaction.commit();

        res.json({
            success: true,
            message: `${updates.length} settings updated successfully`,
            data: updates
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Bulk update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings',
            error: error.message
        });
    }
};

/**
 * Get level commission rules
 */
exports.getLevelCommissionRules = async (req, res) => {
    try {
        const rules = await LevelCommissionRule.findAll({
            where: { isActive: true },
            order: [['level', 'ASC']]
        });

        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        console.error('Get level commission rules error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve level commission rules',
            error: error.message
        });
    }
};

/**
 * Update level commission rule
 */
exports.updateLevelCommissionRule = async (req, res) => {
    try {
        const { level, commissionType, value, requiredRank, isActive } = req.body;

        if (!level || !value) {
            return res.status(400).json({
                success: false,
                message: 'Level and value are required'
            });
        }

        const [rule, created] = await LevelCommissionRule.findOrCreate({
            where: { level },
            defaults: {
                commissionType: commissionType || 'PERCENTAGE',
                value,
                requiredRank,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        if (!created) {
            await rule.update({
                commissionType: commissionType || rule.commissionType,
                value,
                requiredRank: requiredRank !== undefined ? requiredRank : rule.requiredRank,
                isActive: isActive !== undefined ? isActive : rule.isActive
            });
        }

        res.json({
            success: true,
            message: created ? 'Level rule created successfully' : 'Level rule updated successfully',
            data: rule
        });
    } catch (error) {
        console.error('Update level commission rule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update level commission rule',
            error: error.message
        });
    }
};

/**
 * Bulk update level commission rules
 */
exports.bulkUpdateLevelRules = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { rules } = req.body;

        if (!Array.isArray(rules) || rules.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Rules array is required'
            });
        }

        const updates = [];

        for (const ruleData of rules) {
            const { level, commissionType, value, requiredRank, isActive } = ruleData;

            if (!level || !value) continue;

            const [rule, created] = await LevelCommissionRule.findOrCreate({
                where: { level },
                defaults: {
                    commissionType: commissionType || 'PERCENTAGE',
                    value,
                    requiredRank,
                    isActive: isActive !== undefined ? isActive : true
                },
                transaction
            });

            if (!created) {
                await rule.update({
                    commissionType: commissionType || rule.commissionType,
                    value,
                    requiredRank: requiredRank !== undefined ? requiredRank : rule.requiredRank,
                    isActive: isActive !== undefined ? isActive : rule.isActive
                }, { transaction });
            }

            updates.push(rule);
        }

        await transaction.commit();

        res.json({
            success: true,
            message: `${updates.length} level rules updated successfully`,
            data: updates
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Bulk update level rules error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update level rules',
            error: error.message
        });
    }
};

/**
 * Create/Update announcement
 */
exports.manageAnnouncement = async (req, res) => {
    try {
        const { id, title, content, type, priority, expiryDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        let announcement;

        if (id) {
            announcement = await Announcement.findByPk(id);
            if (!announcement) {
                return res.status(404).json({
                    success: false,
                    message: 'Announcement not found'
                });
            }

            await announcement.update({
                title,
                content,
                type: type || announcement.type,
                priority: priority || announcement.priority,
                expiryDate: expiryDate || announcement.expiryDate
            });
        } else {
            announcement = await Announcement.create({
                title,
                content,
                type: type || 'INFO',
                priority: priority || 'MEDIUM',
                expiryDate,
                isActive: true
            });
        }

        res.json({
            success: true,
            message: id ? 'Announcement updated successfully' : 'Announcement created successfully',
            data: announcement
        });
    } catch (error) {
        console.error('Manage announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to manage announcement',
            error: error.message
        });
    }
};

/**
 * Get all announcements
 */
exports.getAllAnnouncements = async (req, res) => {
    try {
        const { isActive } = req.query;

        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        const announcements = await Announcement.findAll({
            where,
            order: [['priority', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: announcements
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve announcements',
            error: error.message
        });
    }
};

/**
 * Delete announcement
 */
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByPk(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        await announcement.destroy();

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete announcement',
            error: error.message
        });
    }
};
