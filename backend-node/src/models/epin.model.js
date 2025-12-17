module.exports = (sequelize, DataTypes) => {
    const EPin = sequelize.define('EPin', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        pinCode: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        generatedBy: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: 'User ID who generated the pin'
        },
        generatedFrom: {
            type: DataTypes.ENUM('ADMIN', 'WALLET', 'DEPOSIT'),
            allowNull: false,
            defaultValue: 'ADMIN'
        },
        status: {
            type: DataTypes.ENUM('AVAILABLE', 'USED', 'EXPIRED', 'BLOCKED'),
            defaultValue: 'AVAILABLE'
        },
        usedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'User ID who used the pin'
        },
        activatedUserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'User ID that was activated with this pin'
        },
        usedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        transactionFee: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'Fee charged for generating pin from wallet'
        },
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'epins',
        timestamps: true,
        indexes: [
            {
                fields: ['pinCode']
            },
            {
                fields: ['generatedBy']
            },
            {
                fields: ['usedBy']
            },
            {
                fields: ['status']
            }
        ]
    });

    EPin.associate = (models) => {
        EPin.belongsTo(models.User, {
            foreignKey: 'generatedBy',
            as: 'generator'
        });
        EPin.belongsTo(models.User, {
            foreignKey: 'usedBy',
            as: 'user'
        });
        EPin.belongsTo(models.User, {
            foreignKey: 'activatedUserId',
            as: 'activatedUser'
        });
    };

    return EPin;
};
