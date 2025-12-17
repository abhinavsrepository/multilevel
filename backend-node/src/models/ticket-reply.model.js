module.exports = (sequelize, DataTypes) => {
    const TicketReply = sequelize.define('TicketReply', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        ticketId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT, // Can be user or admin
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isAdminReply: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        attachmentUrl: {
            type: DataTypes.STRING
        }
    });

    TicketReply.associate = function (models) {
        TicketReply.belongsTo(models.SupportTicket, { foreignKey: 'ticketId' });
        TicketReply.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return TicketReply;
};
