module.exports = (sequelize, DataTypes) => {
    const SystemSettings = sequelize.define('SystemSettings', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        settingKey: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Unique identifier for the setting'
        },
        settingValue: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'JSON or string value'
        },
        settingType: {
            type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY'),
            defaultValue: 'STRING'
        },
        category: {
            type: DataTypes.STRING,
            defaultValue: 'GENERAL'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        updatedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'Admin user ID who last updated'
        }
    }, {
        tableName: 'system_settings',
        timestamps: true,
        indexes: [
            {
                fields: ['settingKey'],
                unique: true
            },
            {
                fields: ['category']
            }
        ]
    });

    SystemSettings.associate = (models) => {
        SystemSettings.belongsTo(models.User, {
            foreignKey: 'updatedBy',
            as: 'updater'
        });
    };

    // Helper method to get setting value
    SystemSettings.getSetting = async function (key, defaultValue = null) {
        const setting = await this.findOne({ where: { settingKey: key, isActive: true } });
        if (!setting) return defaultValue;

        try {
            switch (setting.settingType) {
                case 'NUMBER':
                    return parseFloat(setting.settingValue);
                case 'BOOLEAN':
                    return setting.settingValue === 'true';
                case 'JSON':
                case 'ARRAY':
                    return JSON.parse(setting.settingValue);
                default:
                    return setting.settingValue;
            }
        } catch (error) {
            return defaultValue;
        }
    };

    // Helper method to set setting value
    SystemSettings.setSetting = async function (key, value, type = 'STRING', category = 'GENERAL', description = null, userId = null) {
        let settingValue = value;

        if (type === 'JSON' || type === 'ARRAY') {
            settingValue = JSON.stringify(value);
        } else if (type === 'BOOLEAN') {
            settingValue = value ? 'true' : 'false';
        } else if (type === 'NUMBER') {
            settingValue = value.toString();
        }

        const [setting, created] = await this.findOrCreate({
            where: { settingKey: key },
            defaults: {
                settingValue,
                settingType: type,
                category,
                description,
                updatedBy: userId
            }
        });

        if (!created) {
            await setting.update({
                settingValue,
                settingType: type,
                category,
                description: description || setting.description,
                updatedBy: userId
            });
        }

        return setting;
    };

    return SystemSettings;
};
