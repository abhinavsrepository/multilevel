const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload profile photo to Cloudinary
 * @route POST /api/upload/profile-photo
 * @access Public
 */
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary using stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'mlm-profiles',
                resource_type: 'auto',
                transformation: [
                    { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload to Cloudinary',
                        error: error.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Profile photo uploaded successfully',
                    data: {
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: req.file.originalname,
                        originalName: req.file.originalname,
                        size: req.file.size,
                        mimetype: req.file.mimetype
                    }
                });
            }
        );

        // Pipe the buffer to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile photo',
            error: error.message
        });
    }
};

/**
 * Upload KYC document to Cloudinary
 * @route POST /api/upload/kyc-document
 * @access Protected
 */
exports.uploadKYCDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary using stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'mlm-kyc',
                resource_type: 'auto',
                transformation: [
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload to Cloudinary',
                        error: error.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'KYC document uploaded successfully',
                    data: {
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: req.file.originalname,
                        originalName: req.file.originalname,
                        size: req.file.size,
                        mimetype: req.file.mimetype
                    }
                });
            }
        );

        // Pipe the buffer to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        console.error('KYC document upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload KYC document',
            error: error.message
        });
    }
};

/**
 * Upload property image to Cloudinary
 * @route POST /api/v1/properties/upload
 * @access Protected (Admin only)
 */
exports.uploadPropertyImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary using stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'mlm-properties',
                resource_type: 'auto',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload to Cloudinary',
                        error: error.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Property image uploaded successfully',
                    data: {
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: req.file.originalname,
                        originalName: req.file.originalname,
                        size: req.file.size,
                        mimetype: req.file.mimetype,
                        width: result.width,
                        height: result.height
                    }
                });
            }
        );

        // Pipe the buffer to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        console.error('Property image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload property image',
            error: error.message
        });
    }
};

/**
 * Upload generic document to Cloudinary
 * @route POST /api/upload/document
 * @access Public/Protected
 */
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Cloudinary using stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'mlm-documents',
                resource_type: 'auto',
                flags: 'attachment',
                transformation: [
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload to Cloudinary',
                        error: error.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: 'Document uploaded successfully',
                    data: {
                        url: result.secure_url,
                        publicId: result.public_id,
                        filename: req.file.originalname,
                        originalName: req.file.originalname,
                        size: req.file.size,
                        mimetype: req.file.mimetype
                    }
                });
            }
        );

        // Pipe the buffer to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
};

/**
 * Delete uploaded file
 * @route DELETE /api/upload/:filename
 * @access Protected
 */
exports.deleteFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const { type } = req.query; // 'profile', 'kyc', or 'property'

        let uploadDir;
        if (type === 'kyc') {
            uploadDir = path.join(__dirname, '../../uploads/kyc');
        } else if (type === 'property') {
            uploadDir = path.join(__dirname, '../../uploads/properties');
        } else {
            uploadDir = path.join(__dirname, '../../uploads/profile-photos');
        }

        const filePath = path.join(uploadDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Delete file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file',
            error: error.message
        });
    }
};
