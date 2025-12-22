const { Property, Favorite, Investment, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const transformProperty = (p) => {
    const json = p.toJSON ? p.toJSON() : p;
    return {
        ...json,
        price: parseFloat(json.basePrice) || 0,
        location: json.address || '',
        area: parseFloat(json.totalArea) || 0,
        areaUnit: 'SQ_FT',
        minInvestment: parseFloat(json.minimumInvestment) || 0,
        maxInvestment: parseFloat(json.minimumInvestment) || 0,
        featured: json.isFeatured,
        trending: false
    };
};

const VISIBLE_STATUSES = ['ACTIVE', 'AVAILABLE', 'BOOKING_OPEN', 'FEW_SLOTS_LEFT', 'SOLD_OUT', 'UPCOMING'];

// ==================== Property Listing Functions ====================

exports.getAllProperties = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, propertyType, location, minPrice, maxPrice, sortBy = 'createdAt', sortDirection = 'DESC' } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) {
            where.status = status;
        } else {
            where.status = { [Op.in]: VISIBLE_STATUSES };
        }

        if (propertyType) where.propertyType = propertyType;
        if (location) {
            where[Op.or] = [
                { city: { [Op.like]: `%${location}%` } },
                { state: { [Op.like]: `%${location}%` } }
            ];
        }
        if (minPrice || maxPrice) {
            where.basePrice = {};
            if (minPrice) where.basePrice[Op.gte] = minPrice;
            if (maxPrice) where.basePrice[Op.lte] = maxPrice;
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortDirection]]
        });

        res.json({
            success: true,
            data: rows.map(transformProperty),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getFeaturedProperties = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: { isFeatured: true, status: { [Op.in]: VISIBLE_STATUSES } },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows.map(transformProperty),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getNewLaunchProperties = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: { isNewLaunch: true, status: { [Op.in]: VISIBLE_STATUSES } },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows.map(transformProperty),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getTrendingProperties = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: { status: { [Op.in]: VISIBLE_STATUSES } },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['views', 'DESC'], ['favoritesCount', 'DESC']]
        });

        res.json({
            success: true,
            data: rows.map(transformProperty),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getRecommendedProperties = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;
        const userId = req.user.id;

        // Get user's previous investments to understand preferences
        const userInvestments = await Investment.findAll({
            where: { userId },
            include: [{ model: Property, as: 'property' }],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        let where = { status: { [Op.in]: VISIBLE_STATUSES } };

        // If user has investment history, recommend similar properties
        if (userInvestments.length > 0) {
            const propertyTypes = [...new Set(userInvestments.map(inv => inv.property?.propertyType).filter(Boolean))];
            const cities = [...new Set(userInvestments.map(inv => inv.property?.city).filter(Boolean))];

            if (propertyTypes.length > 0 || cities.length > 0) {
                where[Op.or] = [];
                if (propertyTypes.length > 0) where[Op.or].push({ propertyType: { [Op.in]: propertyTypes } });
                if (cities.length > 0) where[Op.or].push({ city: { [Op.in]: cities } });
            }
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['views', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows.map(transformProperty),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Property Details Functions ====================

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (property) {
            // Increment views
            await property.increment('views');
            const json = property.toJSON();
            const formattedProperty = {
                ...json,
                price: parseFloat(json.basePrice) || 0,
                location: json.address || '',
                area: parseFloat(json.totalArea) || 0,
                areaUnit: 'SQ_FT',
                minInvestment: parseFloat(json.minimumInvestment) || 0,
                maxInvestment: parseFloat(json.minimumInvestment) || 0,
                featured: json.isFeatured,
                trending: false
            };
            res.json({ success: true, data: formattedProperty });
        } else {
            res.status(404).json({ success: false, message: 'Property not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertyByPropertyId = async (req, res) => {
    try {
        const property = await Property.findOne({ where: { propertyId: req.params.propertyId } });
        if (property) {
            // Increment views
            await property.increment('views');
            const json = property.toJSON();
            const formattedProperty = {
                ...json,
                price: parseFloat(json.basePrice) || 0,
                location: json.address || '',
                area: parseFloat(json.totalArea) || 0,
                areaUnit: 'SQ_FT',
                minInvestment: parseFloat(json.minimumInvestment) || 0,
                maxInvestment: parseFloat(json.minimumInvestment) || 0,
                featured: json.isFeatured,
                trending: false
            };
            res.json({ success: true, data: formattedProperty });
        } else {
            res.status(404).json({ success: false, message: 'Property not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getSimilarProperties = async (req, res) => {
    try {
        const { page = 1, size = 6 } = req.query;
        const offset = (page - 1) * size;

        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const { count, rows } = await Property.findAndCountAll({
            where: {
                id: { [Op.ne]: property.id },
                status: { [Op.in]: VISIBLE_STATUSES },
                [Op.or]: [
                    { propertyType: property.propertyType },
                    { city: property.city },
                    { state: property.state }
                ]
            },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Search & Filter Functions ====================

exports.searchProperties = async (req, res) => {
    try {
        // Support both GET (query params) and POST (body params)
        const params = req.method === 'POST' ? req.body : req.query;
        const { search, page = 1, size = 20, ...filters } = params;
        const offset = (page - 1) * size;

        const where = {};

        // Handle status filter
        if (filters.status && filters.status.length > 0) {
            where.status = { [Op.in]: Array.isArray(filters.status) ? filters.status : [filters.status] };
        } else {
            where.status = { [Op.in]: VISIBLE_STATUSES };
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } },
                { state: { [Op.like]: `%${search}%` } },
                { propertyType: { [Op.like]: `%${search}%` } }
            ];
        }

        // Apply additional filters
        if (filters.propertyType) where.propertyType = filters.propertyType;
        if (filters.city) where.city = { [Op.like]: `%${filters.city}%` };
        if (filters.state) where.state = { [Op.like]: `%${filters.state}%` };
        if (filters.minPrice || filters.maxPrice) {
            where.basePrice = {};
            if (filters.minPrice) where.basePrice[Op.gte] = filters.minPrice;
            if (filters.maxPrice) where.basePrice[Op.lte] = filters.maxPrice;
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows.map(transformProperty),
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertiesByType = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: { propertyType: req.params.type, status: { [Op.in]: VISIBLE_STATUSES } },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertiesByStatus = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: { status: req.params.status },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertiesByCity = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: {
                city: { [Op.like]: `%${req.params.city}%` },
                status: { [Op.in]: VISIBLE_STATUSES }
            },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertiesByState = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: {
                state: { [Op.like]: `%${req.params.state}%` },
                status: { [Op.in]: VISIBLE_STATUSES }
            },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertiesByPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice, page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const where = { status: { [Op.in]: VISIBLE_STATUSES } };
        if (minPrice || maxPrice) {
            where.basePrice = {};
            if (minPrice) where.basePrice[Op.gte] = minPrice;
            if (maxPrice) where.basePrice[Op.lte] = maxPrice;
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['basePrice', 'ASC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertiesByInvestmentRange = async (req, res) => {
    try {
        const { minInvestment, maxInvestment, page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const where = { status: { [Op.in]: VISIBLE_STATUSES } };
        if (minInvestment || maxInvestment) {
            where.minimumInvestment = {};
            if (minInvestment) where.minimumInvestment[Op.gte] = minInvestment;
            if (maxInvestment) where.minimumInvestment[Op.lte] = maxInvestment;
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['minimumInvestment', 'ASC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Filter & Facet Functions ====================

exports.getPropertyTypes = async (req, res) => {
    try {
        const types = await Property.findAll({
            attributes: [
                'propertyType',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: { [Op.in]: VISIBLE_STATUSES } },
            group: ['propertyType'],
            raw: true
        });

        const result = types.map(t => ({
            type: t.propertyType,
            count: parseInt(t.count)
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getAvailableCities = async (req, res) => {
    try {
        const cities = await Property.findAll({
            attributes: [
                'city',
                'state',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: { [Op.in]: VISIBLE_STATUSES } },
            group: ['city', 'state'],
            order: [['city', 'ASC']],
            raw: true
        });

        const result = cities.map(c => ({
            city: c.city,
            state: c.state,
            count: parseInt(c.count)
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getAvailableStates = async (req, res) => {
    try {
        const states = await Property.findAll({
            attributes: [
                'state',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: { [Op.in]: VISIBLE_STATUSES } },
            group: ['state'],
            order: [['state', 'ASC']],
            raw: true
        });

        const result = states.map(s => ({
            state: s.state,
            count: parseInt(s.count)
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getAvailableAmenities = async (req, res) => {
    try {
        // Get all properties with amenities
        const properties = await Property.findAll({
            attributes: ['amenities'],
            where: {
                status: { [Op.in]: VISIBLE_STATUSES },
                amenities: { [Op.ne]: null }
            },
            raw: true
        });

        const amenitiesCount = {};
        properties.forEach(p => {
            if (p.amenities && Array.isArray(p.amenities)) {
                p.amenities.forEach(amenity => {
                    amenitiesCount[amenity] = (amenitiesCount[amenity] || 0) + 1;
                });
            }
        });

        const result = Object.entries(amenitiesCount).map(([amenity, count]) => ({
            amenity,
            count
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPriceRangeStats = async (req, res) => {
    try {
        const stats = await Property.findOne({
            attributes: [
                [sequelize.fn('MIN', sequelize.col('basePrice')), 'minPrice'],
                [sequelize.fn('MAX', sequelize.col('basePrice')), 'maxPrice'],
                [sequelize.fn('AVG', sequelize.col('basePrice')), 'avgPrice']
            ],
            where: { status: { [Op.in]: VISIBLE_STATUSES } },
            raw: true
        });

        res.json({
            success: true,
            data: {
                minPrice: parseFloat(stats.minPrice) || 0,
                maxPrice: parseFloat(stats.maxPrice) || 0,
                avgPrice: parseFloat(stats.avgPrice) || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getInvestmentRangeStats = async (req, res) => {
    try {
        const stats = await Property.findOne({
            attributes: [
                [sequelize.fn('MIN', sequelize.col('minimumInvestment')), 'minInvestment'],
                [sequelize.fn('MAX', sequelize.col('minimumInvestment')), 'maxInvestment'],
                [sequelize.fn('AVG', sequelize.col('minimumInvestment')), 'avgInvestment']
            ],
            where: { status: { [Op.in]: VISIBLE_STATUSES } },
            raw: true
        });

        res.json({
            success: true,
            data: {
                minInvestment: parseFloat(stats.minInvestment) || 0,
                maxInvestment: parseFloat(stats.maxInvestment) || 0,
                avgInvestment: parseFloat(stats.avgInvestment) || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Property Statistics Functions ====================

exports.getPropertyStats = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const investments = await Investment.findAll({
            where: { propertyId: property.id },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'investorsCount'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalInvestments'],
                [sequelize.fn('AVG', sequelize.col('amount')), 'averageInvestment']
            ],
            raw: true
        });

        const stats = investments[0];
        const bookingProgress = (property.slotsBooked / property.totalInvestmentSlots) * 100;

        res.json({
            success: true,
            data: {
                totalInvestments: parseFloat(stats.totalInvestments) || 0,
                totalInvestorsCount: parseInt(stats.investorsCount) || 0,
                averageInvestment: parseFloat(stats.averageInvestment) || 0,
                bookingProgress: bookingProgress.toFixed(2),
                views: property.views || 0,
                favorites: property.favoritesCount || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertyRecentInvestments = async (req, res) => {
    try {
        const { page = 1, size = 10 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Investment.findAndCountAll({
            where: { propertyId: req.params.id },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'firstName', 'lastName'] }],
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Property Documents Functions ====================

exports.getPropertyDocuments = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({
            success: true,
            data: property.documents || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Property Media Functions ====================

exports.getPropertyImages = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({
            success: true,
            data: property.images || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPropertyVideos = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        res.json({
            success: true,
            data: property.videos || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Favorites Functions ====================

exports.getFavoriteProperties = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;
        const userId = req.user.id;

        const { count, rows } = await Favorite.findAndCountAll({
            where: { userId },
            include: [{ model: Property, as: 'property' }],
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        const properties = rows.map(fav => fav.property);

        res.json({
            success: true,
            data: properties,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.addToFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.id;

        const property = await Property.findByPk(propertyId);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const existing = await Favorite.findOne({ where: { userId, propertyId } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Property already in favorites' });
        }

        await Favorite.create({ userId, propertyId });
        await property.increment('favoritesCount');

        res.json({ success: true, message: 'Property added to favorites' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.removeFromFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.id;

        const favorite = await Favorite.findOne({ where: { userId, propertyId } });
        if (!favorite) {
            return res.status(404).json({ success: false, message: 'Property not in favorites' });
        }

        await favorite.destroy();

        const property = await Property.findByPk(propertyId);
        if (property && property.favoritesCount > 0) {
            await property.decrement('favoritesCount');
        }

        res.json({ success: true, message: 'Property removed from favorites' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.isPropertyFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const propertyId = req.params.id;

        const favorite = await Favorite.findOne({ where: { userId, propertyId } });

        res.json({
            success: true,
            data: { isFavorite: !!favorite }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Property Comparison Functions ====================

exports.compareProperties = async (req, res) => {
    try {
        const { propertyIds } = req.query;

        if (!propertyIds) {
            return res.status(400).json({ success: false, message: 'Property IDs are required' });
        }

        const ids = propertyIds.split(',').map(id => parseInt(id));
        const properties = await Property.findAll({
            where: { id: { [Op.in]: ids } }
        });

        res.json({ success: true, data: properties });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Developer Functions ====================

exports.getPropertiesByDeveloper = async (req, res) => {
    try {
        const { page = 1, size = 20 } = req.query;
        const offset = (page - 1) * size;

        const { count, rows } = await Property.findAndCountAll({
            where: {
                developerName: req.params.developerId,
                status: 'ACTIVE'
            },
            limit: parseInt(size),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / size)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getDeveloperDetails = async (req, res) => {
    try {
        const properties = await Property.findAll({
            where: { developerName: req.params.developerId },
            limit: 1
        });

        if (properties.length === 0) {
            return res.status(404).json({ success: false, message: 'Developer not found' });
        }

        const property = properties[0];
        const totalProperties = await Property.count({
            where: { developerName: req.params.developerId }
        });

        res.json({
            success: true,
            data: {
                name: property.developerName,
                contact: property.developerContact,
                email: property.developerEmail,
                totalProperties
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== CRUD Functions (Admin) ====================

exports.createProperty = async (req, res) => {
    try {
        console.log('Creating property with data:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        const requiredFields = ['propertyId', 'title', 'propertyType', 'propertyCategory', 'address', 'city', 'state', 'basePrice', 'totalInvestmentSlots'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                errors: missingFields.map(field => `${field} is required`)
            });
        }

        const property = await Property.create(req.body);
        console.log('Property created successfully:', property.id);
        res.status(201).json({ success: true, data: property });
    } catch (error) {
        console.error('Error creating property:', error);
        console.error('Error stack:', error.stack);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message)
            });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Property ID already exists',
                errors: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (property) {
            await property.update(req.body);
            res.json({ success: true, data: property });
        } else {
            res.status(404).json({ success: false, message: 'Property not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (property) {
            await property.destroy();
            res.json({ success: true, message: 'Property deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Property not found' });
        }
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: error.errors.map(e => e.message)
            });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Duplicate Entry',
                errors: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
