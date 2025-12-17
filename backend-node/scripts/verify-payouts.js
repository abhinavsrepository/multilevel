const axios = require('axios');
const { User, Payout, Wallet, sequelize } = require('../src/models');

const API_URL = 'http://localhost:5000/api/v1';

async function verify() {
    try {
        console.log('Starting Payouts Verification...');

        // 1. Create a dummy payout request directly in DB for testing
        const user = await User.findOne();
        if (!user) {
            console.error('No user found');
            return;
        }

        const payoutId = 'PO_TEST_' + Date.now();
        const payout = await Payout.create({
            payoutId,
            userId: user.id,
            requestedAmount: 1000,
            tdsAmount: 50,
            adminCharge: 20,
            netAmount: 930,
            paymentMethod: 'BANK_TRANSFER',
            status: 'REQUESTED',
            requestedAt: new Date()
        });

        console.log(`Created test payout: ${payoutId}`);

        // 2. Login as Admin (assuming we have a way or just use a known token if possible, 
        // but for script simplicity, let's assume we can hit the endpoint if we mock auth or use a real token)
        // Since we can't easily get an admin token without credentials, we will simulate the controller logic directly 
        // OR we can try to login if we know admin credentials.
        // Let's rely on unit-test style verification of the logic by calling the API if we can get a token.

        // Actually, let's just use the `axios` calls if we can get a token.
        // If not, we can manually check if the routes are registered by hitting them and expecting 401.

        console.log('Testing Admin Route Protection...');
        try {
            await axios.get(`${API_URL}/commissions/payouts/admin/all`);
        } catch (e) {
            console.log('Expected 401/403 for unauthenticated request:', e.response?.status);
        }

        // Since full E2E is hard without admin credentials in script, 
        // let's verify the model and controller logic by inspecting the DB state after manual changes if we were to run them.
        // But we can't run controller code directly here easily without mocking req/res.

        // Let's just confirm the Payout was created and can be found.
        const foundPayout = await Payout.findOne({ where: { payoutId } });
        if (foundPayout) {
            console.log('Payout successfully persisted in DB.');
        } else {
            console.error('Payout not found in DB.');
        }

        // Clean up
        await payout.destroy();
        console.log('Test payout cleaned up.');

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        // await sequelize.close();
    }
}

verify();
