const { User, Wallet } = require('./src/models');

async function createAdminWallet() {
    try {
        // Find the admin user
        const admin = await User.findOne({
            where: { email: 'admin@mlm.com' }
        });

        if (!admin) {
            console.log('Admin user not found!');
            process.exit(1);
        }

        console.log('Found admin user:', admin.email);
        console.log('User ID:', admin.id);

        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({
            where: { userId: admin.id }
        });

        if (existingWallet) {
            console.log('Wallet already exists for admin user!');
            console.log('Wallet ID:', existingWallet.id);
            console.log('Investment Balance:', existingWallet.investmentBalance);
            console.log('Commission Balance:', existingWallet.commissionBalance);
        } else {
            // Create wallet for admin
            const wallet = await Wallet.create({
                userId: admin.id,
                investmentBalance: 0,
                commissionBalance: 0,
                rentalIncomeBalance: 0,
                roiBalance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                totalInvested: 0,
                lockedBalance: 0
            });

            console.log('Wallet created successfully!');
            console.log('Wallet ID:', wallet.id);
        }

    } catch (error) {
        console.error('Error creating wallet:', error);
    } finally {
        process.exit(0);
    }
}

createAdminWallet();
