module.exports = (sequelize, DataTypes) => {
    const FastStartBonus = sequelize.define('FastStartBonus', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        targetSales: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Target number of sales required'
        },
        targetRecruits: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Target number of recruits required'
        },
        currentSales: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Current number of sales achieved'
        },
        currentRecruits: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Current number of recruits achieved'
        },
        bonusAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Bonus amount if qualified'
        },
        periodDays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60,
            comment: 'Number of days to complete the challenge'
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Challenge start date'
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Challenge end date'
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED'),
            defaultValue: 'ACTIVE'
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'fast_start_bonuses',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['endDate']
            }
        ]
    });

    FastStartBonus.associate = (models) => {
        FastStartBonus.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return FastStartBonus;
};
