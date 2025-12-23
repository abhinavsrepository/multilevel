const { User, Wallet, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Test Registration and Login Flow
 * This script tests whether a newly registered user can successfully log in
 */
async function testRegistrationLoginFlow() {
    try {
        console.log('='.repeat(60));
        console.log('Testing Registration and Login Flow');
        console.log('='.repeat(60));

        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Test credentials
        const testEmail = `test_${Date.now()}@example.com`;
        const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
        const testPassword = 'TestPassword@123';
        const testFullName = 'Test User Registration';

        console.log('Test User Details:');
        console.log(`  Email: ${testEmail}`);
        console.log(`  Mobile: ${testMobile}`);
        console.log(`  Password: ${testPassword}`);
        console.log(`  Full Name: ${testFullName}\n`);

        // =====================================================
        // STEP 1: SIMULATE REGISTRATION (as done in auth.controller.js)
        // =====================================================
        console.log('STEP 1: Simulating User Registration');
        console.log('-'.repeat(60));

        // Generate User ID
        const lastUser = await User.findOne({
            where: {
                username: {
                    [require('sequelize').Op.like]: 'EG%'
                }
            },
            order: [['id', 'DESC']]
        });

        let nextNumber = 1;
        if (lastUser && lastUser.username) {
            const lastNumber = parseInt(lastUser.username.replace('EG', ''), 10);
            nextNumber = lastNumber + 1;
        }
        const userId = `EG${nextNumber.toString().padStart(7, '0')}`;
        console.log(`  Generated User ID: ${userId}`);

        // Generate referral code
        const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        console.log(`  Generated Referral Code: ${referralCode}`);

        // Create user (password will be hashed by beforeCreate hook)
        console.log(`  Creating user with password: "${testPassword}"`);
        const user = await User.create({
            username: userId,
            email: testEmail,
            password: testPassword, // This should be hashed by the beforeCreate hook
            fullName: testFullName,
            mobile: testMobile,
            referralCode: referralCode,
            sponsorId: null,
            sponsorUserId: null,
            placementUserId: null,
            placement: 'AUTO',
            role: 'MEMBER',
            status: 'ACTIVE' // Explicitly set to ACTIVE
        });

        console.log(`  ✓ User created with ID: ${user.id}`);
        console.log(`  User Status: ${user.status}`);
        console.log(`  Password Hash Length: ${user.password.length}`);
        console.log(`  Password Hash Prefix: ${user.password.substring(0, 10)}...`);

        // Create wallet
        await Wallet.create({
            userId: user.id,
            depositBalance: 0,
            commissionBalance: 0,
            totalEarned: 0,
            totalWithdrawn: 0
        });
        console.log(`  ✓ Wallet created for user\n`);

        // =====================================================
        // STEP 2: VERIFY PASSWORD HASHING
        // =====================================================
        console.log('STEP 2: Verifying Password Hashing');
        console.log('-'.repeat(60));

        const isPasswordHashed = user.password !== testPassword;
        console.log(`  Is password hashed: ${isPasswordHashed}`);

        if (!isPasswordHashed) {
            console.log('  ❌ ERROR: Password was NOT hashed! This is a security issue.');
            console.log('  The beforeCreate hook may not be working properly.\n');
        } else {
            console.log('  ✓ Password was properly hashed by beforeCreate hook\n');
        }

        // =====================================================
        // STEP 3: SIMULATE LOGIN (as done in auth.controller.js)
        // =====================================================
        console.log('STEP 3: Simulating User Login');
        console.log('-'.repeat(60));

        // Find user by email or mobile (as in login controller)
        const loginUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: testEmail },
                    { mobile: testMobile }
                ]
            }
        });

        if (!loginUser) {
            console.log('  ❌ ERROR: User not found during login attempt!\n');
            return;
        }
        console.log(`  ✓ User found: ${loginUser.username}`);

        // Check user status
        console.log(`  User Status: ${loginUser.status}`);
        if (loginUser.status !== 'ACTIVE') {
            console.log(`  ❌ ERROR: User status is "${loginUser.status}", not ACTIVE!`);
            console.log('  Login would be rejected due to inactive account.\n');
            return;
        }
        console.log('  ✓ User status is ACTIVE');

        // Validate password using the model method
        console.log(`  Validating password: "${testPassword}"`);
        const isPasswordValid = await loginUser.validatePassword(testPassword);
        console.log(`  Password validation result: ${isPasswordValid}`);

        if (!isPasswordValid) {
            console.log('  ❌ ERROR: Password validation failed!');
            console.log('  Attempting manual bcrypt comparison...');

            const manualComparison = await bcrypt.compare(testPassword, loginUser.password);
            console.log(`  Manual bcrypt comparison result: ${manualComparison}`);

            if (!manualComparison) {
                console.log('  ❌ ERROR: Manual comparison also failed!');
                console.log('  There is a fundamental issue with password hashing/validation.\n');
            }
        } else {
            console.log('  ✓ Password validation successful!\n');
        }

        // =====================================================
        // STEP 4: FINAL VERDICT
        // =====================================================
        console.log('STEP 4: Final Verdict');
        console.log('='.repeat(60));

        if (loginUser && isPasswordValid && loginUser.status === 'ACTIVE') {
            console.log('✅ SUCCESS: Newly registered user CAN log in successfully!');
            console.log('The registration and login flow is working correctly.\n');
        } else {
            console.log('❌ FAILURE: Newly registered user CANNOT log in!');
            console.log('Issues found:');
            if (!loginUser) {
                console.log('  - User not found in database');
            }
            if (loginUser && loginUser.status !== 'ACTIVE') {
                console.log(`  - User status is "${loginUser.status}" instead of "ACTIVE"`);
            }
            if (loginUser && !isPasswordValid) {
                console.log('  - Password validation failed');
            }
            console.log();
        }

        // =====================================================
        // STEP 5: CLEANUP (Optional)
        // =====================================================
        console.log('STEP 5: Cleanup');
        console.log('-'.repeat(60));
        console.log('Test user will remain in database for further testing.');
        console.log('To manually test login, use these credentials:');
        console.log(`  Email: ${testEmail}`);
        console.log(`  Password: ${testPassword}\n`);

    } catch (error) {
        console.error('❌ Error during test:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

// Run the test
testRegistrationLoginFlow();
