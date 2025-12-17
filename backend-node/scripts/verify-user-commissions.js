const axios = require('axios');
const { User, Commission, sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

const API_URL = 'http://localhost:5000/api/v1';

async function verify() {
    try {
        console.log('Starting verification...');

        // 1. Find a user with commissions
        const commission = await Commission.findOne();
        if (!commission) {
            console.error('No commissions found in DB. Please run seeding script first.');
            return;
        }

        const user = await User.findByPk(commission.userId);
        if (!user) {
            console.error('User not found for commission.');
            return;
        }

        console.log(`Testing with user: ${user.username}`);

        // 2. Login to get token
        // We might not know the password if it was hashed. 
        // But for verification, we can generate a token directly if we have the secret, 
        // OR we can reset the password temporarily.
        // Let's try to login with 'password123' as used in seeding.

        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: user.email,
                password: 'password123'
            });
            token = loginRes.data.data.token;
            console.log('Login successful.');
        } catch (e) {
            console.log('Login failed with password123. Attempting to generate token manually or reset password...');
            // If login fails, we can't easily get a token without hacking the auth middleware or resetting password.
            // Let's reset the password.
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            await user.update({ password: hashedPassword });

            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: user.email,
                password: 'password123'
            });
            token = loginRes.data.data.token;
            console.log('Password reset and Login successful.');
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Test /commissions/history
        console.log('\nTesting /commissions/history...');
        try {
            const historyRes = await axios.get(`${API_URL}/commissions/history`, { headers });
            console.log('Success:', historyRes.data.success);
            console.log('Count:', historyRes.data.pagination.total);
            if (historyRes.data.data.length > 0) {
                console.log('Sample:', historyRes.data.data[0].commissionId);
            }
        } catch (e) {
            console.error('History failed:', e.response?.data || e.message);
        }

        // 4. Test /commissions/summary
        console.log('\nTesting /commissions/summary...');
        try {
            const summaryRes = await axios.get(`${API_URL}/commissions/summary`, { headers });
            console.log('Success:', summaryRes.data.success);
            console.log('Total Earnings:', summaryRes.data.data.totalEarnings);
            console.log('By Type:', JSON.stringify(summaryRes.data.data.byType, null, 2));
            console.log('Distribution:', JSON.stringify(summaryRes.data.data.distribution, null, 2));
        } catch (e) {
            console.error('Summary failed:', e.response?.data || e.message);
        }

        // 5. Test /commissions/trends
        console.log('\nTesting /commissions/trends...');
        try {
            const trendsRes = await axios.get(`${API_URL}/commissions/trends`, { headers });
            console.log('Success:', trendsRes.data.success);
            console.log('Trends Data Length:', trendsRes.data.data.length);
            if (trendsRes.data.data.length > 0) {
                console.log('Sample Trend:', trendsRes.data.data[trendsRes.data.data.length - 1]);
            }
        } catch (e) {
            console.error('Trends failed:', e.response?.data || e.message);
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        // await sequelize.close(); // Don't close if we want to keep app running, but this is a script
    }
}

verify();
