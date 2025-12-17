const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        console.log('Testing login for admin@mlm.com...\n');

        // Find user
        const user = await User.findOne({
            where: { email: 'admin@mlm.com' }
        });

        if (!user) {
            console.log('❌ User not found!');
            console.log('\nPlease run: node create-admin-user.js');
            process.exit(1);
        }

        console.log('✅ User found:');
        console.log('   Email:', user.email);
        console.log('   User ID:', user.username);
        console.log('   Role:', user.role);
        console.log('   Status:', user.status);
        console.log('   Password Hash:', user.password.substring(0, 20) + '...');

        // Test password
        console.log('\n🔐 Testing password "admin123"...');
        const isPasswordValid = await bcrypt.compare('admin123', user.password);

        if (isPasswordValid) {
            console.log('✅ Password is correct!');
            console.log('\n📋 Login Credentials:');
            console.log('   Email: admin@mlm.com');
            console.log('   Password: admin123');
        } else {
            console.log('❌ Password is incorrect!');
            console.log('\nResetting password to "admin123"...');
            await user.update({ password: 'admin123' });
            console.log('✅ Password reset successfully!');
            console.log('\n📋 Login Credentials:');
            console.log('   Email: admin@mlm.com');
            console.log('   Password: admin123');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit(0);
    }
}

testLogin();
