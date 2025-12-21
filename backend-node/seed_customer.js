const { User, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');

async function seedCustomer() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        const email = 'customer@test.com';
        const password = 'Customer@123';

        let user = await User.findOne({ where: { email } });
        if (user) {
            console.log('User exists. Updating password and role...');
            user.password = password;
            user.role = 'CUSTOMER';
            await user.save();
            console.log('User updated.');
        } else {
            console.log('Creating new customer...');
            user = await User.create({
                username: 'customer_demo',
                email: email,
                password: password,
                fullName: 'Customer Demo',
                mobile: '9876543211', // Different mobile
                referralCode: 'CUST123',
                role: 'CUSTOMER',
                status: 'ACTIVE',
                emailVerified: true,
                phoneVerified: true
            });
            console.log('User created with ID:', user.id);
        }

        console.log('LOGIN CREDENTIALS:');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Role: CUSTOMER');

    } catch (err) {
        console.error('SEED ERROR:', err);
    } finally {
        await sequelize.close();
    }
}

seedCustomer();
