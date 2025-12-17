module.exports = (sequelize, DataTypes) => {
    const Rank = sequelize.define('Rank', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'rank_name'
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: 'display_order'
        },
        requiredDirectReferrals: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'required_direct_referrals'
        },
        requiredTeamInvestment: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'required_team_investment'
        },
        requiredPersonalInvestment: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'required_personal_investment'
        },
        requireActiveLegs: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'required_active_legs'
        },
        oneTimeBonus: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'one_time_bonus'
        },
        monthlyBonus: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'monthly_leadership_bonus'
        },
        commissionBoost: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            field: 'commission_boost_percent'
        },
        benefits: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        tableName: 'rank_settings',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Rank.associate = function (models) {
        Rank.hasMany(models.UserRank, { foreignKey: 'rankId', as: 'UserRanks' });
        Rank.hasMany(models.RankAchievement, { foreignKey: 'rankId', as: 'Achievements' });
        Rank.hasMany(models.RankReward, { foreignKey: 'rankId', as: 'Rewards' });
    };

    return Rank;
};
