module.exports = (sequelize, DataTypes) => {
    const BankAccount = sequelize.define('BankAccount', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ifscCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        accountHolderName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        branchName: {
            type: DataTypes.STRING
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'VERIFIED', 'REJECTED'),
            defaultValue: 'PENDING'
        },
        rejectionReason: {
            type: DataTypes.STRING
        }
    });

    BankAccount.associate = function (models) {
        BankAccount.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return BankAccount;
};
