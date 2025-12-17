module.exports = (sequelize, DataTypes) => {
    const LevelCommissionRule = sequelize.define('LevelCommissionRule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true
        },
        commissionType: {
            type: DataTypes.ENUM('PERCENTAGE', 'FIXED'),
            allowNull: false,
            defaultValue: 'PERCENTAGE'
        },
        value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        requiredRank: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'level_commission_rules',
        timestamps: true
    });

    return LevelCommissionRule;
};
