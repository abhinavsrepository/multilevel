module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'transaction_id'
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        type: {
            type: DataTypes.STRING, // CREDIT, DEBIT
            allowNull: false
        },
        category: {
            type: DataTypes.STRING, // COMMISSION, INVESTMENT, PAYOUT, etc.
            allowNull: false
        },
        walletType: {
            type: DataTypes.STRING, // EARNING, BONUS, COMMISSION, INVESTMENT
            allowNull: false,
            field: 'wallet_type'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        balanceBefore: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'balance_before'
        },
        balanceAfter: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'balance_after'
        },
        description: {
            type: DataTypes.TEXT
        },
        referenceId: {
            type: DataTypes.STRING,
            field: 'reference_id'
        },
        referenceType: {
            type: DataTypes.STRING,
            field: 'reference_type'
        },
        status: {
            type: DataTypes.STRING, // SUCCESS, PENDING, FAILED, REVERSED
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.STRING,
            field: 'payment_method'
        },
        ipAddress: {
            type: DataTypes.STRING,
            field: 'ip_address'
        },
        userAgent: {
            type: DataTypes.TEXT,
            field: 'user_agent'
        }
    }, {
        tableName: 'transactions', // Matches schema.sql
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false // No updated_at column in database
    });

    Transaction.associate = function (models) {
        Transaction.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Transaction;
};
