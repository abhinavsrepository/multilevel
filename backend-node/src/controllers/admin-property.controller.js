const { Property, User, Investment } = require('../models');
const { Op } = require('sequelize');

exports.getProperties = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }
        if (status) {
            where.status = status;
        }

        const { count, rows } = await Property.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        await property.update({ status });
        res.json({ success: true, message: 'Property status updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleFeatured = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        await property.update({ isFeatured: !property.isFeatured });
        res.json({ success: true, message: 'Property featured status toggled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleTrending = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

        await property.update({ isTrending: !property.isTrending });
        res.json({ success: true, message: 'Property trending status toggled' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPropertyInvestors = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Investment.findAndCountAll({
            where: { propertyId: req.params.id },
            include: [{ model: User, attributes: ['id', 'username', 'email'] }],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.exportProperties = async (req, res) => {
    try {
        const properties = await Property.findAll();
        const fields = ['id', 'title', 'price', 'location', 'status', 'createdAt'];
        const csv = [
            fields.join(','),
            ...properties.map(p => fields.map(f => p[f]).join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('properties.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPropertyById = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProperty = async (req, res) => {
    try {
        const property = await Property.create(req.body);
        res.status(201).json({ success: true, data: property, message: 'Property created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        await property.update(req.body);
        res.json({ success: true, data: property, message: 'Property updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        await property.destroy();
        res.json({ success: true, message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.importProperties = async (req, res) => {
    try {
        // TODO: Implement CSV/Excel import logic
        res.json({ success: true, message: 'Property import functionality coming soon' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadPropertyImages = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images provided' });
        }

        const cloudinary = require('../config/cloudinary');
        const streamifier = require('streamifier');
        const uploadedImages = [];

        // Upload each image to Cloudinary
        for (const file of req.files) {
            await new Promise((resolve, reject) => {
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
                            reject(error);
                        } else {
                            uploadedImages.push({
                                url: result.secure_url,
                                publicId: result.public_id,
                                width: result.width,
                                height: result.height
                            });
                            resolve();
                        }
                    }
                );
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });
        }

        // Add uploaded images to property
        const currentImages = property.images || [];
        await property.update({ images: [...currentImages, ...uploadedImages] });

        res.json({
            success: true,
            message: 'Images uploaded successfully',
            data: uploadedImages
        });
    } catch (error) {
        console.error('Error uploading property images:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePropertyImage = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const imageId = parseInt(req.params.imageId);
        const currentImages = property.images || [];

        if (imageId < 0 || imageId >= currentImages.length) {
            return res.status(404).json({ success: false, message: 'Image not found' });
        }

        const imageToDelete = currentImages[imageId];

        // Delete from Cloudinary if publicId exists
        if (imageToDelete.publicId) {
            try {
                const cloudinary = require('../config/cloudinary');
                await cloudinary.uploader.destroy(imageToDelete.publicId);
            } catch (cloudinaryError) {
                console.error('Cloudinary deletion error:', cloudinaryError);
                // Continue even if Cloudinary deletion fails
            }
        }

        // Remove image from array
        currentImages.splice(imageId, 1);
        await property.update({ images: currentImages });

        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting property image:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadPropertyDocument = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No document provided' });
        }

        const { documentType, documentName } = req.body;

        const cloudinary = require('../config/cloudinary');
        const streamifier = require('streamifier');

        // Upload document to Cloudinary
        const uploadedDocument = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'mlm-property-documents',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve({
                            type: documentType || 'OTHER',
                            name: documentName || req.file.originalname,
                            url: result.secure_url,
                            publicId: result.public_id,
                            format: result.format,
                            size: result.bytes
                        });
                    }
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        // Add document to property
        const currentDocuments = property.documents || [];
        await property.update({ documents: [...currentDocuments, uploadedDocument] });

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            data: uploadedDocument
        });
    } catch (error) {
        console.error('Error uploading property document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePropertyDocument = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }

        const documentId = parseInt(req.params.documentId);
        const currentDocuments = property.documents || [];

        if (documentId < 0 || documentId >= currentDocuments.length) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const documentToDelete = currentDocuments[documentId];

        // Delete from Cloudinary if publicId exists
        if (documentToDelete.publicId) {
            try {
                const cloudinary = require('../config/cloudinary');
                await cloudinary.uploader.destroy(documentToDelete.publicId);
            } catch (cloudinaryError) {
                console.error('Cloudinary deletion error:', cloudinaryError);
                // Continue even if Cloudinary deletion fails
            }
        }

        // Remove document from array
        currentDocuments.splice(documentId, 1);
        await property.update({ documents: currentDocuments });

        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting property document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendUpdateToInvestors = async (req, res) => {
    try {
        const { title, message } = req.body;
        const notificationService = require('../services/notification.service');

        // Get all investors for this property
        const investors = await Investment.findAll({
            where: { propertyId: req.params.id },
            include: [{ model: User, attributes: ['id'] }]
        });

        // Send notification to each investor
        for (const investment of investors) {
            if (investment.User) {
                await notificationService.sendNotification(
                    investment.User.id,
                    title,
                    message,
                    'PROPERTY_UPDATE'
                );
            }
        }

        res.json({ success: true, message: `Update sent to ${investors.length} investors` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
