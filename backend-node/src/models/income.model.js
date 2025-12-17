module.exports = (sequelize, DataTypes) => {
    const Income = sequelize.define('Income', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        incomeType: {
            type: DataTypes.ENUM(
                'LEVEL_COMMISSION',
                'LEVEL_BONUS',
                'DIRECT_SALES_COMMISSION',
                'REFERRAL',
                'DIRECT_BONUS',
                'FAST_START',
                'CASHBACK',
                'ROI',
                'REPURCHASE',
                'BINARY',
                'MATCHING',
                'RANK_BONUS',
                'LEADERSHIP',
                'OTHER'
            ),
            allowNull: false,
            field: 'income_type'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Level number for level commissions'
        },
        fromUserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'User ID who generated this income',
            field: 'from_user_id'
        },
        referenceType: {
            type: DataTypes.ENUM('INVESTMENT', 'SALE', 'ACTIVATION', 'PURCHASE', 'OTHER'),
            allowNull: true,
            field: 'reference_type'
        },
        referenceId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'ID of investment/sale/etc that generated this income',
            field: 'reference_id'
        },
        percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Commission percentage if applicable'
        },
        baseAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            comment: 'Base amount on which commission was calculated',
            field: 'base_amount'
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED', 'REJECTED'),
            defaultValue: 'APPROVED'
        },
        isWithdrawn: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_withdrawn'
        },
        withdrawalId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'withdrawal_id'
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'processed_at'
        }
    }, {
        tableName: 'incomes',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['income_type']
            },
            {
                fields: ['from_user_id']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    Income.associate = (models) => {
        Income.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Income.belongsTo(models.User, {
            foreignKey: 'fromUserId',
            as: 'fromUser'
        });
        Income.belongsTo(models.Withdrawal, {
            foreignKey: 'withdrawalId',
            as: 'withdrawal'
        });
    };

    return Income;
};
