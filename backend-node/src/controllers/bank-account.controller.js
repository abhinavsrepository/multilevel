const { BankAccount } = require('../models');
const notificationService = require('../services/notification.service');

exports.addBankAccount = async (req, res) => {
    try {
        const { bankName, accountNumber, ifscCode, accountHolderName, branchName } = req.body;
        const userId = req.user.id;

        const existingAccount = await BankAccount.findOne({ where: { userId, accountNumber } });
        if (existingAccount) {
            return res.status(409).json({ success: false, message: 'Bank account already exists' });
        }

        const bankAccount = await BankAccount.create({
            userId,
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            branchName,
            status: 'PENDING'
        });

        // Send notification (optional, maybe only after verification)
        // await notificationService.sendNotification(userId, 'Bank Account Added', 'Your bank account has been added and is pending verification.', 'BANK');

        res.status(201).json({
            success: true,
            message: 'Bank account added successfully',
            data: bankAccount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getBankAccounts = async (req, res) => {
    try {
        const bankAccounts = await BankAccount.findAll({ where: { userId: req.user.id } });
        res.json({
            success: true,
            message: 'Bank accounts retrieved successfully',
            data: bankAccounts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.updateBankAccount = async (req, res) => {
    try {
        const { bankName, accountNumber, ifscCode, accountHolderName, branchName } = req.body;
        const bankAccount = await BankAccount.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }

        await bankAccount.update({
            bankName,
            accountNumber,
            ifscCode,
            accountHolderName,
            branchName,
            status: 'PENDING' // Reset to pending on update
        });

        res.json({
            success: true,
            message: 'Bank account updated successfully',
            data: bankAccount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.deleteBankAccount = async (req, res) => {
    try {
        const bankAccount = await BankAccount.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }

        if (bankAccount.isPrimary) {
            return res.status(400).json({ success: false, message: 'Cannot delete primary bank account' });
        }

        await bankAccount.destroy();

        res.json({
            success: true,
            message: 'Bank account deleted successfully',
            data: 'Bank account deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.setPrimaryAccount = async (req, res) => {
    try {
        const bankAccount = await BankAccount.findOne({ where: { id: req.params.id, userId: req.user.id } });

        if (!bankAccount) {
            return res.status(404).json({ success: false, message: 'Bank account not found' });
        }

        // Reset all other accounts to not primary
        await BankAccount.update({ isPrimary: false }, { where: { userId: req.user.id } });

        // Set this one to primary
        await bankAccount.update({ isPrimary: true });

        res.json({
            success: true,
            message: 'Primary account set successfully',
            data: bankAccount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
