const https = require('https');

const BASE_URL = 'https://mlm-backend-ljan.onrender.com/api/v1/fix';

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        https.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

async function monitorAndFix() {
    console.log('Waiting for deployment to complete (polling /schema endpoint)...');

    let attempts = 0;
    const maxAttempts = 60; // 5 minutes approx (5s interval)

    while (attempts < maxAttempts) {
        try {
            console.log(`Attempt ${attempts + 1}: Checking if update is live...`);
            // Check if schema endpoint exists
            await makeRequest('/schema');
            console.log('Deployment detected! Schema synced successfully.');

            console.log('Triggering Rank Fix...');
            const rankResult = await makeRequest('/ranks');
            console.log('Rank Fix Result:', rankResult);

            console.log('------------------------------------------------');
            console.log('SUCCESS: Production Database Fixed.');
            console.log('------------------------------------------------');
            return;

        } catch (error) {
            // If 404, it means old version is still running
            if (error.message.includes('Status: 404')) {
                console.log('Not ready yet (404). Retrying in 10s...');
            } else {
                console.log('Error:', error.message);
                console.log('Retrying in 10s...');
            }
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    console.error('Timeout waiting for deployment.');
}

monitorAndFix();
