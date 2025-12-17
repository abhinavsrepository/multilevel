module.exports = (sequelize, DataTypes) => {
    const Package = sequelize.define('Package', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        bv: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        referralCommission: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            field: 'referral_commission'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'packages',
        underscored: true,
        timestamps: true
    });

    return Package;
};
