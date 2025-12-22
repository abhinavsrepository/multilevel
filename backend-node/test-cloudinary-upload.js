require('dotenv').config();
const cloudinary = require('./src/config/cloudinary');
const streamifier = require('streamifier');

const testUpload = async () => {
    console.log('Starting Cloudinary Connectivity Test...');

    const buffer = Buffer.from('Test file content for verification');

    // Create a Promise to handle the stream upload
    const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'test-debug',
                resource_type: 'raw'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });

    try {
        const result = await uploadPromise;
        console.log('Upload SUCCESS!');
        console.log('Public ID:', result.public_id);
        console.log('Url:', result.secure_url);
    } catch (error) {
        console.error('Upload FAILED!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Full Error:', JSON.stringify(error, null, 2));
    }
};

testUpload();
