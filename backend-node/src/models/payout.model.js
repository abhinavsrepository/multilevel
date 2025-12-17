module.exports = (sequelize, DataTypes) => {
    const Payout = sequelize.define('Payout', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        payoutId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        requestedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        tdsAmount: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        adminCharge: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        netAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        bankName: {
            type: DataTypes.STRING
        },
        accountNumber: {
            type: DataTypes.STRING
        },
        ifscCode: {
            type: DataTypes.STRING
        },
        accountHolderName: {
            type: DataTypes.STRING
        },
        branchName: {
            type: DataTypes.STRING
        },
        upiId: {
            type: DataTypes.STRING
        },
        paymentMethod: {
            type: DataTypes.STRING, // BANK, UPI, WALLET
            allowNull: false
        },
        status: {
            type: DataTypes.STRING, // REQUESTED, APPROVED, PROCESSED, COMPLETED, REJECTED, CANCELLED
            allowNull: false
        },
        remarks: {
            type: DataTypes.TEXT
        },
        rejectionReason: {
            type: DataTypes.TEXT
        },
        paymentProofUrl: {
            type: DataTypes.STRING
        },
        paymentGatewayRef: {
            type: DataTypes.STRING
        },
        utrNumber: {
            type: DataTypes.STRING
        },
        requestedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        approvedAt: {
            type: DataTypes.DATE
        },
        processedAt: {
            type: DataTypes.DATE
        },
        completedAt: {
            type: DataTypes.DATE
        },
        approvedBy: {
            type: DataTypes.STRING
        },
        processedBy: {
            type: DataTypes.STRING
        },
        transactionId: {
            type: DataTypes.STRING
        }
    });

    Payout.associate = function (models) {
        Payout.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };

    return Payout;
};
