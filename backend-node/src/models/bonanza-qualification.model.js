module.exports = (sequelize, DataTypes) => {
    const BonanzaQualification = sequelize.define('BonanzaQualification', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        bonanzaId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'bonanzas',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },

        // Real-time Progress Tracking
        progressData: {
            type: DataTypes.JSONB,
            defaultValue: {},
            comment: 'JSON object tracking: { salesVolume: 0, directReferrals: 0, teamVolume: 0, groupVolumes: [], plotBookings: 0, currentRank, currentClub }'
        },

        // Progress Percentages (for UI display)
        salesProgress: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Percentage of sales volume requirement met (0-100)'
        },
        referralProgress: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Percentage of direct referral requirement met (0-100)'
        },
        teamVolumeProgress: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Percentage of team volume requirement met (0-100)'
        },
        overallProgress: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Overall progress percentage across all criteria (0-100)'
        },

        // Qualification Status
        status: {
            type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'QUALIFIED', 'AWARDED', 'DISQUALIFIED', 'EXPIRED'),
            defaultValue: 'PENDING'
        },

        // Timestamps for Qualification Journey
        firstActivityDate: {
            type: DataTypes.DATE,
            comment: 'When user first made progress towards this bonanza'
        },
        qualifiedDate: {
            type: DataTypes.DATE,
            comment: 'When user met all qualification criteria'
        },
        awardedDate: {
            type: DataTypes.DATE,
            comment: 'When the reward was actually paid out'
        },
        expiryDate: {
            type: DataTypes.DATE,
            comment: 'Calculated expiry date for FROM_JOIN_DATE period type'
        },

        // Reward Details
        rewardAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: 'Actual reward amount calculated for this user'
        },
        rewardType: {
            type: DataTypes.ENUM('FIXED', 'PERCENTAGE', 'POOL_SHARE', 'ITEM')
        },
        poolSharePercentage: {
            type: DataTypes.DECIMAL(5, 4),
            comment: 'If POOL_SHARE, the percentage of pool this user gets'
        },

        // Commission/Income Tracking
        incomeId: {
            type: DataTypes.BIGINT,
            comment: 'Reference to Income record created when reward paid'
        },
        commissionId: {
            type: DataTypes.BIGINT,
            comment: 'Reference to Commission record if applicable'
        },

        // Leaderboard Ranking
        rank: {
            type: DataTypes.INTEGER,
            comment: 'Rank on the leaderboard (1 = first place)'
        },
        leaderboardScore: {
            type: DataTypes.DECIMAL(15, 2),
            comment: 'Score used for leaderboard ranking'
        },

        // Additional Metadata
        notes: {
            type: DataTypes.TEXT,
            comment: 'System-generated notes about qualification/disqualification'
        },
        manualOverride: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this qualification was manually awarded/revoked by admin'
        },
        overrideReason: {
            type: DataTypes.TEXT,
            comment: 'Reason for manual override'
        },
        overrideBy: {
            type: DataTypes.BIGINT,
            comment: 'Admin user ID who performed manual override'
        },

        // Achievement Milestones
        milestonesAchieved: {
            type: DataTypes.JSONB,
            defaultValue: [],
            comment: 'Array of milestone achievements: [{name, achievedDate, value}]'
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['bonanzaId', 'userId'], unique: true },
            { fields: ['bonanzaId', 'status'] },
            { fields: ['userId', 'status'] },
            { fields: ['status'] },
            { fields: ['qualifiedDate'] },
            { fields: ['bonanzaId', 'leaderboardScore'] },
            { fields: ['bonanzaId', 'rank'] }
        ]
    });

    BonanzaQualification.associate = (models) => {
        BonanzaQualification.belongsTo(models.Bonanza, {
            foreignKey: 'bonanzaId',
            as: 'bonanza'
        });

        BonanzaQualification.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        BonanzaQualification.belongsTo(models.Income, {
            foreignKey: 'incomeId',
            as: 'income'
        });
    };

    return BonanzaQualification;
};
