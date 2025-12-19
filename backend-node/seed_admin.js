const { User, Wallet, sequelize } = require('./src/models');

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✓ DB Connected');

        const email = 'admin@mlm.com';
        const password = 'Admin@123456';
        const username = 'admin_mlm';

        console.log('\nAttempting to create/update admin user...');

        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log('⚠ Admin user already exists. Updating password...');
            user.password = password; // Will be hashed by beforeUpdate hook
            user.role = 'ADMIN';
            user.status = 'ACTIVE';
            user.emailVerified = true;
            user.phoneVerified = true;
            await user.save();
            console.log('✓ Admin password and details updated.');
        } else {
            console.log('Creating new admin user...');
            user = await User.create({
                username: username,
                email: email,
                password: password, // Will be hashed by beforeCreate hook
                fullName: 'MLM Administrator',
                mobile: '9999999999',
                referralCode: 'ADMIN001',
                role: 'ADMIN',
                status: 'ACTIVE',
                emailVerified: true,
                phoneVerified: true,
                rank: 'Admin'
            });
            console.log('✓ Admin user created with ID:', user.id);

            // Create wallet for admin
            const existingWallet = await Wallet.findOne({ where: { userId: user.id } });
            if (!existingWallet) {
                await Wallet.create({
                    userId: user.id,
                    investmentBalance: 0,
                    commissionBalance: 0,
                    rentalIncomeBalance: 0,
                    roiBalance: 0
                });
                console.log('✓ Wallet created for admin.');
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('ADMIN PANEL LOGIN CREDENTIALS:');
        console.log('='.repeat(50));
        console.log('Email:    ', email);
        console.log('Password: ', password);
        console.log('Username: ', username);
        console.log('='.repeat(50));
        console.log('\nUse these credentials to login to the Admin Panel');
        console.log('');

    } catch (err) {
        console.error('✗ SEED ERROR:', err.message);
        console.error(err);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

seedAdmin();
