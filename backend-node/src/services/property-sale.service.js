const { PropertySale, Property, User, Notification, Investment } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');
const commissionService = require('./commission.service');

/**
 * Create a new property sale record
 * @param {Object} saleData - Sale information
 * @param {number} employeeUserId - Employee who made the sale
 * @returns {Promise<Object>} Created sale record
 */
exports.createPropertySale = async (saleData, employeeUserId) => {
    const transaction = await db.sequelize.transaction();

    try {
        const {
            propertyId,
            buyerUserId,
            saleAmount,
            downPayment,
            installmentPlan,
            totalInstallments,
            installmentAmount,
            buyerDetails,
            saleDocuments,
            paymentDetails,
            remarks
        } = saleData;

        // Validate property exists
        const property = await Property.findByPk(propertyId);
        if (!property) {
            throw new Error('Property not found');
        }

        // Validate buyer exists
        const buyer = await User.findByPk(buyerUserId);
        if (!buyer) {
            throw new Error('Buyer user not found');
        }

        // Generate unique sale ID
        const saleId = `SALE-${Date.now()}-${employeeUserId}`;

        // Create sale record
        const sale = await PropertySale.create({
            saleId,
            propertyId,
            buyerUserId,
            employeeUserId,
            saleAmount,
            downPayment: downPayment || null,
            installmentPlan: installmentPlan || null,
            totalInstallments: totalInstallments || null,
            installmentAmount: installmentAmount || null,
            saleDate: new Date(),
            saleStatus: 'PENDING',
            commissionEligible: false,
            commissionActivated: false,
            buyerDetails: buyerDetails || null,
            saleDocuments: saleDocuments || null,
            paymentDetails: paymentDetails || null,
            remarks: remarks || null
        }, { transaction });

        // Notify all admins about the new sale
        const admins = await User.findAll({
            where: {
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });

        const notifications = admins.map(admin => ({
            userId: admin.id,
            title: 'New Property Sale Submitted',
            message: `Employee ${buyer.fullName} has submitted a property sale for ${property.title} worth ₹${saleAmount}. Pending approval.`,
            type: 'SALE_PENDING',
            referenceType: 'PROPERTY_SALE',
            referenceId: sale.id,
            isRead: false
        }));

        if (notifications.length > 0) {
            await Notification.bulkCreate(notifications, { transaction });
        }

        await transaction.commit();

        console.log(`✓ Property sale ${saleId} created by employee ${employeeUserId}`);

        return {
            success: true,
            message: 'Property sale submitted successfully. Awaiting admin approval.',
            data: sale
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error creating property sale:', error);
        throw error;
    }
};

/**
 * Approve a property sale
 * @param {number} saleId - Sale ID
 * @param {number} adminUserId - Admin approving the sale
 * @param {string} adminRemarks - Admin remarks
 * @returns {Promise<Object>} Approval result
 */
exports.approveSale = async (saleId, adminUserId, adminRemarks = null) => {
    const transaction = await db.sequelize.transaction();

    try {
        const sale = await PropertySale.findByPk(saleId, {
            include: [
                { model: Property, as: 'property' },
                { model: User, as: 'buyer' },
                { model: User, as: 'employee' }
            ]
        });

        if (!sale) {
            throw new Error('Sale not found');
        }

        if (sale.saleStatus !== 'PENDING') {
            throw new Error(`Sale is already ${sale.saleStatus.toLowerCase()}`);
        }

        // Update sale status
        await sale.update({
            saleStatus: 'APPROVED',
            approvedBy: adminUserId,
            approvedAt: new Date(),
            adminRemarks: adminRemarks
        }, { transaction });

        // Notify employee about approval
        await Notification.create({
            userId: sale.employeeUserId,
            title: 'Property Sale Approved',
            message: `Your property sale for ${sale.property.title} has been approved by admin. You can now request commission activation.`,
            type: 'SALE_APPROVED',
            referenceType: 'PROPERTY_SALE',
            referenceId: sale.id,
            isRead: false
        }, { transaction });

        // Notify buyer
        await Notification.create({
            userId: sale.buyerUserId,
            title: 'Property Purchase Approved',
            message: `Your purchase of ${sale.property.title} has been approved. Welcome to the family!`,
            type: 'PURCHASE_APPROVED',
            referenceType: 'PROPERTY_SALE',
            referenceId: sale.id,
            isRead: false
        }, { transaction });

        await transaction.commit();

        console.log(`✓ Sale ${sale.saleId} approved by admin ${adminUserId}`);

        return {
            success: true,
            message: 'Property sale approved successfully',
            data: sale
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error approving sale:', error);
        throw error;
    }
};

/**
 * Reject a property sale
 * @param {number} saleId - Sale ID
 * @param {number} adminUserId - Admin rejecting the sale
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} Rejection result
 */
exports.rejectSale = async (saleId, adminUserId, rejectionReason) => {
    const transaction = await db.sequelize.transaction();

    try {
        const sale = await PropertySale.findByPk(saleId, {
            include: [
                { model: Property, as: 'property' },
                { model: User, as: 'employee' }
            ]
        });

        if (!sale) {
            throw new Error('Sale not found');
        }

        if (sale.saleStatus !== 'PENDING') {
            throw new Error(`Sale is already ${sale.saleStatus.toLowerCase()}`);
        }

        // Update sale status
        await sale.update({
            saleStatus: 'REJECTED',
            rejectedBy: adminUserId,
            rejectedAt: new Date(),
            rejectionReason: rejectionReason
        }, { transaction });

        // Notify employee about rejection
        await Notification.create({
            userId: sale.employeeUserId,
            title: 'Property Sale Rejected',
            message: `Your property sale for ${sale.property.title} has been rejected. Reason: ${rejectionReason}`,
            type: 'SALE_REJECTED',
            referenceType: 'PROPERTY_SALE',
            referenceId: sale.id,
            isRead: false
        }, { transaction });

        await transaction.commit();

        console.log(`✗ Sale ${sale.saleId} rejected by admin ${adminUserId}`);

        return {
            success: true,
            message: 'Property sale rejected',
            data: sale
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error rejecting sale:', error);
        throw error;
    }
};

/**
 * Activate commissions for a property sale (triggers downline payments)
 * @param {number} saleId - Sale ID
 * @param {number} adminUserId - Admin activating commissions
 * @returns {Promise<Object>} Activation result
 */
exports.activateCommissions = async (saleId, adminUserId) => {
    const transaction = await db.sequelize.transaction();

    try {
        const sale = await PropertySale.findByPk(saleId, {
            include: [
                { model: Property, as: 'property' },
                { model: User, as: 'buyer' },
                { model: User, as: 'employee' }
            ]
        });

        if (!sale) {
            throw new Error('Sale not found');
        }

        if (sale.saleStatus !== 'APPROVED') {
            throw new Error('Sale must be approved before activating commissions');
        }

        if (sale.commissionActivated) {
            throw new Error('Commissions already activated for this sale');
        }

        // Create an investment record to trigger commission calculations
        const investment = await Investment.create({
            investmentId: `INV-SALE-${sale.saleId}`,
            propertyId: sale.propertyId,
            userId: sale.buyerUserId,
            investmentAmount: sale.saleAmount,
            bvAllocated: sale.saleAmount, // Use sale amount as BV
            installmentPlan: sale.installmentPlan || 'FULL_PAYMENT',
            totalInstallments: sale.totalInstallments || 1,
            installmentsPaid: sale.downPayment ? 1 : 0,
            installmentAmount: sale.installmentAmount || sale.saleAmount,
            totalPaid: sale.downPayment || sale.saleAmount,
            pendingAmount: sale.saleAmount - (sale.downPayment || sale.saleAmount),
            nextInstallmentDate: sale.totalInstallments > 1 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
            investmentStatus: 'ACTIVE',
            bookingStatus: 'CONFIRMED',
            commissionEligible: true,
            commissionStatus: 'PENDING',
            remarks: `Created from property sale ${sale.saleId} by employee ${sale.employee.fullName}`,
            propertyDetails: {
                saleId: sale.id,
                employeeId: sale.employeeUserId,
                employeeName: sale.employee.fullName
            }
        }, { transaction });

        // Trigger commission calculation
        await commissionService.calculateLevelCommission(investment);

        // Update sale record
        await sale.update({
            commissionEligible: true,
            commissionActivated: true,
            commissionActivatedAt: new Date(),
            commissionActivatedBy: adminUserId
        }, { transaction });

        // Notify employee
        await Notification.create({
            userId: sale.employeeUserId,
            title: 'Commissions Activated',
            message: `Downline commissions have been activated for your sale of ${sale.property.title}. Your team will now receive their earnings.`,
            type: 'COMMISSION_ACTIVATED',
            referenceType: 'PROPERTY_SALE',
            referenceId: sale.id,
            isRead: false
        }, { transaction });

        // Notify buyer
        await Notification.create({
            userId: sale.buyerUserId,
            title: 'Investment Active',
            message: `Your investment in ${sale.property.title} is now active and eligible for returns.`,
            type: 'INVESTMENT_ACTIVE',
            referenceType: 'INVESTMENT',
            referenceId: investment.id,
            isRead: false
        }, { transaction });

        await transaction.commit();

        console.log(`✓ Commissions activated for sale ${sale.saleId} by admin ${adminUserId}`);

        return {
            success: true,
            message: 'Commissions activated successfully. Downline payments have been triggered.',
            data: {
                sale,
                investment
            }
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Error activating commissions:', error);
        throw error;
    }
};

/**
 * Get all sales with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Sales list
 */
exports.getSales = async (filters = {}) => {
    try {
        const {
            status,
            employeeId,
            buyerId,
            propertyId,
            commissionActivated,
            startDate,
            endDate,
            page = 1,
            limit = 20
        } = filters;

        const where = {};

        if (status) where.saleStatus = status;
        if (employeeId) where.employeeUserId = employeeId;
        if (buyerId) where.buyerUserId = buyerId;
        if (propertyId) where.propertyId = propertyId;
        if (commissionActivated !== undefined) where.commissionActivated = commissionActivated;

        if (startDate && endDate) {
            where.saleDate = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows: sales } = await PropertySale.findAndCountAll({
            where,
            include: [
                {
                    model: Property,
                    as: 'property',
                    attributes: ['id', 'title', 'propertyType', 'city']
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
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return {
            success: true,
            count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
            data: sales
        };

    } catch (error) {
        console.error('Error fetching sales:', error);
        throw error;
    }
};

module.exports = exports;
