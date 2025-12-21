module.exports = (sequelize, DataTypes) => {
    const SiteVisit = sequelize.define('SiteVisit', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        clientId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'client_id'
        },
        propertyId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'property_id'
        },
        associateId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'associate_id'
        },
        visitDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'visit_date'
        },
        visitTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: 'visit_time'
        },
        status: {
            type: DataTypes.ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'),
            defaultValue: 'SCHEDULED',
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'site_visits',
        underscored: true,
        timestamps: true
    });

    SiteVisit.associate = function (models) {
        SiteVisit.belongsTo(models.User, { as: 'Client', foreignKey: 'clientId' });
        SiteVisit.belongsTo(models.User, { as: 'Associate', foreignKey: 'associateId' });
        SiteVisit.belongsTo(models.Property, { foreignKey: 'propertyId' });
    };

    return SiteVisit;
};
