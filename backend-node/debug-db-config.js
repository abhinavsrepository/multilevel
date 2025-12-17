require('dotenv').config();

console.log('='.repeat(60));
console.log('DATABASE CONFIGURATION DEBUG');
console.log('='.repeat(60));

console.log('\n1. ENVIRONMENT:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   PORT:', process.env.PORT || 'not set');

console.log('\n2. DATABASE_URL:');
if (process.env.DATABASE_URL) {
    console.log('   ✓ DATABASE_URL is set');
    try {
        const url = new URL(process.env.DATABASE_URL);
        console.log('   Protocol:', url.protocol);
        console.log('   Host:', url.hostname);
        console.log('   Port:', url.port || '5432 (default)');
        console.log('   Database:', url.pathname.slice(1));
        console.log('   Username:', url.username);
        console.log('   Password:', url.password ? '***' + url.password.slice(-4) : 'not set');
    } catch (error) {
        console.log('   ✗ ERROR parsing DATABASE_URL:', error.message);
        console.log('   Raw value (first 50 chars):', process.env.DATABASE_URL.substring(0, 50) + '...');
    }
} else {
    console.log('   ✗ DATABASE_URL is NOT set');
    console.log('\n   Checking individual DB variables:');
    console.log('   DB_HOST:', process.env.DB_HOST || 'not set');
    console.log('   DB_PORT:', process.env.DB_PORT || 'not set');
    console.log('   DB_NAME:', process.env.DB_NAME || 'not set');
    console.log('   DB_USER:', process.env.DB_USER || 'not set');
    console.log('   DB_PASS:', process.env.DB_PASS ? '***' + process.env.DB_PASS.slice(-4) : 'not set');
}

console.log('\n3. LOADING CONFIG MODULE:');
try {
    const config = require('./src/config/database');
    const env = process.env.NODE_ENV || 'development';
    const dbConfig = config[env];

    console.log('   Environment:', env);
    console.log('   Config loaded:', dbConfig ? '✓' : '✗');

    if (dbConfig) {
        console.log('   Host:', dbConfig.host);
        console.log('   Port:', dbConfig.port);
        console.log('   Database:', dbConfig.database);
        console.log('   Username:', dbConfig.username);
        console.log('   Dialect:', dbConfig.dialect);
        console.log('   SSL Enabled:', dbConfig.dialectOptions?.ssl ? 'Yes' : 'No');
    }
} catch (error) {
    console.log('   ✗ ERROR loading config:', error.message);
}

console.log('\n4. ALL ENVIRONMENT VARIABLES:');
const envVars = Object.keys(process.env).filter(key =>
    key.includes('DB') ||
    key.includes('DATABASE') ||
    key.includes('POSTGRES') ||
    key.includes('NODE_ENV') ||
    key.includes('PORT')
).sort();

if (envVars.length > 0) {
    envVars.forEach(key => {
        const value = process.env[key];
        if (key.toLowerCase().includes('pass') || key.toLowerCase().includes('secret')) {
            console.log(`   ${key}: ***${value.slice(-4)}`);
        } else if (key === 'DATABASE_URL') {
            console.log(`   ${key}: ${value.substring(0, 50)}...`);
        } else {
            console.log(`   ${key}: ${value}`);
        }
    });
} else {
    console.log('   ✗ No database-related environment variables found');
}

console.log('\n' + '='.repeat(60));
console.log('END OF DEBUG OUTPUT');
console.log('='.repeat(60));
