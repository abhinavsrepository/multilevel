const { User } = require('../src/models');

async function listUsers() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@example.com' } });
        if (admin) {
            console.log('Admin user FOUND:');
            console.log(`ID: ${admin.id}, Email: ${admin.email}, Password Hash: ${admin.password}`);
        } else {
            console.log('Admin user NOT FOUND.');
        }

        const users = await User.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'email', 'username', 'role', 'firstName', 'lastName']
        });

        if (users.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Found users:');
            users.forEach(user => {
                console.log(`Email: ${user.email}, Username: ${user.username}, Role: ${user.role}, Name: ${user.firstName} ${user.lastName}`);
            });
            console.log('\nCommon password in seed scripts is: password123');
        }
    } catch (error) {
        console.error('Error listing users:', error);
    } finally {
        process.exit();
    }
}

listUsers();
