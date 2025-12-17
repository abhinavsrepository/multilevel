module.exports = (sequelize, DataTypes) => {
    const Wallet = sequelize.define('Wallet', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
            field: 'user_id'
        },
        investmentBalance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'investment_balance'
        },
        commissionBalance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'commission_balance'
        },
        rentalIncomeBalance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'rental_income_balance'
        },
        roiBalance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'roi_balance'
        },
        totalEarned: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_earned'
        },
        totalWithdrawn: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_withdrawn'
        },
        totalInvested: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_invested'
        },
        lockedBalance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'locked_balance'
        }
    }, {
        tableName: 'wallets',
        underscored: true,
        timestamps: true
    });

    Wallet.associate = function (models) {
        Wallet.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Wallet;
};
