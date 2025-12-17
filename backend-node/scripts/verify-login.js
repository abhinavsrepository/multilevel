const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function verifyLogin() {
    try {
        const email = 'admin2@example.com';
        const password = 'password123';

        console.log(`Checking user: ${email}`);
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User NOT FOUND in database.');
            return;
        }

        console.log('User found:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Username: ${user.username}`);
        console.log(`- Status: ${user.status}`);
        console.log(`- Stored Password Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`- Password Match ('${password}'): ${isMatch}`);

        if (isMatch) {
            console.log('SUCCESS: Password is correct.');
        } else {
            console.log('FAILURE: Password does not match.');

            // Attempt to re-hash and save to see if that fixes it
            console.log('Attempting to reset password manually...');
            const newHash = await bcrypt.hash(password, 10);
            console.log(`- New Hash: ${newHash}`);

            // Update directly to avoid hooks for this test if needed, or use hooks
            user.password = password;
            await user.save();
            console.log('Password updated via save() (should trigger hook).');

            const userRefetched = await User.findOne({ where: { email } });
            const isMatchNew = await bcrypt.compare(password, userRefetched.password);
            console.log(`- New Password Match: ${isMatchNew}`);
        }

    } catch (error) {
        console.error('Error verifying login:', error);
    } finally {
        process.exit();
    }
}

verifyLogin();
