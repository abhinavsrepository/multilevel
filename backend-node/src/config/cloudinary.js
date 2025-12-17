const cloudinary = require('cloudinary').v2;
const logger = require('./logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration
const verifyCloudinaryConfig = () => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        logger.warn('Cloudinary credentials not found in environment variables. Image uploads may fail.');
        return false;
    }
    logger.info('Cloudinary configured successfully');
    return true;
};

verifyCloudinaryConfig();

module.exports = cloudinary;
