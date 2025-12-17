module.exports = (sequelize, DataTypes) => {
    const MatchingBonusDetail = sequelize.define('MatchingBonusDetail', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        incomeId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: 'Reference to the parent income record (incomeType=MATCHING)'
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: 'User receiving the matching bonus'
        },
        downlineUserId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            comment: 'Downline agent whose commission was matched'
        },
        downlineLevel: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Generation/level depth of the downline agent (1, 2, 3, etc.)'
        },
        baseCommissionType: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Type of commission being matched (e.g., BINARY, LEVEL, DIRECT)'
        },
        baseCommissionAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Original commission amount earned by downline agent'
        },
        matchedPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            comment: 'Percentage rate applied based on rank/level'
        },
        contributionAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            comment: 'Final matched amount: baseCommissionAmount * matchedPercentage / 100'
        },
        cycleStartDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Start date of the commission cycle'
        },
        cycleEndDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'End date of the commission cycle'
        },
        metadata: {
            type: DataTypes.JSONB,
            allowNull: true,
            comment: 'Additional data (leg info, pairing details, etc.)'
        }
    }, {
        tableName: 'matching_bonus_details',
        timestamps: true,
        indexes: [
            {
                fields: ['incomeId']
            },
            {
                fields: ['userId', 'cycleStartDate', 'cycleEndDate']
            },
            {
                fields: ['downlineUserId']
            },
            {
                fields: ['userId', 'createdAt']
            }
        ]
    });

    MatchingBonusDetail.associate = function (models) {
        // Belongs to the parent Income record
        MatchingBonusDetail.belongsTo(models.Income, {
            foreignKey: 'incomeId',
            as: 'Income'
        });

        // Belongs to the user receiving the matching bonus
        MatchingBonusDetail.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'Recipient'
        });

        // Belongs to the downline user whose commission was matched
        MatchingBonusDetail.belongsTo(models.User, {
            foreignKey: 'downlineUserId',
            as: 'DownlineAgent'
        });
    };

    return MatchingBonusDetail;
};
