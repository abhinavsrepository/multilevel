module.exports = (sequelize, DataTypes) => {
    const UserRank = sequelize.define('UserRank', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        rankId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'rank_settings',
                key: 'id'
            }
        },
        achievedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        isCurrent: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        manualAssignment: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        assignedBy: {
            type: DataTypes.BIGINT,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'user_ranks',
        timestamps: true
    });

    UserRank.associate = function (models) {
        UserRank.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
        UserRank.belongsTo(models.Rank, { foreignKey: 'rankId', as: 'Rank' });
        UserRank.belongsTo(models.User, { foreignKey: 'assignedBy', as: 'Assigner' });
    };

    return UserRank;
};
