const propertySaleService = require('../../services/property-sale.service');

/**
 * @desc    Get all property sales
 * @route   GET /api/v1/admin/property-sales
 * @access  Private/Admin
 */
exports.getAllSales = async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            employeeId: req.query.employeeId,
            buyerId: req.query.buyerId,
            propertyId: req.query.propertyId,
            commissionActivated: req.query.commissionActivated,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };

        const result = await propertySaleService.getSales(filters);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching all sales:', error);
        next(error);
    }
};

/**
 * @desc    Get pending sales awaiting approval
 * @route   GET /api/v1/admin/property-sales/pending
 * @access  Private/Admin
 */
exports.getPendingSales = async (req, res, next) => {
    try {
        const filters = {
            status: 'PENDING',
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };

        const result = await propertySaleService.getSales(filters);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching pending sales:', error);
        next(error);
    }
};

/**
 * @desc    Get approved sales with pending commission activation
 * @route   GET /api/v1/admin/property-sales/pending-commission
 * @access  Private/Admin
 */
exports.getPendingCommissionSales = async (req, res, next) => {
    try {
        const filters = {
            status: 'APPROVED',
            commissionActivated: false,
            page: req.query.page || 1,
            limit: req.query.limit || 50
        };

        const result = await propertySaleService.getSales(filters);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching pending commission sales:', error);
        next(error);
    }
};

/**
 * @desc    Approve a property sale
 * @route   PUT /api/v1/admin/property-sales/:id/approve
 * @access  Private/Admin
 */
exports.approveSale = async (req, res, next) => {
    try {
        const saleId = req.params.id;
        const adminUserId = req.user.id;
        const adminRemarks = req.body.adminRemarks;

        const result = await propertySaleService.approveSale(saleId, adminUserId, adminRemarks);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error approving sale:', error);
        next(error);
    }
};

/**
 * @desc    Reject a property sale
 * @route   PUT /api/v1/admin/property-sales/:id/reject
 * @access  Private/Admin
 */
exports.rejectSale = async (req, res, next) => {
    try {
        const saleId = req.params.id;
        const adminUserId = req.user.id;
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const result = await propertySaleService.rejectSale(saleId, adminUserId, rejectionReason);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error rejecting sale:', error);
        next(error);
    }
};

/**
 * @desc    Activate commissions for a sale (trigger downline payments)
 * @route   PUT /api/v1/admin/property-sales/:id/activate-commission
 * @access  Private/Admin
 */
exports.activateCommission = async (req, res, next) => {
    try {
        const saleId = req.params.id;
        const adminUserId = req.user.id;

        const result = await propertySaleService.activateCommissions(saleId, adminUserId);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error activating commission:', error);
        next(error);
    }
};

/**
 * @desc    Get sale statistics
 * @route   GET /api/v1/admin/property-sales/statistics
 * @access  Private/Admin
 */
exports.getSaleStatistics = async (req, res, next) => {
    try {
        const { PropertySale } = require('../../models');
        const { Op } = require('sequelize');

        const { startDate, endDate } = req.query;

        const whereClause = {};
        if (startDate && endDate) {
            whereClause.saleDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Total sales count by status
        const totalSales = await PropertySale.count({ where: whereClause });
        const pendingSales = await PropertySale.count({
            where: { ...whereClause, saleStatus: 'PENDING' }
        });
        const approvedSales = await PropertySale.count({
            where: { ...whereClause, saleStatus: 'APPROVED' }
        });
        const rejectedSales = await PropertySale.count({
            where: { ...whereClause, saleStatus: 'REJECTED' }
        });

        // Commission stats
        const commissionsActivated = await PropertySale.count({
            where: { ...whereClause, commissionActivated: true }
        });
        const commissionsPending = await PropertySale.count({
            where: {
                ...whereClause,
                saleStatus: 'APPROVED',
                commissionActivated: false
            }
        });

        // Total sale amount
        const totalSaleAmount = await PropertySale.sum('saleAmount', {
            where: { ...whereClause, saleStatus: 'APPROVED' }
        }) || 0;

        const averageSaleAmount = approvedSales > 0 ? totalSaleAmount / approvedSales : 0;

        res.status(200).json({
            success: true,
            data: {
                totalSales,
                pendingSales,
                approvedSales,
                rejectedSales,
                commissionsActivated,
                commissionsPending,
                totalSaleAmount: parseFloat(totalSaleAmount),
                averageSaleAmount: parseFloat(averageSaleAmount.toFixed(2))
            }
        });
    } catch (error) {
        console.error('Error fetching sale statistics:', error);
        next(error);
    }
};

/**
 * @desc    Get sale details
 * @route   GET /api/v1/admin/property-sales/:id
 * @access  Private/Admin
 */
exports.getSaleDetails = async (req, res, next) => {
    try {
        const { PropertySale, Property, User } = require('../../models');
        const saleId = req.params.id;

        const sale = await PropertySale.findByPk(saleId, {
            include: [
                {
                    model: Property,
                    as: 'property'
                },
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'username', 'fullName', 'email', 'mobile', 'status', 'kycStatus']
                },
                {
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'username', 'fullName', 'email', 'mobile']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'fullName']
                },
                {
                    model: User,
                    as: 'rejector',
                    attributes: ['id', 'username', 'fullName']
                },
                {
                    model: User,
                    as: 'commissionActivator',
                    attributes: ['id', 'username', 'fullName']
                }
            ]
        });

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        res.status(200).json({
            success: true,
            data: sale
        });
    } catch (error) {
        console.error('Error fetching sale details:', error);
        next(error);
    }
};

module.exports = exports;
