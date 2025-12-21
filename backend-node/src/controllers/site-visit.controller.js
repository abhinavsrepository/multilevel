const { SiteVisit, User, Property, sequelize } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const whereClause = {};

        if (role === 'CUSTOMER') {
            whereClause.clientId = userId;
        } else if (role === 'ASSOCIATE') {
            whereClause.associateId = userId;
        }

        const visits = await SiteVisit.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'Client', attributes: ['fullName'] },
                { model: Property, attributes: ['title'] }
            ],
            order: [['visitDate', 'ASC'], ['visitTime', 'ASC']]
        });

        // Transform if needed to match frontend
        const formattedVisits = visits.map(visit => ({
            id: visit.id,
            clientId: visit.clientId,
            clientName: visit.Client ? visit.Client.fullName : 'Unknown',
            propertyId: visit.propertyId,
            propertyTitle: visit.Property ? visit.Property.title : 'Unknown',
            associateId: visit.associateId,
            visitDate: visit.visitDate,
            visitTime: visit.visitTime,
            status: visit.status,
            notes: visit.notes,
            createdAt: visit.createdAt,
            updatedAt: visit.updatedAt
        }));

        res.json({
            success: true,
            data: formattedVisits,
            pagination: { total: visits.length, page: 1, pages: 1 } // Mock pagination
        });
    } catch (error) {
        console.error('Get Site Visits Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getById = async (req, res) => {
    // Mock
    res.status(404).json({ message: 'Not implemented' });
};

exports.create = async (req, res) => {
    try {
        const { propertyId, visitDate, visitTime, notes } = req.body;
        const userId = req.user.id;

        // Mock Associate assignment (self or random for now)
        const associateId = userId;

        const visit = await SiteVisit.create({
            clientId: userId,
            propertyId,
            associateId: 1, // Defaulting to Admin/First User as associate for demo
            visitDate,
            visitTime,
            notes,
            status: 'SCHEDULED'
        });

        res.status(201).json({ success: true, data: visit });
    } catch (error) {
        console.error('Create Site Visit Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
