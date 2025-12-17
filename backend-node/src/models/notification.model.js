module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read'
        },
        readAt: {
            type: DataTypes.DATE,
            field: 'read_at'
        },
        actionLink: {
            type: DataTypes.STRING,
            field: 'action_link'
        }
    }, {
        tableName: 'notifications', // Matches schema.sql
        underscored: true,
        timestamps: true
    });

    Notification.associate = function (models) {
        Notification.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return Notification;
};
