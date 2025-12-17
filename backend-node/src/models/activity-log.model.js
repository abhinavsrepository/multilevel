module.exports = (sequelize, DataTypes) => {
    const ActivityLog = sequelize.define('ActivityLog', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'user_id'
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        entityType: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'entity_type'
        },
        entityId: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'entity_id'
        },
        oldValues: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'old_values'
        },
        newValues: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'new_values'
        },
        ipAddress: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'ip_address'
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'user_agent'
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'error_message'
        }
    }, {
        tableName: 'audit_logs', // Matches schema.sql
        underscored: true,
        timestamps: true,
        updatedAt: false // Only has created_at
    });

    ActivityLog.associate = function (models) {
        ActivityLog.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return ActivityLog;
};
