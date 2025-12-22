const { User, Wallet, sequelize, ActivityLog } = require('./src/models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Complete Authentication Flow Test
 * Tests both registration and login by simulating the exact controller logic
 */
async function testCompleteAuthFlow() {
    console.log('='.repeat(70));
    console.log('COMPLETE AUTHENTICATION FLOW TEST');
    console.log('='.repeat(70));
    console.log();

    try {
        await sequelize.authenticate();
        console.log('✓ Database connected\n');

        // Test credentials
        const testEmail = `authtest_${Date.now()}@example.com`;
        const testMobile = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
        const testPassword = 'TestPass@123';
        const testFullName = 'Auth Flow Test User';

        console.log('TEST CREDENTIALS:');
        console.log('  Email:', testEmail);
        console.log('  Mobile:', testMobile);
        console.log('  Password:', testPassword);
        console.log('  Full Name:', testFullName);
        console.log();

        // ================================================================
        // PART 1: REGISTRATION (Simulating auth.controller.js register function)
        // ================================================================
        console.log('PART 1: TESTING REGISTRATION');
        console.log('-'.repeat(70));

        // Check if user exists
        const emailExists = await User.findOne({ where: { email: testEmail } });
        if (emailExists) {
            console.log('❌ Email already exists');
            return;
        }

        const mobileExists = await User.findOne({ where: { mobile: testMobile } });
        if (mobileExists) {
            console.log('❌ Mobile already exists');
            return;
        }
        console.log('✓ Email and mobile are unique');

        // Generate User ID
        let userId;
        let isUniqueId = false;
        let attempts = 0;
        while (!isUniqueId && attempts < 10) {
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

            userId = `EG${nextNumber.toString().padStart(7, '0')}`;

            const existing = await User.findOne({ where: { username: userId } });
            if (!existing) {
                isUniqueId = true;
            } else {
                attempts++;
                // If user exists, try next number
                nextNumber++;
                userId = `EG${nextNumber.toString().padStart(7, '0')}`;
            }
        }

        if (!isUniqueId) {
            console.log('❌ Could not generate unique user ID');
            return;
        }
        console.log('✓ Generated User ID:', userId);

        // Generate unique referral code
        let referralCode;
        let isUnique = false;
        while (!isUnique) {
            referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await User.findOne({ where: { referralCode } });
            if (!existing) isUnique = true;
        }
        console.log('✓ Generated Referral Code:', referralCode);

        // Create user (THIS IS THE EXACT LOGIC FROM auth.controller.js:113-126)
        console.log('Creating user...');
        const user = await User.create({
            username: userId,
            email: testEmail,
            password: testPassword,  // Will be hashed by beforeCreate hook
            fullName: testFullName,
            mobile: testMobile,
            referralCode: referralCode,
            sponsorId: null,
            sponsorUserId: null,
            placementUserId: null,
            placement: 'AUTO',
            role: 'MEMBER',
            status: 'ACTIVE'  // ← EXPLICITLY SET TO ACTIVE
        });

        console.log('✓ User created successfully');
        console.log('  ID:', user.id);
        console.log('  Username:', user.username);
        console.log('  Status:', user.status);
        console.log('  Password is hashed:', user.password !== testPassword);
        console.log('  Password hash:', user.password.substring(0, 25) + '...');

        // Create wallet (THIS IS THE EXACT LOGIC FROM auth.controller.js:130-136)
        await Wallet.create({
            userId: user.id,
            depositBalance: 0,
            commissionBalance: 0,
            totalEarned: 0,
            totalWithdrawn: 0
        });
        console.log('✓ Wallet created');

        // Log activity (THIS IS THE EXACT LOGIC FROM auth.controller.js:139-145)
        await ActivityLog.create({
            userId: user.id,
            action: 'USER_REGISTERED',
            description: `New user registered: ${user.fullName} (${user.username})`,
            ipAddress: '127.0.0.1',
            userAgent: 'Test Script'
        });
        console.log('✓ Activity log created');
        console.log();

        // ================================================================
        // PART 2: LOGIN (Simulating auth.controller.js login function)
        // ================================================================
        console.log('PART 2: TESTING LOGIN WITH EMAIL');
        console.log('-'.repeat(70));

        // Find user by email (THIS IS THE EXACT LOGIC FROM auth.controller.js:191-198)
        const loginUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: testEmail },
                    { mobile: testEmail }
                ]
            }
        });

        if (!loginUser) {
            console.log('❌ User not found during login');
            return;
        }
        console.log('✓ User found:', loginUser.username);

        // Validate password (THIS IS THE EXACT LOGIC FROM auth.controller.js:200)
        const isPasswordValid = await loginUser.validatePassword(testPassword);
        console.log('Password validation result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ Password validation FAILED');

            // Debug: manual bcrypt check
            const manualCheck = await bcrypt.compare(testPassword, loginUser.password);
            console.log('Manual bcrypt check:', manualCheck);
            return;
        }
        console.log('✓ Password validated successfully');

        // Check status (THIS IS THE EXACT LOGIC FROM auth.controller.js:202-207)
        if (loginUser.status !== 'ACTIVE') {
            console.log('❌ User status is not ACTIVE:', loginUser.status);
            return;
        }
        console.log('✓ User status is ACTIVE');
        console.log();

        // ================================================================
        // PART 3: LOGIN WITH MOBILE NUMBER
        // ================================================================
        console.log('PART 3: TESTING LOGIN WITH MOBILE');
        console.log('-'.repeat(70));

        const loginUserMobile = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { email: testMobile },
                    { mobile: testMobile }
                ]
            }
        });

        if (!loginUserMobile) {
            console.log('❌ User not found when logging in with mobile');
            return;
        }
        console.log('✓ User found with mobile:', loginUserMobile.username);

        const isPasswordValidMobile = await loginUserMobile.validatePassword(testPassword);
        console.log('Password validation with mobile:', isPasswordValidMobile);

        if (!isPasswordValidMobile) {
            console.log('❌ Password validation FAILED with mobile login');
            return;
        }
        console.log('✓ Password validated successfully with mobile');

        if (loginUserMobile.status !== 'ACTIVE') {
            console.log('❌ User status is not ACTIVE');
            return;
        }
        console.log('✓ User status is ACTIVE');
        console.log();

        // ================================================================
        // FINAL RESULTS
        // ================================================================
        console.log('='.repeat(70));
        console.log('FINAL RESULTS');
        console.log('='.repeat(70));
        console.log('✅ REGISTRATION: SUCCESS');
        console.log('✅ LOGIN WITH EMAIL: SUCCESS');
        console.log('✅ LOGIN WITH MOBILE: SUCCESS');
        console.log();
        console.log('CONCLUSION:');
        console.log('  Newly registered users CAN successfully log in!');
        console.log('  Both email and mobile login work correctly.');
        console.log();
        console.log('Test user credentials:');
        console.log('  Email:', testEmail);
        console.log('  Mobile:', testMobile);
        console.log('  Password:', testPassword);
        console.log('  User ID:', userId);
        console.log();

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error();
        console.error('Full error:');
        console.error(error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

testCompleteAuthFlow();
