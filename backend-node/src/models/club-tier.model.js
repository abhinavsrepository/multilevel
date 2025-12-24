module.exports = (sequelize, DataTypes) => {
    const ClubTier = sequelize.define('ClubTier', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            field: 'tier_name',
            comment: 'Name of the club tier (e.g., Millionaire Club)'
        },
        requiredTeamBusiness: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'required_team_business',
            comment: 'Required total team business (Primary Booking + Repayments) in INR'
        },
        bonusPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 1.00,
            field: 'bonus_percentage',
            comment: 'Percentage of team business given as bonus'
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: 'display_order',
            comment: 'Order in which tiers are displayed'
        },
        balancingRuleStrong: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 60.00,
            field: 'balancing_rule_strong',
            comment: 'Maximum percentage from strongest leg (default 60%)'
        },
        balancingRuleWeak: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 40.00,
            field: 'balancing_rule_weak',
            comment: 'Minimum percentage from other legs (default 40%)'
        },
        newSalesRequirement: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 10.00,
            field: 'new_sales_requirement',
            comment: 'Minimum new sales percentage required monthly (default 10%)'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active',
            comment: 'Whether this tier is active'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Description of the club tier and its benefits'
        }
    }, {
        tableName: 'club_tiers',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['tier_name'],
                unique: true
            },
            {
                fields: ['display_order'],
                unique: true
            },
            {
                fields: ['is_active']
            }
        ]
    });

    ClubTier.associate = (models) => {
        ClubTier.hasMany(models.ClubQualification, {
            foreignKey: 'clubTierId',
            as: 'qualifications'
        });
    };

    return ClubTier;
};
