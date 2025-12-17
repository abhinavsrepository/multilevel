module.exports = (sequelize, DataTypes) => {
    const Announcement = sequelize.define('Announcement', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING, // INFO, WARNING, SUCCESS, ERROR
            defaultValue: 'INFO'
        },
        priority: {
            type: DataTypes.STRING, // LOW, MEDIUM, HIGH
            defaultValue: 'MEDIUM'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
        startDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'start_date'
        },
        endDate: {
            type: DataTypes.DATE,
            field: 'end_date'
        },
        link: {
            type: DataTypes.STRING
        },
        targetRoles: {
            type: DataTypes.ARRAY(DataTypes.STRING), // ADMIN, USER, AGENT, etc.
            defaultValue: ['USER'],
            field: 'target_roles'
        },
        createdBy: {
            type: DataTypes.BIGINT,
            field: 'created_by'
        }
    }, {
        tableName: 'announcements', // Assuming table exists or will be created. Schema doesn't show announcements table? Checking schema.sql again.
        underscored: true,
        timestamps: true
    });

    Announcement.associate = function (models) {
        Announcement.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    };

    return Announcement;
};
