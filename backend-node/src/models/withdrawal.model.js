module.exports = (sequelize, DataTypes) => {
    const Withdrawal = sequelize.define('Withdrawal', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Requested withdrawal amount'
        },
        transactionCharge: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'Fee/charge deducted'
        },
        netAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Final amount to be paid after charges'
        },
        withdrawalType: {
            type: DataTypes.ENUM('BANK_TRANSFER', 'UPI', 'CRYPTO', 'CHECK', 'OTHER'),
            defaultValue: 'BANK_TRANSFER'
        },
        bankAccountId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'Reference to user bank account'
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED'),
            defaultValue: 'PENDING'
        },
        approvedBy: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Bank transaction reference'
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'withdrawals',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['createdAt']
            }
        ]
    });

    Withdrawal.associate = (models) => {
        Withdrawal.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Withdrawal.belongsTo(models.User, {
            foreignKey: 'approvedBy',
            as: 'approver'
        });
        Withdrawal.belongsTo(models.BankAccount, {
            foreignKey: 'bankAccountId',
            as: 'bankAccount'
        });
    };

    return Withdrawal;
};
