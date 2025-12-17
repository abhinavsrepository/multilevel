const { User, Wallet } = require('./src/models');

async function resetUserPassword() {
    try {
        console.log('Resetting user panel credentials...\n');

        // Find the existing user
        const user = await User.findOne({
            where: { email: 'userpanel@test.com' }
        });

        if (!user) {
            console.log('❌ User not found!');
            process.exit(1);
        }

        console.log('✅ User found:');
        console.log('   Email:', user.email);
        console.log('   Username:', user.username);
        console.log('   Mobile:', user.mobile);
        console.log('   Role:', user.role);
        console.log('   Status:', user.status);

        // Reset password
        console.log('\n🔐 Setting password to: user12345');
        await user.update({
            password: 'user12345',
            status: 'ACTIVE',
            emailVerified: true,
            phoneVerified: true
        });
        console.log('✅ Password updated successfully!');

        // Ensure wallet exists
        const wallet = await Wallet.findOne({ where: { userId: user.id } });
        if (!wallet) {
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
        } else {
            console.log('✅ Wallet already exists');
        }

        console.log('\n📋 User Panel Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email: userpanel@test.com');
        console.log('   Password: user12345');
        console.log('   Role: MEMBER');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit(0);
    }
}

resetUserPassword();
