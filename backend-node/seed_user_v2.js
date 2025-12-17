const { User, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedUser() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const email = 'userpanel@test.com';
        const password = 'UserPanel@123';

        let user = await User.findOne({ where: { email } });
        if (user) {
            console.log('User exists. Updating password...');
            user.password = password;
            await user.save();
            console.log('Password updated.');
        } else {
            console.log('Creating new user...');
            user = await User.create({
                username: 'userpanel_demo',
                email: email,
                password: password,
                fullName: 'User Panel Demo',
                mobile: '9876543210',
                referralCode: 'USERPANEL1',
                role: 'MEMBER',
                status: 'ACTIVE',
                emailVerified: true,
                phoneVerified: true
            });
            console.log('User created with ID:', user.id);
        }

        console.log('LOGIN CREDENTIALS:');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (err) {
        console.error('SEED ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

seedUser();
