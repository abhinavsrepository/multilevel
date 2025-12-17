const axios = require('axios');

async function testRegisterMismatch() {
    try {
        const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
            userName: `user_${Date.now()}`, // Frontend sends userName but maps to username? Wait, let's check RegisterSimple.tsx again.
            // RegisterSimple.tsx: fullName: formData.userName
            // So it sends fullName.
            fullName: `Test User ${Date.now()}`,
            email: `testmismatch_${Date.now()}@example.com`,
            password: 'password123',
            mobile: `987654321${Math.floor(Math.random() * 10)}`,
            sponsorId: 'root_1764498370725', // Using a known sponsor username
            username: `user_${Date.now()}` // Frontend sends fullName as userName? No.
            // RegisterSimple.tsx:
            // const registrationData = {
            //   fullName: formData.userName,
            //   email: formData.email,
            //   mobile: formData.mobileNo,
            //   password: formData.password,
            //   confirmPassword: formData.password,
            //   sponsorId: formData.sponsorId,
            //   ...
            // };
            // Wait, does it send 'username'?
            // No, it sends 'fullName'.
            // But auth.controller.js expects 'username'.
            // If 'username' is missing, User.create will fail (allowNull: false).
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

// Wait, I need to check if RegisterSimple.tsx sends 'username'.
// It sends:
// fullName: formData.userName
// email: ...
// mobile: ...
// password: ...
// sponsorId: ...
//
// It DOES NOT send 'username'.
// But User model requires 'username'.
// And auth.controller.js uses 'username' from req.body.
//
// If 'username' is missing, it will be undefined.
// User.create({ username: undefined, ... }) -> Not Null Violation.
//
// So I need to map 'fullName' (or generate a username) if 'username' is missing.
// Or maybe 'fullName' IS the username in the frontend's mind?
// In RegisterSimple.tsx:
// label="User Name" -> formData.userName
// And it sends it as 'fullName'.
//
// So I should map 'fullName' to 'username' as well, or 'firstName'/'lastName'.
// Actually, usually 'username' is a unique handle. 'fullName' is the display name.
// If the frontend only asks for "User Name" and sends it as "fullName", maybe it intends it to be the Name.
// But we need a 'username' for login/uniqueness.
//
// I should probably use the email as username or generate one from the name if missing.
// Or map `fullName` to `username` if `username` is missing?
// But `fullName` might contain spaces.
//
// Let's look at `RegisterSimple.tsx` again.
// It has a field "User Name".
// And sends it as `fullName`.
//
// I will update `auth.controller.js` to use `fullName` as `username` (removing spaces/special chars) if `username` is missing.
//
// Let's verify this hypothesis first.

testRegisterMismatch();
