const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        // Map username in code to user_id column in DB
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'user_id'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        // Map fullName in code to full_name column in DB
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'full_name'
        },
        // Virtual fields for backward compatibility
        firstName: {
            type: DataTypes.VIRTUAL,
            get() {
                const fullName = this.getDataValue('fullName');
                return fullName ? fullName.split(' ')[0] : '';
            },
            set(value) {
                // No-op or throw error
            }
        },
        lastName: {
            type: DataTypes.VIRTUAL,
            get() {
                const fullName = this.getDataValue('fullName');
                if (!fullName) return '';
                const parts = fullName.split(' ');
                return parts.length > 1 ? parts.slice(1).join(' ') : '.';
            }
        },
        // Map mobile in code to mobile column in DB
        mobile: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            field: 'mobile'
        },
        // Alias for compatibility
        phoneNumber: {
            type: DataTypes.VIRTUAL,
            get() { return this.getDataValue('mobile'); },
            set(val) { this.setDataValue('mobile', val); }
        },
        // Personal Information
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'date_of_birth'
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING,
            allowNull: true
        },
        state: {
            type: DataTypes.STRING,
            allowNull: true
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: 'India'
        },
        referralCode: {
            type: DataTypes.STRING,
            unique: true,
            field: 'referral_code'
        },
        sponsorId: {
            type: DataTypes.STRING, // schema says VARCHAR(20) for sponsor_id (the code, not FK ID)
            field: 'sponsor_id'
        },
        // The foreign key to actual user table ID
        sponsorUserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'sponsor_user_id'
        },
        placementUserId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'placement_user_id'
        },
        placement: {
            type: DataTypes.STRING, // Schema is VARCHAR(10)
            allowNull: true
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        leftBv: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'left_bv'
        },
        rightBv: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'right_bv'
        },
        carryForwardLeft: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'carry_forward_left'
        },
        carryForwardRight: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'carry_forward_right'
        },
        personalBv: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'personal_bv'
        },
        teamBv: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'team_bv'
        },
        // Financial Tracking
        totalInvestment: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_investment'
        },
        totalEarnings: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_earnings'
        },
        totalWithdrawn: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_withdrawn'
        },
        rank: {
            type: DataTypes.STRING,
            defaultValue: 'Associate'
        },
        rankAchievedDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'rank_achieved_date'
        },
        kycStatus: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING',
            field: 'kyc_status'
        },
        kycLevel: {
            type: DataTypes.STRING,
            defaultValue: 'NONE',
            field: 'kyc_level'
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'MEMBER'
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'PENDING'
        },
        totalTeamBusiness: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
            field: 'total_team_business'
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'email_verified'
        },
        phoneVerified: { // Map to mobile_verified
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'mobile_verified'
        },
        // Activation & Login
        activationDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'activation_date'
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'last_login_at'
        },
        lastLoginIp: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'last_login_ip'
        },

        // OTP & Security Fields (Mapped to new columns)
        emailOtp: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'email_otp'
        },
        phoneOtp: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_otp'
        },
        otpExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'otp_expiry'
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'reset_password_token'
        },
        resetPasswordExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'reset_password_expiry'
        },
        profilePhotoUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'profile_picture'
        },

        // Timestamps
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    }, {
        tableName: 'users',
        underscored: true,
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    });

    User.associate = function (models) {
        User.belongsTo(models.User, { as: 'Sponsor', foreignKey: 'sponsor_user_id' });
        User.hasMany(models.User, { as: 'DirectReferrals', foreignKey: 'sponsor_user_id' });
        User.belongsTo(models.User, { as: 'PlacementUser', foreignKey: 'placement_user_id' });
        User.hasMany(models.User, { as: 'Downline', foreignKey: 'placement_user_id' });

        // Rank system associations
        User.hasMany(models.UserRank, { foreignKey: 'userId', as: 'UserRanks' });
        User.hasMany(models.RankAchievement, { foreignKey: 'userId', as: 'RankAchievements' });
        User.hasMany(models.RankReward, { foreignKey: 'userId', as: 'RankRewards' });
    };

    User.prototype.validatePassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};
