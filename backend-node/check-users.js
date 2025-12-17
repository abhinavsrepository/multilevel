const { User } = require('./src/models');

async function checkUsers() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'mobile', 'role', 'status']
        });

        console.log(`\nFound ${users.length} users:\n`);
        users.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Mobile: ${user.mobile}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Status: ${user.status}\n`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit(0);
    }
}

checkUsers();
