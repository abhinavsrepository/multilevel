const db = require('./src/models');

async function checkModels() {
    try {
        console.log('Checking models...');
        const models = Object.keys(db);
        console.log('Loaded models:', models);

        if (db.Transaction) {
            console.log('Transaction model found.');
        } else {
            console.error('Transaction model NOT found!');
        }

        if (db.Wallet) {
            console.log('Wallet model found.');
        } else {
            console.error('Wallet model NOT found!');
        }
    } catch (error) {
        console.error('Error checking models:', error);
    }
}

checkModels();
