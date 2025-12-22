const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const checkCreds = async (cloudName, apiKey, apiSecret) => {
    console.log(`\nTesting Cloud Name: ${cloudName}`);
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    });

    const buffer = Buffer.from('Test');

    try {
        await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'raw' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
        });
        console.log(`SUCCESS with ${cloudName}!`);
        return true;
    } catch (error) {
        console.log(`FAILED with ${cloudName}: ${error.message}`);
        return false;
    }
}

const run = async () => {
    const apiKey = '377754216812516';
    const apiSecret = 'DTcmDBX-ya5z08nfuSZhK3auRGA';

    // Test 'root'
    await checkCreds('root', apiKey, apiSecret);

    // Test 'Root'
    await checkCreds('Root', apiKey, apiSecret);

    // Test 'dxbvjvtoz'
    await checkCreds('dxbvjvtoz', apiKey, apiSecret);
};

run();
