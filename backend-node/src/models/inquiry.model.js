module.exports = (sequelize, DataTypes) => {
    const Inquiry = sequelize.define('Inquiry', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM(
                'GENERAL',
                'TECHNICAL',
                'ACCOUNT',
                'PAYMENT',
                'WITHDRAWAL',
                'EPIN',
                'COMMISSION',
                'KYC',
                'OTHER'
            ),
            defaultValue: 'GENERAL'
        },
        message: {
            type: DataTypes.TEXT,
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
        response: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        respondedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'Admin user ID who responded'
        },
        respondedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        attachments: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of file paths'
        }
    }, {
        tableName: 'inquiries',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['status']
            },
            {
                fields: ['category']
            },
            {
                fields: ['createdAt']
            }
        ]
    });

    Inquiry.associate = (models) => {
        Inquiry.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        Inquiry.belongsTo(models.User, {
            foreignKey: 'respondedBy',
            as: 'responder'
        });
    };

    return Inquiry;
};
