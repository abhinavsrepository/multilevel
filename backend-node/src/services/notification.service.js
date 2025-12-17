const { Notification, User } = require('../models');
// const nodemailer = require('nodemailer'); // Uncomment when nodemailer is installed

// Mock mail sender for now
const sendEmail = async (to, subject, html) => {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    // In production, use nodemailer here
};

exports.sendNotification = async (userId, title, message, type) => {
    try {
        // Save to DB
        await Notification.create({
            userId,
            title,
            message,
            type,
            isRead: false
        });

        // Real-time notification (socket.io) could go here
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

exports.sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to MLM Real Estate Platform';
    const html = `<h1>Welcome ${user.firstName}!</h1><p>Your account has been created.</p>`;
    await sendEmail(user.email, subject, html);
    await exports.sendNotification(user.id, 'Welcome', 'Welcome to the platform!', 'WELCOME');
};

exports.sendOtpEmail = async (email, otp) => {
    const subject = 'Verify Your Email - OTP Code';
    const html = `<p>Your OTP is: <b>${otp}</b></p>`;
    await sendEmail(email, subject, html);
};

exports.sendCommissionNotification = async (user, amount, type) => {
    const subject = 'New Commission Earned';
    const html = `<p>You earned ${amount} from ${type}</p>`;
    await sendEmail(user.email, subject, html);
    await exports.sendNotification(user.id, 'Commission Earned', `You earned ${amount} from ${type}`, 'COMMISSION');
};

exports.sendPayoutStatusEmail = async (user, status, amount) => {
    const subject = `Payout ${status}`;
    const html = `<p>Your payout of ${amount} is ${status}</p>`;
    await sendEmail(user.email, subject, html);
    await exports.sendNotification(user.id, `Payout ${status}`, `Your payout of ${amount} is ${status}`, 'PAYOUT');
};

exports.sendKycStatusEmail = async (user, status) => {
    const subject = `KYC ${status}`;
    const html = `<p>Your KYC verification is ${status}</p>`;
    await sendEmail(user.email, subject, html);
    await exports.sendNotification(user.id, `KYC ${status}`, `Your KYC verification is ${status}`, 'KYC');
};
