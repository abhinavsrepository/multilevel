require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../src/models');

const API_URL = 'http://localhost:5000/api/v1';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
};

async function verify() {
    try {
        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with.');
            return;
        }

        const token = generateToken(user.id);
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log(`Testing with user: ${user.username} (${user.id})`);

        // 1. Get Team Members
        console.log('\nTesting /members...');
        try {
            const res = await axios.get(`${API_URL}/team/members`, config);
            console.log('Success:', res.data.success);
            console.log('Count:', res.data.data.total);
        } catch (e) {
            console.error('Error /members:', e.response?.data || e.message);
        }

        // 2. Get Team Stats
        console.log('\nTesting /stats...');
        try {
            const res = await axios.get(`${API_URL}/team/stats`, config);
            console.log('Success:', res.data.success);
            console.log('Stats:', res.data.data);
        } catch (e) {
            console.error('Error /stats:', e.response?.data || e.message);
        }

        // 3. Get Team Report
        console.log('\nTesting /report...');
        try {
            const res = await axios.get(`${API_URL}/team/report`, config);
            console.log('Success:', res.data.success);
            console.log('Summary:', res.data.data.summary);
        } catch (e) {
            console.error('Error /report:', e.response?.data || e.message);
        }

        // 4. Get Unilevel Tree
        console.log('\nTesting /unilevel...');
        try {
            const res = await axios.get(`${API_URL}/team/unilevel`, config);
            console.log('Success:', res.data.success);
            console.log('Tree Root:', res.data.data?.name);
        } catch (e) {
            console.error('Error /unilevel:', e.response?.data || e.message);
        }

        // 5. Get Level Breakdown
        console.log('\nTesting /levels...');
        try {
            const res = await axios.get(`${API_URL}/team/levels`, config);
            console.log('Success:', res.data.success);
            console.log('Levels:', res.data.data.length);
        } catch (e) {
            console.error('Error /levels:', e.response?.data || e.message);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
