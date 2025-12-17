const { LevelCommissionRule } = require('../models');
const { Op } = require('sequelize');

exports.getCommissionRules = async (req, res) => {
    try {
        const rules = await LevelCommissionRule.findAll({
            order: [['level', 'ASC']]
        });
        res.json({ success: true, data: rules });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.updateCommissionRules = async (req, res) => {
    try {
        const { rules } = req.body; // Expecting an array of rules

        if (!rules || !Array.isArray(rules)) {
            return res.status(400).json({ success: false, message: 'Invalid data format. Expected an array of rules.' });
        }

        // Transactional update (simplified: delete all and recreate, or update existing)
        // For simplicity, let's upsert each rule based on level

        const updatedRules = [];
        const levelsToKeep = [];

        for (const ruleData of rules) {
            const [rule, created] = await LevelCommissionRule.findOrCreate({
                where: { level: ruleData.level },
                defaults: {
                    commissionType: ruleData.commissionType,
                    value: ruleData.value,
                    requiredRank: ruleData.requiredRank,
                    isActive: ruleData.isActive !== undefined ? ruleData.isActive : true
                }
            });

            if (!created) {
                await rule.update({
                    commissionType: ruleData.commissionType,
                    value: ruleData.value,
                    requiredRank: ruleData.requiredRank,
                    isActive: ruleData.isActive !== undefined ? ruleData.isActive : true
                });
            }
            updatedRules.push(rule);
            levelsToKeep.push(ruleData.level);
        }

        // Delete levels that are not in the new list
        await LevelCommissionRule.destroy({ where: { level: { [Op.notIn]: levelsToKeep } } });

        res.json({ success: true, message: 'Commission rules updated successfully', data: updatedRules });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
