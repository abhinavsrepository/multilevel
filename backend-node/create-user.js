const { User, Wallet } = require('./src/models');

async function createUser() {
    try {
        console.log('Creating regular user account...\n');

        // Check if user exists
        const existingUser = await User.findOne({
            where: { email: 'user@mlm.com' }
        });

        if (existingUser) {
            console.log('User already exists!');
            console.log('Email:', existingUser.email);
            console.log('User ID:', existingUser.username);
            console.log('Role:', existingUser.role);
            console.log('Status:', existingUser.status);

            // Reset password
            console.log('\nResetting password to: user12345');
            await existingUser.update({ password: 'user12345' });
            console.log('Password reset successfully!');

            // Ensure wallet exists
            const wallet = await Wallet.findOne({ where: { userId: existingUser.id } });
            if (!wallet) {
                await Wallet.create({
                    userId: existingUser.id,
                    investmentBalance: 0,
                    commissionBalance: 0,
                    rentalIncomeBalance: 0,
                    roiBalance: 0,
                    totalEarned: 0,
                    totalWithdrawn: 0,
                    totalInvested: 0,
                    lockedBalance: 0
                });
                console.log('Wallet created for user');
            }

            console.log('\n📋 Login Credentials:');
            console.log('   Email: user@mlm.com');
            console.log('   Password: user12345');
            process.exit(0);
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

        // Create regular user
        const user = await User.create({
            username: userId,
            email: 'user@mlm.com',
            password: 'user12345', // 9 characters to meet the 8+ requirement
            fullName: 'Test User',
            mobile: '9876543210',
            referralCode: referralCode,
            role: 'MEMBER',
            status: 'ACTIVE',
            emailVerified: true,
            phoneVerified: true
        });

        console.log('✅ User created successfully!');
        console.log('   Email: user@mlm.com');
        console.log('   Password: user12345');
        console.log('   User ID:', user.username);
        console.log('   Referral Code:', user.referralCode);
        console.log('   Role:', user.role);

        // Create wallet for user
        await Wallet.create({
            userId: user.id,
            investmentBalance: 0,
            commissionBalance: 0,
            rentalIncomeBalance: 0,
            roiBalance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            totalInvested: 0,
            lockedBalance: 0
        });

        console.log('✅ Wallet created for user');
        console.log('\n📋 Login Credentials for User Panel:');
        console.log('   Email: user@mlm.com');
        console.log('   Password: user12345');

    } catch (error) {
        console.error('Error creating user:', error.message);
    } finally {
        process.exit(0);
    }
}

createUser();
