const bcrypt = require('bcryptjs');
const { User, Wallet } = require('../models');

async function seedRootUser() {
    try {
        console.log('Checking for root user EG0000001...');

        // Check if EG0000001 already exists
        const existingUser = await User.findOne({ where: { username: 'EG0000001' } });

        if (existingUser) {
            console.log('✓ Root user EG0000001 already exists');
            console.log({
                id: existingUser.id,
                username: existingUser.username,
                email: existingUser.email,
                fullName: existingUser.fullName,
                referralCode: existingUser.referralCode
            });
            return;
        }

        console.log('Creating root user EG0000001...');

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        // Generate unique referral code
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
            referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await User.findOne({ where: { referralCode } });
            if (!existing) isUnique = true;
        }

        // Create root user with EG0000001
        const rootUser = await User.create({
            username: 'EG0000001',
            email: 'root@mlmplatform.com',
            password: hashedPassword,
            fullName: 'Universal Root Sponsor',
            mobile: '0000000001',
            referralCode: referralCode,
            sponsorId: null,
            sponsorUserId: null,
            placementUserId: null,
            placement: null,
            role: 'ADMIN',
            status: 'ACTIVE',
            emailVerified: true,
            phoneVerified: true,
            level: 0
        }, {
            hooks: false // Skip hooks since we already hashed the password
        });

        // Create wallet for root user
        await Wallet.create({
            userId: rootUser.id,
            depositBalance: 0,
            commissionBalance: 0,
            totalEarned: 0,
            totalWithdrawn: 0
        });

        console.log('✓ Root user EG0000001 created successfully!');
        console.log({
            id: rootUser.id,
            username: rootUser.username,
            email: rootUser.email,
            fullName: rootUser.fullName,
            referralCode: rootUser.referralCode,
            role: rootUser.role,
            status: rootUser.status
        });
        console.log('\nCredentials:');
        console.log('  Email: root@mlmplatform.com');
        console.log('  Password: Admin@123');
        console.log('  User ID: EG0000001');
        console.log('  Referral Code:', rootUser.referralCode);

    } catch (error) {
        console.error('Error seeding root user:', error);
        throw error;
    }
}

// Run the seed function if called directly
if (require.main === module) {
    const db = require('../models');

    seedRootUser()
        .then(() => {
            console.log('\n✓ Seed completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n✗ Seed failed:', error);
            process.exit(1);
        });
}

module.exports = seedRootUser;
