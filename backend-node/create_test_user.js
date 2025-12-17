const { User, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function createTestUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const email = 'demo@example.com';
        const password = 'password123';
        // const hashedPassword = await bcrypt.hash(password, 10); // Don't hash manually, model hooks do it

        // Check if user exists
        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log('Demo user already exists.');
            // Update password
            user.password = password; // Pass plain password
            await user.save();
            console.log('Updated password for existing demo user.');
        } else {
            // Create new user
            try {
                user = await User.create({
                    username: 'demo_user',
                    email: email,
                    password: password, // Pass plain password
                    firstName: 'Demo',
                    lastName: 'User',
                    phoneNumber: '1122334455',
                    referralCode: 'DEMOUSER1',
                    placement: 'AUTO'
                });
                console.log('Created new demo user.');
            } catch (createError) {
                console.error('Error creating user:', createError.message);
                // If username taken, try to find it
                if (createError.message.includes('username')) {
                    console.log('Username might be taken, trying to find by username...');
                    user = await User.findOne({ where: { username: 'demo_user' } });
                    if (user) {
                        console.log('Found user by username. Updating password...');
                        user.password = password;
                        await user.save();
                    }
                }
            }
        }

        console.log('---------------------------------------------------');
        console.log('User Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------------------------------');

        // Verify immediately
        const verifyUser = await User.findOne({ where: { email } });
        console.log('Immediate verification:', verifyUser ? 'FOUND' : 'NOT FOUND');
        if (verifyUser) {
            console.log('Verified ID:', verifyUser.id);
            console.log('Verified Email:', verifyUser.email);
            console.log('Verified Password Hash:', verifyUser.password);
        }

    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await sequelize.close();
    }
}

createTestUser();
