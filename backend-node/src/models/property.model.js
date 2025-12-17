module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('Property', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        propertyId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'property_id'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        propertyType: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'property_type'
        },
        propertyCategory: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'property_category'
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pincode: {
            type: DataTypes.STRING
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8)
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8)
        },
        googleMapsLink: {
            type: DataTypes.STRING,
            field: 'google_maps_link'
        },
        totalArea: {
            type: DataTypes.DECIMAL(12, 2),
            field: 'total_area'
        },
        builtUpArea: {
            type: DataTypes.DECIMAL(12, 2),
            field: 'built_up_area'
        },
        bedrooms: {
            type: DataTypes.INTEGER
        },
        bathrooms: {
            type: DataTypes.INTEGER
        },
        floors: {
            type: DataTypes.INTEGER
        },
        facing: {
            type: DataTypes.STRING
        },
        furnishingStatus: {
            type: DataTypes.STRING,
            field: 'furnishing_status'
        },
        basePrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            field: 'base_price'
        },
        investmentPrice: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'investment_price'
        },
        minimumInvestment: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'minimum_investment'
        },
        totalInvestmentSlots: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'total_investment_slots'
        },
        slotsBooked: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'slots_booked'
        },
        directReferralCommissionPercent: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'direct_referral_commission_percent'
        },
        bvValue: {
            type: DataTypes.DECIMAL(15, 2),
            field: 'bv_value'
        },
        expectedRoiPercent: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'expected_roi_percent'
        },
        roiTenureMonths: {
            type: DataTypes.INTEGER,
            field: 'roi_tenure_months'
        },
        appreciationRateAnnual: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'appreciation_rate_annual'
        },
        developerName: {
            type: DataTypes.STRING,
            field: 'developer_name'
        },
        developerContact: {
            type: DataTypes.STRING,
            field: 'developer_contact'
        },
        developerEmail: {
            type: DataTypes.STRING,
            field: 'developer_email'
        },
        reraNumber: {
            type: DataTypes.STRING,
            field: 'rera_number'
        },
        images: {
            type: DataTypes.JSONB
        },
        videos: {
            type: DataTypes.JSONB
        },
        virtualTourUrl: {
            type: DataTypes.STRING,
            field: 'virtual_tour_url'
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SOLD_OUT', 'UNDER_MAINTENANCE'),
            defaultValue: 'ACTIVE'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_verified'
        },
        verifiedBy: {
            type: DataTypes.STRING,
            field: 'verified_by'
        },
        verifiedAt: {
            type: DataTypes.DATE,
            field: 'verified_at'
        },
        createdBy: {
            type: DataTypes.STRING,
            field: 'created_by'
        },
        updatedBy: {
            type: DataTypes.STRING,
            field: 'updated_by'
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_featured'
        },
        isNewLaunch: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_new_launch'
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        favoritesCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            field: 'favorites_count'
        },
        amenities: {
            type: DataTypes.JSONB
        },
        documents: {
            type: DataTypes.JSONB
        }
    }, {
        tableName: 'properties',
        underscored: true,
        timestamps: true
    });

    Property.associate = function (models) {
        // associations can be defined here
    };

    return Property;
};
