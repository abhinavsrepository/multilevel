module.exports = (sequelize, DataTypes) => {
    const SupportTicket = sequelize.define('SupportTicket', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING, // GENERAL, TECHNICAL, PAYMENT, INVESTMENT, OTHER
            allowNull: false
        },
        priority: {
            type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            defaultValue: 'MEDIUM'
        },
        status: {
            type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'),
            defaultValue: 'OPEN'
        },
        attachmentUrl: {
            type: DataTypes.STRING
        },
        closedAt: {
            type: DataTypes.DATE
        }
    });

    SupportTicket.associate = function (models) {
        SupportTicket.belongsTo(models.User, { foreignKey: 'userId' });
        SupportTicket.hasMany(models.TicketReply, { foreignKey: 'ticketId', as: 'replies' });
    };

    return SupportTicket;
};
