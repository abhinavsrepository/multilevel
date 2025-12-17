const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
            username: `testuser_${Date.now()}`,
            email: `testuser_${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: `1234567890${Math.floor(Math.random() * 10)}`
        });
        console.log('Registration Successful:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Registration Failed:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegister();
