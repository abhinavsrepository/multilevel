const { User, sequelize } = require('./src/models');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

async function testRegister() {
    try {
        console.log('Authenticating database...');
        await sequelize.authenticate();
        console.log('Database connection OK.');

        // 1. Get a valid sponsor
        const sponsor = await User.findOne({ order: [['createdAt', 'DESC']] });
        if (!sponsor) {
            console.log('No users found to act as sponsor. Skipping sponsor test.');
        } else {
            console.log(`Found sponsor: ${sponsor.username} (${sponsor.referralCode})`);

            // Test registration with sponsor
            const suffix = Math.floor(Math.random() * 10000);
            const userData = {
                username: `sponsored${suffix}`,
                email: `sponsored${suffix}@example.com`,
                password: 'password123',
                firstName: 'Sponsored',
                lastName: 'User',
                phoneNumber: `999${suffix}`,
                referralCode: `REF${suffix}`,
                sponsorCode: sponsor.referralCode, // This is what controller expects in body, but controller converts it to sponsorId
                placement: 'AUTO'
            };

            // Note: Controller logic manually handles sponsorCode. 
            // Here we are testing User.create directly, so we need to simulate what controller does.
            // The controller finds sponsor and sets sponsorId and placementUserId.

            const createData = {
                ...userData,
                sponsorId: sponsor.id,
                placementUserId: sponsor.id,
                placement: 'AUTO'
            };
            delete createData.sponsorCode; // User model doesn't have sponsorCode

            console.log('Attempting to create user with sponsor:', createData);
            try {
                const user = await User.create(createData);
                console.log('User with sponsor created successfully:', user.id);
            } catch (e) {
                console.error('Error creating user with sponsor:', e.message);
            }
        }

        // 2. Test lowercase placement (simulating Flutter app)
        console.log('Testing lowercase placement...');
        const suffix2 = Math.floor(Math.random() * 10000);
        const invalidData = {
            username: `lowercase${suffix2}`,
            email: `lowercase${suffix2}@example.com`,
            password: 'password123',
            firstName: 'Lowercase',
            lastName: 'Placement',
            phoneNumber: `888${suffix2}`,
            referralCode: `REF${suffix2}`,
            placement: 'left' // Lowercase, should fail
        };

        try {
            await User.create(invalidData);
            console.log('User with lowercase placement created (UNEXPECTED!)');
        } catch (error) {
            console.log('Caught expected error for lowercase placement:', error.message);
            if (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.code === '22P02') {
                console.log('Confirmed: Invalid input syntax for enum (Postgres error)');
            }
        }

    } catch (error) {
        console.error('Global Error:', error);
    } finally {
        await sequelize.close();
    }
}

testRegister();
