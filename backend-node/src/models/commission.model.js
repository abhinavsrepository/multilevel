module.exports = (sequelize, DataTypes) => {
    const Commission = sequelize.define('Commission', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        commissionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        fromUserId: {
            type: DataTypes.BIGINT
        },
        commissionType: {
            type: DataTypes.STRING, // DIRECT_REFERRAL, LEVEL_2, LEVEL_3, MATCHING, BV_BASED, etc.
            allowNull: false
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        percentage: {
            type: DataTypes.DECIMAL(5, 2)
        },
        baseAmount: {
            type: DataTypes.DECIMAL(15, 2)
        },
        propertyId: {
            type: DataTypes.STRING
        },
        investmentId: {
            type: DataTypes.STRING
        },
        businessVolume: {
            type: DataTypes.DECIMAL(15, 2)
        },
        description: {
            type: DataTypes.TEXT
        },
        calculationDetails: {
            type: DataTypes.JSONB
        },
        status: {
            type: DataTypes.STRING, // EARNED, CREDITED, PAID, REVERSED
            allowNull: false
        },
        capApplied: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        cappedAmount: {
            type: DataTypes.DECIMAL(15, 2)
        },
        paidAt: {
            type: DataTypes.DATE
        },
        transactionId: {
            type: DataTypes.STRING
        },
        createdBy: {
            type: DataTypes.STRING
        },
        updatedBy: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'commissions',
        underscored: true,
        timestamps: true
    });

    Commission.associate = function (models) {
        Commission.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Commission.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'fromUser' });
    };

    return Commission;
};
