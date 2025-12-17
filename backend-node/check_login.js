const { User, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function checkLogin() {
    try {
        console.error('DB Config:', {
            database: sequelize.config.database,
            username: sequelize.config.username,
            host: sequelize.config.host,
            port: sequelize.config.port
        });
        await sequelize.authenticate();
        console.error('Database connected.');

        const email = 'testuser@example.com';
        const password = 'password123';

        console.log(`Attempting login for ${email} with password ${password}`);

        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User not found!');
            const allUsers = await User.findAll({ attributes: ['id', 'email', 'username'] });
            console.log('All users in DB:', allUsers.map(u => u.toJSON()));
            return;
        }

        console.log('User found:', user.username);
        console.log('Stored password hash:', user.password);

        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isValid);

        if (isValid) {
            console.log('Login SUCCESS');
        } else {
            console.log('Login FAILED');

            // Debug: check if it matches double hashing
            const manualHash = await bcrypt.hash(password, 10);
            console.log('New manual hash:', manualHash);

            // Check if stored password is "password123" (plain text)
            if (user.password === password) {
                console.log('WARNING: Password stored as plain text!');
            }
        }

    } catch (error) {
        console.error('Error checking login:', error);
    } finally {
        await sequelize.close();
    }
}

checkLogin();
