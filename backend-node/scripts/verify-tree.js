const axios = require('axios');
const { User, sequelize } = require('../src/models');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5000/api/v1';

async function verify() {
    try {
        console.log('Starting Tree Verification...');

        // 1. Get a test user
        const user = await User.findOne();
        if (!user) {
            console.error('No user found');
            return;
        }
        console.log(`Testing with User: ${user.username} (ID: ${user.id})`);

        // 2. Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        // 3. Call Tree API
        try {
            const response = await axios.get(`${API_URL}/tree/binary`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const tree = response.data.data;
            console.log('Tree API Response Status:', response.status);

            // 4. Verify Structure
            if (tree.userId && tree.name && tree.bv && Array.isArray(tree.children)) {
                console.log('Tree Structure Valid:');
                console.log('- userId:', tree.userId);
                console.log('- name:', tree.name);
                console.log('- bv:', tree.bv);
                console.log('- children count:', tree.children.length);

                if (tree.children.length > 0) {
                    console.log('  - First Child Placement:', tree.children[0].placement);
                }
            } else {
                console.error('Invalid Tree Structure:', tree);
            }

        } catch (apiError) {
            console.error('API Call Failed Status:', apiError.response ? apiError.response.status : 'Unknown');
            console.error('API Call Failed Data:', JSON.stringify(apiError.response ? apiError.response.data : apiError.message, null, 2));
        }

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await sequelize.close();
    }
}

verify();
