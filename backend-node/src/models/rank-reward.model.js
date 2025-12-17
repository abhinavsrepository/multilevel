module.exports = (sequelize, DataTypes) => {
    const RankReward = sequelize.define('RankReward', {
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
        rewardType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'reward_type',
            comment: 'MONTHLY_LEADERSHIP, ONE_TIME_BONUS, COMMISSION_BOOST'
        },
        rewardAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'reward_amount'
        },
        periodMonth: {
            type: DataTypes.INTEGER,
            field: 'period_month',
            comment: 'Month number (1-12) for monthly rewards'
        },
        periodYear: {
            type: DataTypes.INTEGER,
            field: 'period_year',
            comment: 'Year for monthly rewards'
        },
        status: {
            type: DataTypes.STRING(20),
            defaultValue: 'PENDING',
            comment: 'PENDING, PROCESSED, PAID, FAILED'
        },
        processedAt: {
            type: DataTypes.DATE,
            field: 'processed_at'
        },
        paidAt: {
            type: DataTypes.DATE,
            field: 'paid_at'
        },
        transactionId: {
            type: DataTypes.STRING(50),
            field: 'transaction_id'
        },
        notes: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'rank_rewards',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    RankReward.associate = function (models) {
        RankReward.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
        RankReward.belongsTo(models.Rank, { foreignKey: 'rankId', as: 'Rank' });
    };

    return RankReward;
};
