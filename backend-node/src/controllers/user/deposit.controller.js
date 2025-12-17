const { Deposit, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for payment proof upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../../uploads/payment-proofs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'payment-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and PDF files are allowed'));
        }
    }
}).single('paymentProof');

/**
 * Submit deposit request
 */
exports.submitDepositRequest = async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId, remarks } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const deposit = await Deposit.create({
            userId: req.user.id,
            amount,
            paymentMethod: paymentMethod || 'BANK_TRANSFER',
            transactionId,
            remarks,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: 'Deposit request submitted successfully',
            data: deposit
        });
    } catch (error) {
        console.error('Submit deposit request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit deposit request',
            error: error.message
        });
    }
};

/**
 * Upload payment proof
 */
exports.uploadPaymentProof = (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        try {
            const { depositId } = req.body;

            if (!depositId) {
                return res.status(400).json({
                    success: false,
                    message: 'Deposit ID is required'
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment proof file is required'
                });
            }

            const deposit = await Deposit.findOne({
                where: {
                    id: depositId,
                    userId: req.user.id
                }
            });

            if (!deposit) {
                return res.status(404).json({
                    success: false,
                    message: 'Deposit not found'
                });
            }

            if (deposit.status !== 'PENDING') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot update payment proof for processed deposit'
                });
            }

            const fileUrl = `/uploads/payment-proofs/${req.file.filename}`;

            await deposit.update({
                paymentProof: fileUrl
            });

            res.json({
                success: true,
                message: 'Payment proof uploaded successfully',
                data: {
                    fileUrl,
                    deposit
                }
            });
        } catch (error) {
            console.error('Upload payment proof error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload payment proof',
                error: error.message
            });
        }
    });
};

/**
 * Get my deposits
 */
exports.getMyDeposits = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { userId: req.user.id };

        if (status) {
            where.status = status;
        }

        const { rows: deposits, count } = await Deposit.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [[sortBy, sortOrder]],
            include: [
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ]
        });

        res.json({
            success: true,
            data: {
                deposits,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get my deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve deposits',
            error: error.message
        });
    }
};

/**
 * Get deposit details
 */
exports.getDepositDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const deposit = await Deposit.findOne({
            where: {
                id,
                userId: req.user.id
            },
            include: [
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'username', 'firstName', 'lastName']
                }
            ]
        });

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Deposit not found'
            });
        }

        res.json({
            success: true,
            data: deposit
        });
    } catch (error) {
        console.error('Get deposit details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve deposit details',
            error: error.message
        });
    }
};

/**
 * Cancel pending deposit
 */
exports.cancelDeposit = async (req, res) => {
    try {
        const { id } = req.params;

        const deposit = await Deposit.findOne({
            where: {
                id,
                userId: req.user.id,
                status: 'PENDING'
            }
        });

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Pending deposit not found'
            });
        }

        await deposit.update({
            status: 'REJECTED',
            rejectionReason: 'Cancelled by user'
        });

        res.json({
            success: true,
            message: 'Deposit cancelled successfully',
            data: deposit
        });
    } catch (error) {
        console.error('Cancel deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel deposit',
            error: error.message
        });
    }
};
