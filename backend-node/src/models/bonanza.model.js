module.exports = (sequelize, DataTypes) => {
    const Bonanza = sequelize.define('Bonanza', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        // Qualification Criteria
        qualificationCriteria: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            comment: 'JSON object containing: { salesVolume, directReferrals, teamVolume, groupRatio: {leg1: 40, leg2: 40, leg3: 20}, minRank, minClub, plotBookings }'
        },

        // Reward Configuration
        rewardType: {
            type: DataTypes.ENUM('FIXED', 'PERCENTAGE', 'POOL_SHARE', 'ITEM'),
            allowNull: false,
            defaultValue: 'FIXED',
            defaultValue: 'FIXED'
        },
        rewardAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: 'Fixed amount or percentage value for reward'
        },
        rewardDescription: {
            type: DataTypes.TEXT,
            comment: 'Description of reward (e.g., "USD 500 cash" or "Luxury vacation package")'
        },
        totalPoolAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: 'Total pool amount if rewardType is POOL_SHARE'
        },

        // Status and Tracking
        status: {
            type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'EXPIRED', 'UPCOMING', 'CANCELLED'),
            defaultValue: 'DRAFT'
        },

        // Participation Limits
        maxQualifiers: {
            type: DataTypes.INTEGER,
            comment: 'Maximum number of users who can qualify (null = unlimited)'
        },
        currentQualifiers: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Current count of qualified users'
        },

        // Time-bound Criteria
        periodType: {
            type: DataTypes.ENUM('FIXED_DATES', 'FROM_JOIN_DATE', 'QUARTERLY', 'MONTHLY'),
            allowNull: false,
            defaultValue: 'FIXED_DATES',
            defaultValue: 'FIXED_DATES'
        },
        periodDays: {
            type: DataTypes.INTEGER,
            comment: 'Number of days from join date if periodType is FROM_JOIN_DATE (e.g., 60 days)'
        },

        // Visibility and Priority
        isVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'Whether to show this bonanza to users'
        },
        priority: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Display priority (higher shows first)'
        },

        // Images and Media
        bannerImage: {
            type: DataTypes.STRING,
            comment: 'URL to bonanza banner image'
        },
        iconImage: {
            type: DataTypes.STRING,
            comment: 'URL to bonanza icon'
        },

        // Financial Tracking
        totalPaidOut: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            comment: 'Total amount paid out so far'
        },

        // Metadata
        createdBy: {
            type: DataTypes.BIGINT,
            comment: 'Admin user ID who created this bonanza'
        },
        lastUpdatedBy: {
            type: DataTypes.BIGINT,
            comment: 'Admin user ID who last updated this bonanza'
        },
        notes: {
            type: DataTypes.TEXT,
            comment: 'Internal admin notes'
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['status'] },
            { fields: ['startDate', 'endDate'] },
            { fields: ['periodType'] },
            { fields: ['createdAt'] }
        ]
    });

    Bonanza.associate = (models) => {
        Bonanza.hasMany(models.BonanzaQualification, {
            foreignKey: 'bonanzaId',
            as: 'qualifications'
        });
    };

    return Bonanza;
};
