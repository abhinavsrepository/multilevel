const { User, Investment, Property, sequelize } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = [];

        // 1. Fetch Investment Documents (Agreements, etc.)
        const investments = await Investment.findAll({
            where: { userId },
            include: [{ model: Property, attributes: ['title', 'id'] }]
        });

        investments.forEach(inv => {
            // Check documentUrls JSONB
            if (inv.documentUrls && Array.isArray(inv.documentUrls)) {
                inv.documentUrls.forEach((url, index) => {
                    documents.push({
                        id: parseInt(`${inv.id}${index}`), // Mock ID
                        name: `Investment Doc - ${inv.investmentId}`,
                        type: 'BOOKING',
                        category: 'Investment',
                        fileUrl: url,
                        fileSize: 1024 * 1024, // Mock size
                        uploadedBy: userId,
                        associatedEntity: {
                            type: 'BOOKING',
                            id: inv.id,
                            name: inv.investmentId
                        },
                        uploadedAt: inv.updatedAt,
                        updatedAt: inv.updatedAt
                    });
                });
            } else if (inv.documentUrls && typeof inv.documentUrls === 'object') {
                // Handle object format if applicable
                Object.keys(inv.documentUrls).forEach((key, index) => {
                    documents.push({
                        id: parseInt(`${inv.id}${index}`),
                        name: key,
                        type: 'BOOKING',
                        category: 'Investment',
                        fileUrl: inv.documentUrls[key],
                        fileSize: 1024 * 1024,
                        uploadedBy: userId,
                        associatedEntity: {
                            type: 'BOOKING',
                            id: inv.id,
                            name: inv.investmentId
                        },
                        uploadedAt: inv.updatedAt,
                        updatedAt: inv.updatedAt
                    });
                });
            }

            // Agreement Number as a "virtual" document
            if (inv.agreementNumber) {
                documents.push({
                    id: parseInt(`${inv.id}999`),
                    name: `Agreement - ${inv.agreementNumber}`,
                    type: 'AGREEMENT',
                    category: 'Legal',
                    fileUrl: '#', // Placeholder
                    fileSize: 2048 * 1024,
                    uploadedBy: 1, // Admin
                    associatedEntity: {
                        type: 'BOOKING',
                        id: inv.id,
                        name: inv.investmentId
                    },
                    uploadedAt: inv.agreementDate || inv.createdAt,
                    updatedAt: inv.updatedAt
                });
            }
        });

        // 2. Fetch Property Documents (Brochures, Plans)
        // We get properties via the investments we already fetched to avoid double querying
        const propertyMap = new Map();
        investments.forEach(inv => {
            if (inv.Property && !propertyMap.has(inv.Property.id)) {
                propertyMap.set(inv.Property.id, inv.Property);
            }
        });

        propertyMap.forEach(prop => {
            if (prop.documents && Array.isArray(prop.documents)) {
                prop.documents.forEach((doc, index) => {
                    documents.push({
                        id: parseInt(`${prop.id}${index}888`),
                        name: doc.name || `Property Doc ${index + 1}`,
                        type: 'PROPERTY',
                        category: 'Property',
                        fileUrl: doc.url || '#',
                        fileSize: 1024 * 1024,
                        uploadedBy: 1,
                        associatedEntity: {
                            type: 'PROPERTY',
                            id: prop.id,
                            name: prop.title
                        },
                        uploadedAt: prop.updatedAt,
                        updatedAt: prop.updatedAt
                    });
                });
            }
        });

        // Pagination wrapper
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedDocuments = documents.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedDocuments,
            pagination: {
                total: documents.length,
                page,
                pages: Math.ceil(documents.length / limit)
            }
        });

    } catch (error) {
        console.error('Get Documents Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getById = async (req, res) => {
    // Mock implementation
    res.status(404).json({ message: 'Not implemented' });
};
