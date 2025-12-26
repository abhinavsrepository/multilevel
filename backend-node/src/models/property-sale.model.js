module.exports = (sequelize, DataTypes) => {
    const PropertySale = sequelize.define('PropertySale', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        saleId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            field: 'sale_id',
            comment: 'Unique sale identifier'
        },
        propertyId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'property_id',
            comment: 'Property being sold'
        },
        buyerUserId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'buyer_user_id',
            comment: 'User who purchased the property'
        },
        employeeUserId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'employee_user_id',
            comment: 'Employee/Agent who made the sale'
        },
        saleAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'sale_amount',
            comment: 'Total sale amount'
        },
        downPayment: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'down_payment',
            comment: 'Down payment amount'
        },
        installmentPlan: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'installment_plan',
            comment: 'Installment plan if applicable (e.g., 12_MONTHS, 24_MONTHS)'
        },
        totalInstallments: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'total_installments',
            comment: 'Total number of installments'
        },
        installmentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'installment_amount',
            comment: 'Amount per installment'
        },
        saleDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'sale_date',
            comment: 'Date of sale'
        },
        saleStatus: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'),
            allowNull: false,
            defaultValue: 'PENDING',
            field: 'sale_status',
            comment: 'Status of the sale'
        },
        commissionEligible: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'commission_eligible',
            comment: 'Whether this sale is eligible for downline commissions'
        },
        commissionActivated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'commission_activated',
            comment: 'Whether commissions have been activated'
        },
        commissionActivatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'commission_activated_at',
            comment: 'When commissions were activated'
        },
        commissionActivatedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'commission_activated_by',
            comment: 'Admin who activated commissions'
        },
        approvedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'approved_by',
            comment: 'Admin who approved the sale'
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'approved_at',
            comment: 'When the sale was approved'
        },
        rejectedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'rejected_by',
            comment: 'Admin who rejected the sale'
        },
        rejectedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'rejected_at',
            comment: 'When the sale was rejected'
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'rejection_reason',
            comment: 'Reason for rejection'
        },
        buyerDetails: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'buyer_details',
            comment: 'Additional buyer information (name, contact, etc.)'
        },
        saleDocuments: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'sale_documents',
            comment: 'URLs of sale documents (agreement, receipts, etc.)'
        },
        paymentDetails: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'payment_details',
            comment: 'Payment method and transaction details'
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Additional remarks or notes'
        },
        adminRemarks: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'admin_remarks',
            comment: 'Admin notes on the sale'
        },
        // Proclaim Sale Enhancement Fields
        saleType: {
            type: DataTypes.ENUM('PRIMARY_BOOKING', 'FULL_PAYMENT'),
            allowNull: true,
            defaultValue: 'FULL_PAYMENT',
            field: 'sale_type',
            comment: 'Type of sale: PRIMARY_BOOKING (25% down) or FULL_PAYMENT'
        },
        plotSize: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'plot_size',
            comment: 'Plot size in square feet'
        },
        pricePerSqFt: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'price_per_sq_ft',
            comment: 'Price per square foot (₹550-₹1499 range)'
        },
        isSelfCode: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_self_code',
            comment: 'Whether this is a self-code sale (Associate = Buyer)'
        },
        projectedDirectIncentive: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'projected_direct_incentive',
            comment: 'Pre-calculated 5% direct incentive (for UI display)'
        },
        projectedTSB: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'projected_tsb',
            comment: 'Pre-calculated Team Sales Bonus amount (for UI display)'
        },
        actualDirectIncentive: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'actual_direct_incentive',
            comment: 'Actual direct incentive paid after commission activation'
        },
        actualTSB: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            field: 'actual_tsb',
            comment: 'Actual TSB distributed after commission activation'
        },
        distributionMonth: {
            type: DataTypes.STRING(7),
            allowNull: true,
            field: 'distribution_month',
            comment: 'Month of distribution (YYYY-MM format) for monthly payout tracking'
        },
        isDistributed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_distributed',
            comment: 'Whether commission has been distributed for this sale'
        },
        distributedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'distributed_at',
            comment: 'When commission was distributed'
        }
    }, {
        tableName: 'property_sales',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['sale_id'],
                unique: true
            },
            {
                fields: ['property_id']
            },
            {
                fields: ['buyer_user_id']
            },
            {
                fields: ['employee_user_id']
            },
            {
                fields: ['sale_status']
            },
            {
                fields: ['commission_eligible']
            },
            {
                fields: ['commission_activated']
            },
            {
                fields: ['sale_date']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['sale_type']
            },
            {
                fields: ['is_self_code']
            },
            {
                fields: ['distribution_month']
            },
            {
                fields: ['is_distributed']
            }
        ]
    });

    PropertySale.associate = (models) => {
        PropertySale.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            as: 'property'
        });
        PropertySale.belongsTo(models.User, {
            foreignKey: 'buyerUserId',
            as: 'buyer'
        });
        PropertySale.belongsTo(models.User, {
            foreignKey: 'employeeUserId',
            as: 'employee'
        });
        PropertySale.belongsTo(models.User, {
            foreignKey: 'approvedBy',
            as: 'approver'
        });
        PropertySale.belongsTo(models.User, {
            foreignKey: 'rejectedBy',
            as: 'rejector'
        });
        PropertySale.belongsTo(models.User, {
            foreignKey: 'commissionActivatedBy',
            as: 'commissionActivator'
        });
    };

    return PropertySale;
};
