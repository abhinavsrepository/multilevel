const { Property, User, Investment } = require('../models');
const { Op } = require('sequelize');

exports.getProperties = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }
        if (status) {
            where.status = status;
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
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

exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        await property.update({ status });
        res.json({ success: true, message: 'Property status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleFeatured = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        await property.update({ isFeatured: !property.isFeatured });
        res.json({ success: true, message: 'Property featured status toggled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleTrending = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        await property.update({ isTrending: !property.isTrending });
        res.json({ success: true, message: 'Property trending status toggled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPropertyInvestors = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Investment.findAndCountAll({
            where: { propertyId: req.params.id },
            include: [{ model: User, attributes: ['id', 'username', 'email'] }],
            limit: parseInt(limit),
            offset: parseInt(offset)
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

exports.exportProperties = async (req, res) => {
    try {
        const properties = await Property.findAll();
        const fields = ['id', 'title', 'price', 'location', 'status', 'createdAt'];
        const csv = [
            fields.join(','),
            ...properties.map(p => fields.map(f => p[f]).join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('properties.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
