module.exports = (sequelize, DataTypes) => {
    const Deposit = sequelize.define('Deposit', {
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
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.ENUM('BANK_TRANSFER', 'UPI', 'CARD', 'CRYPTO', 'OTHER'),
            allowNull: false,
            defaultValue: 'BANK_TRANSFER'
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'User provided transaction/reference ID'
        },
        paymentProof: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Screenshot/proof file path'
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING'
        },
        approvedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'Admin user ID who approved/rejected'
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'User remarks/notes'
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        epinGenerated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether E-Pin was generated for this deposit'
        },
        epinId: {
            type: DataTypes.BIGINT,
            allowNull: true
        }
    }, {
        tableName: 'deposits',
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

    Deposit.associate = (models) => {
        Deposit.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Deposit.belongsTo(models.User, {
            foreignKey: 'approvedBy',
            as: 'approver'
        });
        Deposit.belongsTo(models.EPin, {
            foreignKey: 'epinId',
            as: 'epin'
        });
    };

    return Deposit;
};
