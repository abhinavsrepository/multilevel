const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const newConfig = {
    CLOUDINARY_CLOUD_NAME: 'reet',
    CLOUDINARY_API_KEY: '769619441439919',
    CLOUDINARY_API_SECRET: 'OcDhOyoCUt5AGsinBN1UxhfrTNM'
};

try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Original content length:', envContent.length);

    let updated = false;
    for (const [key, value] of Object.entries(newConfig)) {
        const regex = new RegExp(`${key}=.*`, 'g');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${value}`);
            updated = true;
        } else {
            // Append if not found
            envContent += `\n${key}=${value}`;
            updated = true;
        }
    }

    if (updated) {
        fs.writeFileSync(envPath, envContent);
        console.log('Successfully updated .env file with new Cloudinary credentials.');
    } else {
        console.log('No changes were needed.');
    }

} catch (err) {
    console.error('Error updating .env file:', err);
}
