const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'reet',
    api_key: process.env.CLOUDINARY_API_KEY || '769619441439919',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'OcDhOyoCUt5AGsinBN1UxhfrTNM'
});

// Verify configuration
const verifyCloudinaryConfig = () => {
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
        logger.warn('Cloudinary credentials not found. Image uploads may fail.');
        return false;
    }
    logger.info(`Cloudinary configured successfully for cloud: ${config.cloud_name}`);
    return true;
};

verifyCloudinaryConfig();

module.exports = cloudinary;
