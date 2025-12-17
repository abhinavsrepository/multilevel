module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define('Favorite', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        propertyId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'Properties',
                key: 'id'
            }
        }
    });

    Favorite.associate = function (models) {
        Favorite.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Favorite.belongsTo(models.Property, {
            foreignKey: 'propertyId',
            as: 'property'
        });
    };

    return Favorite;
};
