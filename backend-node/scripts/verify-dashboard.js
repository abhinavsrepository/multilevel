const axios = require('axios');
const { User } = require('../src/models');
require('dotenv').config();

async function verifyDashboard() {
    try {
        // 1. Login as admin
        console.log('Logging in as admin2@example.com...');
        const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
            emailOrMobile: 'demo@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('Login successful. Token received.');

        // 2. Call dashboard endpoint
        console.log('Calling GET /api/v1/users/dashboard...');
        const dashboardResponse = await axios.get('http://localhost:5000/api/v1/users/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Dashboard Response:', JSON.stringify(dashboardResponse.data, null, 2));

        if (dashboardResponse.data.success) {
            console.log('✅ Dashboard endpoint verification SUCCESS!');
        } else {
            console.error('❌ Dashboard endpoint returned success: false');
        }

    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('❌ Verification Failed:', errorMsg);
        require('fs').writeFileSync('dashboard_error.log', errorMsg);
    }
}

verifyDashboard();
