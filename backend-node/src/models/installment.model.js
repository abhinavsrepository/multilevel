module.exports = (sequelize, DataTypes) => {
    const Installment = sequelize.define('Installment', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        investmentId: {
            type: DataTypes.STRING, // Assuming investmentId is a string based on previous files, or BIGINT if ID
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        installmentNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED'),
            defaultValue: 'PENDING'
        },
        paidAt: {
            type: DataTypes.DATE
        },
        penaltyAmount: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        transactionId: {
            type: DataTypes.STRING
        }
    });

    Installment.associate = function (models) {
        Installment.belongsTo(models.Investment, { foreignKey: 'investmentId', targetKey: 'investmentId' }); // Adjust targetKey if needed
        Installment.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Installment;
};
