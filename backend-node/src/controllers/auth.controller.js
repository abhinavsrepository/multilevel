const { User, Wallet, ActivityLog } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logAction } = require('./audit.controller');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// ==================== Registration & Login ====================

exports.register = async (req, res) => {
    try {
        let { email, password, fullName, mobile, sponsorCode, sponsorId, placement, role, companyName } = req.body;

        // Handle different field names from frontend if necessary
        // Frontend sends: name, email, phone, password, role, companyName
        if (req.body.name && !fullName) fullName = req.body.name;
        if (req.body.phone && !mobile) mobile = req.body.phone;
        // Frontend might send sponsorId instead of sponsorCode
        if (sponsorId && !sponsorCode) sponsorCode = sponsorId;

        // Validate required fields
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }
        if (!fullName) {
            return res.status(400).json({ success: false, message: 'Full name is required' });
        }
        if (!mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number is required' });
        }

        // Check if user exists
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        const mobileExists = await User.findOne({ where: { mobile } });
        if (mobileExists) {
            return res.status(400).json({ success: false, message: 'Mobile number already exists' });
        }

        // Generate User ID (MLM + Random)
        let userId;
        let isUniqueId = false;
        while (!isUniqueId) {
            const randomId = Math.floor(100000 + Math.random() * 900000); // 6 digit
            userId = `MLM${randomId}`;
            const existing = await User.findOne({ where: { username: userId } });
            if (!existing) isUniqueId = true;
        }

        // Validate sponsor if provided
        let sponsor = null;
        if (sponsorCode) {
            sponsor = await User.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { referralCode: sponsorCode },
                        { username: sponsorCode }
                    ]
                }
            });
            if (!sponsor) {
                return res.status(400).json({ success: false, message: 'Invalid sponsor code' });
            }
        }

        // Generate unique referral code
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
            referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await User.findOne({ where: { referralCode } });
            if (!existing) isUnique = true;
        }

        // Create user
        const user = await User.create({
            username: userId,
            email,
            password,
            fullName: fullName || 'User',
            mobile,
            referralCode,
            sponsorId: sponsor ? sponsor.username : null,
            sponsorUserId: sponsor ? sponsor.id : null,
            placementUserId: sponsor ? sponsor.id : null,
            placement: placement ? placement.toUpperCase() : 'AUTO',
            role: role || 'MEMBER',
            status: 'ACTIVE'
        });

        if (user) {
            // Create wallet for the new user
            await Wallet.create({
                userId: user.id,
                depositBalance: 0,
                commissionBalance: 0,
                totalEarned: 0,
                totalWithdrawn: 0
            });

            // Log registration activity
            await ActivityLog.create({
                userId: user.id,
                action: 'USER_REGISTERED',
                description: `New user registered: ${user.fullName} (${user.username})`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            });

            const token = generateToken(user.id);
            const refreshToken = token;
            const expiresIn = 30 * 24 * 60 * 60;

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    token,
                    refreshToken,
                    expiresIn,
                    user: {
                        id: user.id,
                        userId: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        emailVerified: user.emailVerified,
                        phoneVerified: user.phoneVerified,
                        referralCode: user.referralCode
                    }
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, emailOrMobile, password } = req.body;

        // Determine login identifier
        const loginIdentifier = email || emailOrMobile;

        if (!loginIdentifier) {
            return res.status(400).json({ success: false, message: 'Email or mobile number is required' });
        }

        // Check for user by email or phone number
        const user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: loginIdentifier },
                    { mobile: loginIdentifier }
                ]
            }
        });

        if (user && (await user.validatePassword(password))) {
            // Check if user is active
            if (user.status !== 'ACTIVE') {
                return res.status(403).json({
                    success: false,
                    message: `Your account is ${user.status.toLowerCase()}. Please contact support.`
                });
            }

            // Log login activity
            await logAction(user.id, 'LOGIN', 'User logged in successfully', req);

            const token = generateToken(user.id);
            // For now use token as refresh token or generate one if needed
            const refreshToken = token;
            const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds

            res.json({
                success: true,
                data: {
                    token,
                    refreshToken,
                    expiresIn,
                    user: {
                        id: user.id,
                        userId: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        emailVerified: user.emailVerified,
                        phoneVerified: user.phoneVerified,
                        referralCode: user.referralCode
                    }
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'emailOtp', 'phoneOtp', 'resetPasswordToken'] }
        });

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Sponsor Validation ====================

exports.validateSponsor = async (req, res) => {
    try {
        const { sponsorId } = req.params;

        const sponsor = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { referralCode: sponsorId },
                    { username: sponsorId }
                ]
            },
            attributes: ['id', 'username', 'fullName', 'email', 'referralCode']
        });

        if (!sponsor) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor not found',
                data: { valid: false }
            });
        }

        res.json({
            success: true,
            data: {
                valid: true,
                sponsor: {
                    id: sponsor.id,
                    userId: sponsor.username,
                    name: sponsor.fullName,
                    email: sponsor.email,
                    referralCode: sponsor.referralCode
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== OTP Verification ====================

exports.sendEmailOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.update({
            emailOtp: otp,
            otpExpiry: otpExpiry
        });

        // TODO: Send OTP via email service
        console.log(`Email OTP for ${email}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            data: {
                expiresIn: 600 // seconds
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.sendMobileOTP = async (req, res) => {
    try {
        const { mobile } = req.body;

        const user = await User.findOne({ where: { mobile } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.update({
            phoneOtp: otp,
            otpExpiry: otpExpiry
        });

        // TODO: Send OTP via SMS service
        console.log(`Mobile OTP for ${mobile}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent to your mobile',
            data: {
                expiresIn: 600 // seconds
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        let { emailOrMobile, otp, type } = req.body;

        // Infer type if not provided
        if (!type) {
            type = emailOrMobile.includes('@') ? 'EMAIL' : 'MOBILE';
        }

        let user;
        if (type === 'EMAIL') {
            user = await User.findOne({ where: { email: emailOrMobile } });
        } else {
            user = await User.findOne({ where: { mobile: emailOrMobile } });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if OTP is expired
        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        // Verify OTP
        const isValid = type === 'EMAIL'
            ? user.emailOtp === otp
            : user.phoneOtp === otp;

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Mark as verified and clear OTP
        const updateData = {
            otpExpiry: null
        };

        if (type === 'EMAIL') {
            updateData.emailVerified = true;
            updateData.emailOtp = null;
        } else {
            updateData.phoneVerified = true;
            updateData.phoneOtp = null;
        }

        await user.update(updateData);

        await user.update(updateData);

        const token = generateToken(user.id);
        const refreshToken = token;
        const expiresIn = 30 * 24 * 60 * 60;

        res.json({
            success: true,
            message: `${type === 'EMAIL' ? 'Email' : 'Mobile'} verified successfully`,
            data: {
                token,
                refreshToken,
                expiresIn,
                user: {
                    id: user.id,
                    userId: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role || 'USER',
                    emailVerified: user.emailVerified,
                    phoneVerified: user.phoneVerified,
                    referralCode: user.referralCode
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        let { emailOrMobile, type } = req.body;

        // Infer type if not provided
        if (!type) {
            type = emailOrMobile.includes('@') ? 'EMAIL' : 'MOBILE';
        }

        let user;
        if (type === 'EMAIL') {
            user = await User.findOne({ where: { email: emailOrMobile } });
        } else {
            user = await User.findOne({ where: { mobile: emailOrMobile } });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        if (type === 'EMAIL') {
            await user.update({ emailOtp: otp, otpExpiry });
            console.log(`Email OTP for ${emailOrMobile}: ${otp}`);
        } else {
            await user.update({ phoneOtp: otp, otpExpiry });
            console.log(`Mobile OTP for ${emailOrMobile}: ${otp}`);
        }

        res.json({
            success: true,
            message: 'OTP resent successfully',
            data: {
                expiresIn: 600
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Password Management ====================

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const resetToken = generateResetToken();
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpiry: resetExpiry
        });

        // TODO: Send reset link via email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log(`Password reset link for ${email}: ${resetUrl}`);

        res.json({
            success: true,
            message: 'Password reset link sent to your email'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: { resetPasswordToken: token }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reset token',
                data: { valid: false }
            });
        }

        if (new Date() > user.resetPasswordExpiry) {
            return res.status(400).json({
                success: false,
                message: 'Reset token has expired',
                data: { valid: false }
            });
        }

        res.json({
            success: true,
            data: { valid: true }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            where: { resetPasswordToken: token }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid reset token' });
        }

        if (new Date() > user.resetPasswordExpiry) {
            return res.status(400).json({ success: false, message: 'Reset token has expired' });
        }

        await user.update({
            password: password,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        });

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByPk(req.user.id);

        if (!(await user.validatePassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        await user.update({ password: newPassword });

        await logAction(user.id, 'CHANGE_PASSWORD', 'User changed password', req);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Email/Mobile Verification ====================

exports.sendEmailVerification = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({ emailOtp: otp, otpExpiry });

        // TODO: Send OTP via email
        console.log(`Email verification OTP for ${user.email}: ${otp}`);

        res.json({
            success: true,
            message: 'Verification OTP sent to your email'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findByPk(req.user.id);

        if (user.emailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.emailOtp !== token) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        await user.update({
            emailVerified: true,
            emailOtp: null,
            otpExpiry: null
        });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.sendMobileVerification = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user.phoneVerified) {
            return res.status(400).json({ success: false, message: 'Mobile already verified' });
        }

        if (!user.mobile) {
            return res.status(400).json({ success: false, message: 'Mobile number not found' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        await user.update({ phoneOtp: otp, otpExpiry });

        // TODO: Send OTP via SMS
        console.log(`Mobile verification OTP for ${user.mobile}: ${otp}`);

        res.json({
            success: true,
            message: 'Verification OTP sent to your mobile'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.verifyMobile = async (req, res) => {
    try {
        const { otp } = req.body;
        const user = await User.findByPk(req.user.id);

        if (user.phoneVerified) {
            return res.status(400).json({ success: false, message: 'Mobile already verified' });
        }

        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (user.phoneOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        await user.update({
            phoneVerified: true,
            phoneOtp: null,
            otpExpiry: null
        });

        res.json({
            success: true,
            message: 'Mobile verified successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Account Status Checks ====================

exports.checkEmailExists = async (req, res) => {
    try {
        const { email } = req.params;

        const user = await User.findOne({ where: { email } });

        res.json({
            success: true,
            data: {
                exists: !!user
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.checkMobileExists = async (req, res) => {
    try {
        const { mobile } = req.params;

        const user = await User.findOne({ where: { mobile } });

        res.json({
            success: true,
            data: {
                exists: !!user
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// ==================== Session Management ====================

exports.logout = async (req, res) => {
    try {
        // TODO: Implement token blacklisting if needed
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // TODO: Implement refresh token logic
        // For now, just generate a new token for the authenticated user
        const newToken = generateToken(req.user.id);

        res.json({
            success: true,
            data: {
                token: newToken,
                refreshToken: refreshToken // Return same for now
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
