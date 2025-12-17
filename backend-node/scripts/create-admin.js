const { User, Wallet, sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const email = 'admin2@example.com';
        const password = 'password123';
        const username = 'admin2';

        console.log(`Attempting to create/update user: ${email}`);

        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log('Admin user already exists.');
            user.password = password;
            await user.save();
            console.log('Password reset to:', password);
        } else {
            console.log('Creating admin user...');
            user = await User.create({
                username,
                email,
                password,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                status: 'ACTIVE',
                referralCode: 'ADMIN456'
            });
            await Wallet.create({ userId: user.id });
            console.log('Admin user created successfully.');
        }

        console.log('-----------------------------------');
        console.log('Login Credentials:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        console.log('Closing database connection...');
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

createAdmin();
