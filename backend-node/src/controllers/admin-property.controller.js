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

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const property = await Property.create(req.body);
        res.status(201).json({ success: true, data: property, message: 'Property created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        await property.update(req.body);
        res.json({ success: true, data: property, message: 'Property updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        await property.destroy();
        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.importProperties = async (req, res) => {
    try {
        // TODO: Implement CSV/Excel import logic
        res.json({ success: true, message: 'Property import functionality coming soon' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadPropertyImages = async (req, res) => {
    try {
        // TODO: Implement image upload logic
        res.json({ success: true, message: 'Property image upload functionality coming soon' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePropertyImage = async (req, res) => {
    try {
        // TODO: Implement image deletion logic
        res.json({ success: true, message: 'Property image deletion functionality coming soon' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadPropertyDocument = async (req, res) => {
    try {
        // TODO: Implement document upload logic
        res.json({ success: true, message: 'Property document upload functionality coming soon' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePropertyDocument = async (req, res) => {
    try {
        // TODO: Implement document deletion logic
        res.json({ success: true, message: 'Property document deletion functionality coming soon' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendUpdateToInvestors = async (req, res) => {
    try {
        const { title, message } = req.body;
        const notificationService = require('../services/notification.service');

        // Get all investors for this property
        const investors = await Investment.findAll({
            where: { propertyId: req.params.id },
            include: [{ model: User, attributes: ['id'] }]
        });

        // Send notification to each investor
        for (const investment of investors) {
            if (investment.User) {
                await notificationService.sendNotification(
                    investment.User.id,
                    title,
                    message,
                    'PROPERTY_UPDATE'
                );
            }
        }

        res.json({ success: true, message: `Update sent to ${investors.length} investors` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
