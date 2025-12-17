module.exports = (sequelize, DataTypes) => {
    const KycDocument = sequelize.define('KycDocument', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        documentType: {
            type: DataTypes.STRING, // AADHAAR, PAN, PASSPORT, DRIVING_LICENSE
            allowNull: false
        },
        documentNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        documentUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        backDocumentUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING'
        },
        rejectionReason: {
            type: DataTypes.TEXT
        },
        verifiedAt: {
            type: DataTypes.DATE
        },
        verifiedBy: {
            type: DataTypes.STRING
        }
    });

    KycDocument.associate = function (models) {
        KycDocument.belongsTo(models.User, { foreignKey: 'userId' });
    };

    return KycDocument;
};
