const propertySaleService = require('../../services/property-sale.service');

/**
 * @desc    Submit a new property sale
 * @route   POST /api/v1/property-sales
 * @access  Private (Employee/Member)
 */
exports.createSale = async (req, res, next) => {
    try {
        const employeeUserId = req.user.id;

        const saleData = {
            propertyId: req.body.propertyId,
            buyerUserId: req.body.buyerUserId,
            saleAmount: req.body.saleAmount,
            downPayment: req.body.downPayment,
            installmentPlan: req.body.installmentPlan,
            totalInstallments: req.body.totalInstallments,
            installmentAmount: req.body.installmentAmount,
            buyerDetails: req.body.buyerDetails,
            saleDocuments: req.body.saleDocuments,
            paymentDetails: req.body.paymentDetails,
            remarks: req.body.remarks
        };

        // Validation
        if (!saleData.propertyId || !saleData.buyerUserId || !saleData.saleAmount) {
            return res.status(400).json({
                success: false,
                message: 'Property ID, Buyer User ID, and Sale Amount are required'
            });
        }

        const result = await propertySaleService.createPropertySale(saleData, employeeUserId);

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating property sale:', error);
        next(error);
    }
};

/**
 * @desc    Get my sales (as employee)
 * @route   GET /api/v1/property-sales/my-sales
 * @access  Private
 */
exports.getMySales = async (req, res, next) => {
    try {
        const employeeId = req.user.id;

        const filters = {
            employeeId,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            page: req.query.page || 1,
            limit: req.query.limit || 20
        };

        const result = await propertySaleService.getSales(filters);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching my sales:', error);
        next(error);
    }
};

/**
 * @desc    Get my purchases (as buyer)
 * @route   GET /api/v1/property-sales/my-purchases
 * @access  Private
 */
exports.getMyPurchases = async (req, res, next) => {
    try {
        const buyerId = req.user.id;

        const filters = {
            buyerId,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            page: req.query.page || 1,
            limit: req.query.limit || 20
        };

        const result = await propertySaleService.getSales(filters);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching my purchases:', error);
        next(error);
    }
};

/**
 * @desc    Get sale details
 * @route   GET /api/v1/property-sales/:id
 * @access  Private
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
                    attributes: ['id', 'username', 'fullName', 'email', 'mobile']
                },
                {
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'username', 'fullName', 'email']
                },
                {
                    model: User,
                    as: 'approver',
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

        // Check if user is authorized to view this sale
        const userId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';
        const isEmployee = sale.employeeUserId === userId;
        const isBuyer = sale.buyerUserId === userId;

        if (!isAdmin && !isEmployee && !isBuyer) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this sale'
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
