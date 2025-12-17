module.exports = (sequelize, DataTypes) => {
    const RankAchievement = sequelize.define('RankAchievement', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        rankId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'rank_id'
        },
        rankName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'rank_name'
        },
        achievedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'achieved_at'
        },
        // Qualification metrics at time of achievement
        directReferralsCount: {
            type: DataTypes.INTEGER,
            field: 'direct_referrals_count'
        },
        teamInvestmentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'team_investment_amount'
        },
        personalInvestmentAmount: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'personal_investment_amount'
        },
        // Rewards given
        oneTimeBonusGiven: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'one_time_bonus_given'
        },
        bonusPaid: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'bonus_paid'
        },
        bonusPaidAt: {
            type: DataTypes.DATE,
            field: 'bonus_paid_at'
        },
        // Manual or automatic
        manualAssignment: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'manual_assignment'
        },
        assignedBy: {
            type: DataTypes.BIGINT,
            field: 'assigned_by',
            comment: 'Admin user ID who manually assigned this rank'
        },
        notes: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'rank_achievements',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    RankAchievement.associate = function (models) {
        RankAchievement.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
        RankAchievement.belongsTo(models.Rank, { foreignKey: 'rankId', as: 'Rank' });
        RankAchievement.belongsTo(models.User, { foreignKey: 'assignedBy', as: 'AssignedByUser' });
    };

    return RankAchievement;
};
