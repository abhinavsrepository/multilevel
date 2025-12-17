module.exports = (sequelize, DataTypes) => {
    const Investment = sequelize.define('Investment', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        investmentId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'investment_id'
        },
        propertyId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'property_id'
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        investmentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'investment_amount'
        },
        bvAllocated: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'bv_allocated'
        },
        investmentType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'investment_type'
        },
        installmentPlan: {
            type: DataTypes.STRING,
            field: 'installment_plan'
        },
        totalInstallments: {
            type: DataTypes.INTEGER,
            field: 'total_installments'
        },
        installmentsPaid: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'installments_paid'
        },
        installmentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'installment_amount'
        },
        totalPaid: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_paid'
        },
        pendingAmount: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'pending_amount'
        },
        nextInstallmentDate: {
            type: DataTypes.DATEONLY,
            field: 'next_installment_date'
        },
        paymentMethod: {
            type: DataTypes.STRING,
            field: 'payment_method'
        },
        paymentGatewayRef: {
            type: DataTypes.STRING,
            field: 'payment_gateway_ref'
        },
        commissionEligible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'commission_eligible'
        },
        commissionsPaid: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'commissions_paid'
        },
        commissionStatus: {
            type: DataTypes.STRING,
            field: 'commission_status'
        },
        nomineeName: {
            type: DataTypes.STRING,
            field: 'nominee_name'
        },
        nomineeRelation: {
            type: DataTypes.STRING,
            field: 'nominee_relation'
        },
        nomineeContact: {
            type: DataTypes.STRING,
            field: 'nominee_contact'
        },
        nomineeDob: {
            type: DataTypes.DATEONLY,
            field: 'nominee_dob'
        },
        agreementNumber: {
            type: DataTypes.STRING,
            unique: true,
            field: 'agreement_number'
        },
        agreementDate: {
            type: DataTypes.DATEONLY,
            field: 'agreement_date'
        },
        documentUrls: {
            type: DataTypes.JSONB,
            field: 'document_urls'
        },
        investmentStatus: {
            type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'MATURED', 'EXITED', 'CANCELLED'),
            allowNull: false,
            field: 'investment_status'
        },
        bookingStatus: {
            type: DataTypes.ENUM('PROVISIONAL', 'CONFIRMED', 'CANCELLED'),
            allowNull: false,
            field: 'booking_status'
        },
        expectedMaturityDate: {
            type: DataTypes.DATEONLY,
            field: 'expected_maturity_date'
        },
        currentValue: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'current_value'
        },
        roiEarned: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'roi_earned'
        },
        rentalIncomeEarned: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'rental_income_earned'
        },
        exitRequested: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'exit_requested'
        },
        exitDate: {
            type: DataTypes.DATEONLY,
            field: 'exit_date'
        },
        exitAmount: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'exit_amount'
        },
        capitalGains: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'capital_gains'
        },
        lockInPeriodMonths: {
            type: DataTypes.INTEGER,
            field: 'lock_in_period_months'
        },
        lockInEndDate: {
            type: DataTypes.DATEONLY,
            field: 'lock_in_end_date'
        },
        remarks: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'property_investments', // Matches schema.sql
        underscored: true,
        timestamps: true
    });

    Investment.associate = function (models) {
        Investment.belongsTo(models.User, { foreignKey: 'userId' });
        Investment.belongsTo(models.Property, { foreignKey: 'propertyId' });
    };

    return Investment;
};
