module.exports = (sequelize, DataTypes) => {
    const MatchingBonusConfig = sequelize.define('MatchingBonusConfig', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        rankName: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Rank name (e.g., Associate, Silver Leader, Gold Leader)'
        },
        matchingDepth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of levels/generations to match (0 = no matching)'
        },
        matchingPercentages: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            comment: 'Object mapping level to percentage, e.g., {1: 10, 2: 5, 3: 3}'
        },
        requiresDirectSale: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether user needs a direct sale to be eligible'
        },
        requiresActiveLegs: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether user needs active left/right legs'
        },
        minPersonallySponsored: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Minimum personally sponsored agents required'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Order for displaying ranks (lower = higher rank)'
        }
    }, {
        tableName: 'matching_bonus_configs',
        timestamps: true,
        indexes: [
            {
                fields: ['rankName'],
                unique: true
            },
            {
                fields: ['displayOrder']
            },
            {
                fields: ['isActive']
            }
        ]
    });

    return MatchingBonusConfig;
};
