module.exports = (sequelize, DataTypes) => {
    const ClubQualification = sequelize.define('ClubQualification', {
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
        clubTierId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'club_tier_id'
        },
        qualificationMonth: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'qualification_month',
            comment: 'First day of the month for which this qualification applies'
        },
        totalTeamBusiness: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'total_team_business',
            comment: 'Total team business including bookings and repayments'
        },
        strongestLegVolume: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'strongest_leg_volume',
            comment: 'Volume from the strongest leg'
        },
        strongestLegUserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'strongest_leg_user_id',
            comment: 'User ID of the strongest leg'
        },
        otherLegsVolume: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'other_legs_volume',
            comment: 'Combined volume from all other legs'
        },
        strongLegPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            field: 'strong_leg_percentage',
            comment: 'Percentage of volume from strongest leg'
        },
        weakLegsPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            field: 'weak_legs_percentage',
            comment: 'Percentage of volume from other legs'
        },
        newSalesVolume: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'new_sales_volume',
            comment: 'New sales generated in current month'
        },
        newSalesPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            field: 'new_sales_percentage',
            comment: 'Percentage of new sales vs previous eligibility'
        },
        bonusAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'bonus_amount',
            comment: 'Calculated bonus amount (1% of team business)'
        },
        tdsAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            field: 'tds_amount',
            comment: 'TDS deducted from bonus'
        },
        netAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'net_amount',
            comment: 'Net amount after TDS deduction'
        },
        incomeId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'income_id',
            comment: 'Reference to the created income entry'
        },
        qualificationStatus: {
            type: DataTypes.ENUM('QUALIFIED', 'DISQUALIFIED_ACTIVATION', 'DISQUALIFIED_KYC', 'DISQUALIFIED_NEW_SALES', 'DISQUALIFIED_BALANCING', 'PENDING'),
            allowNull: false,
            defaultValue: 'PENDING',
            field: 'qualification_status'
        },
        disqualificationReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'disqualification_reason',
            comment: 'Reason if user did not qualify'
        },
        calculationDetails: {
            type: DataTypes.JSONB,
            allowNull: true,
            field: 'calculation_details',
            comment: 'Detailed breakdown of calculations'
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'processed_at'
        }
    }, {
        tableName: 'club_qualifications',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['club_tier_id']
            },
            {
                fields: ['qualification_month']
            },
            {
                fields: ['qualification_status']
            },
            {
                fields: ['user_id', 'club_tier_id', 'qualification_month'],
                unique: true
            }
        ]
    });

    ClubQualification.associate = (models) => {
        ClubQualification.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        ClubQualification.belongsTo(models.ClubTier, {
            foreignKey: 'clubTierId',
            as: 'clubTier'
        });
        ClubQualification.belongsTo(models.User, {
            foreignKey: 'strongestLegUserId',
            as: 'strongestLeg'
        });
        ClubQualification.belongsTo(models.Income, {
            foreignKey: 'incomeId',
            as: 'income'
        });
    };

    return ClubQualification;
};
