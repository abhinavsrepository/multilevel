const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        // Check if admin user exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@mlm.com' }
        });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('User ID:', existingAdmin.username);
            console.log('Role:', existingAdmin.role);
            console.log('Status:', existingAdmin.status);

            // Optional: Reset password
            console.log('\nResetting password to: admin123');
            await existingAdmin.update({ password: 'admin123' });
            console.log('Password reset successfully!');
            return;
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

        // Generate unique referral code
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
            referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await User.findOne({ where: { referralCode } });
            if (!existing) isUnique = true;
        }

        // Create admin user
        const adminUser = await User.create({
            username: userId,
            email: 'admin@mlm.com',
            password: 'admin123', // Will be hashed by the beforeCreate hook
            fullName: 'Admin User',
            mobile: '9999999999',
            referralCode: referralCode,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
            phoneVerified: true
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@mlm.com');
        console.log('Password: admin123');
        console.log('User ID:', adminUser.username);
        console.log('Referral Code:', adminUser.referralCode);

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        process.exit(0);
    }
}

createAdminUser();
