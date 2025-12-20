const { KycDocument, User } = require('../models');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.files || !req.files['file']) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const { documentType, documentNumber } = req.body;
        const userId = req.user.id;

        const frontImage = req.files['file'][0];
        const backImage = req.files['backImage'] ? req.files['backImage'][0] : null;

        // Upload to Cloudinary
        const frontImageUrl = await uploadToCloudinary(frontImage.buffer, `kyc/${userId}/${documentType}`);
        const backImageUrl = backImage ? await uploadToCloudinary(backImage.buffer, `kyc/${userId}/${documentType}`) : null;

        // Create KYC document record
        const document = await KycDocument.create({
            userId,
            documentType,
            documentNumber,
            documentUrl: frontImageUrl,
            backDocumentUrl: backImageUrl,
            status: 'PENDING'
        });

        // Update user KYC status
        await User.update({ kycStatus: 'PENDING' }, { where: { id: userId } });

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        console.error('KYC Upload Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const documents = await KycDocument.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getKycStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['kycStatus', 'kycLevel']
        });

        const documents = await KycDocument.findAll({
            where: { userId: req.user.id }
        });

        // Map documents to frontend expected format
        const uploadedDocsMap = new Map(documents.map(doc => [doc.documentType, doc]));

        const supportedDocTypes = [
            'PAN_CARD',
            'AADHAAR_CARD',
            'BANK_PROOF',
            'ADDRESS_PROOF',
            'INCOME_PROOF',
            'PHOTO_ID',
            'SELFIE_WITH_PAN'
        ];

        const mappedDocuments = supportedDocTypes.map((type, index) => {
            const doc = uploadedDocsMap.get(type);
            if (doc) {
                return {
                    id: doc.id,
                    documentType: doc.documentType,
                    documentNumber: doc.documentNumber,
                    frontImage: doc.documentUrl,
                    backImage: doc.backDocumentUrl,
                    status: doc.status === 'APPROVED' ? 'VERIFIED' : doc.status,
                    uploadedDate: doc.createdAt,
                    rejectionReason: doc.rejectionReason
                };
            } else {
                return {
                    id: index + 1000, // Temporary ID for frontend key
                    documentType: type,
                    status: 'NOT_UPLOADED'
                };
            }
        });

        // Determine investment limit based on level
        const limits = {
            'NONE': 0,
            'BASIC': 50000,
            'FULL': 500000,
            'PREMIUM': 10000000
        };
        const investmentLimit = limits[user.kycLevel] || 0;

        res.json({
            success: true,
            data: {
                kycStatus: user.kycStatus,
                kycLevel: user.kycLevel,
                documents: mappedDocuments,
                investmentLimit: investmentLimit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
// Admin: Get all KYC requests
exports.getAllKycRequests = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const { count, rows } = await KycDocument.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'kycStatus']
            }],
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
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// Admin: Review KYC Request (Approve/Reject)
exports.reviewKycRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body; // status: APPROVED, REJECTED

        const document = await KycDocument.findByPk(id);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        if (status === 'REJECTED' && !rejectionReason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        document.status = status;
        if (status === 'REJECTED') {
            document.rejectionReason = rejectionReason;
        }
        document.verifiedAt = new Date();
        document.verifiedBy = req.user.username; // Assuming admin username
        await document.save();

        // Update User KYC Status logic
        // If this document is approved, check if all required docs are approved?
        // Or just update user status based on this single doc?
        // Usually, KYC involves multiple docs. 
        // Simple logic: If any doc is rejected, User KYC is REJECTED.
        // If all required docs are APPROVED, User KYC is APPROVED.

        const userId = document.userId;
        const allDocs = await KycDocument.findAll({ where: { userId } });

        const anyRejected = allDocs.some(d => d.status === 'REJECTED');
        const allApproved = allDocs.every(d => d.status === 'APPROVED');

        // Define required doc types if needed, for now assuming if all uploaded are approved, it's good.
        // Or maybe we just update user status to match the latest document action for simplicity in this iteration.

        let newUserStatus = 'PENDING';
        if (anyRejected) {
            newUserStatus = 'REJECTED';
        } else if (allApproved) {
            newUserStatus = 'APPROVED';
        }

        if (newUserStatus !== 'PENDING') {
            await User.update({ kycStatus: newUserStatus }, { where: { id: userId } });
        }

        res.json({ success: true, data: document });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
