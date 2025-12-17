const axios = require('axios');

async function testBinaryTreeAPI() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
            email: 'demo@example.com', // Using the known demo user
            password: 'password123'
        });

        const token = loginResponse.data.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Call Binary Tree API
        console.log('Testing /api/v1/tree/binary endpoint...');
        const treeResponse = await axios.get('http://localhost:5000/api/v1/tree/binary', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                depth: 3
            }
        });

        console.log('API Call Successful!');
        console.log('Status:', treeResponse.status);
        console.log('Data:', JSON.stringify(treeResponse.data, null, 2));

    } catch (error) {
        console.error('API Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testBinaryTreeAPI();
