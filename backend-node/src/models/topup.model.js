module.exports = (sequelize, DataTypes) => {
    const Topup = sequelize.define('Topup', {
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
        packageId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'package_id'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.STRING, // COMPLETED, PENDING, FAILED
            defaultValue: 'COMPLETED'
        },
        paymentMethod: {
            type: DataTypes.STRING,
            defaultValue: 'WALLET',
            field: 'payment_method'
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        processedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'processed_at'
        }
    }, {
        tableName: 'topups',
        underscored: true,
        timestamps: true
    });

    Topup.associate = function (models) {
        Topup.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Topup.belongsTo(models.Package, { foreignKey: 'packageId', as: 'package' });
    };

    return Topup;
};
