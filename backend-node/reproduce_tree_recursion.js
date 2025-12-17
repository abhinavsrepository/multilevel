const { User, sequelize } = require('./src/models');
const axios = require('axios');

async function reproduceTreeRecursion() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Find the demo user
        const demoUser = await User.findOne({ where: { email: 'demo@example.com' } });
        if (!demoUser) {
            console.error('Demo user not found. Run create_test_user.js first.');
            return;
        }
        console.log('Found demo user:', demoUser.username);

        // 2. Create a child user (Left Leg)
        const childEmail = 'child_left@example.com';
        let childUser = await User.findOne({ where: { email: childEmail } });

        if (!childUser) {
            childUser = await User.create({
                username: 'child_left',
                email: childEmail,
                password: 'password123',
                firstName: 'Child',
                lastName: 'Left',
                phoneNumber: '9988776655',
                referralCode: 'CHILDLEFT1',
                sponsorId: demoUser.id,
                placementUserId: demoUser.id,
                placement: 'LEFT'
            });
            console.log('Created child user (Left Leg).');
        } else {
            console.log('Child user already exists.');
        }

        // 3. Login as demo user
        console.log('Logging in as demo user...');
        const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'demo@example.com',
            password: 'password123'
        });
        const token = loginResponse.data.data.token;

        // 4. Call Binary Tree API
        console.log('Calling Binary Tree API...');
        const treeResponse = await axios.get('http://localhost:5000/api/v1/tree/binary', {
            headers: { Authorization: `Bearer ${token}` },
            params: { depth: 3 }
        });

        console.log('API Call Successful!');
        console.log('Tree Data:', JSON.stringify(treeResponse.data, null, 2));

    } catch (error) {
        console.error('Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    } finally {
        await sequelize.close();
    }
}

reproduceTreeRecursion();
