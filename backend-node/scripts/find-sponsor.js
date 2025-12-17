const { User } = require('../src/models');
const { Op } = require('sequelize');

async function findSponsor() {
    try {
        const args = process.argv.slice(2);
        const identifier = args[0];

        if (!identifier) {
            console.log('Usage: node scripts/find-sponsor.js <username_or_email>');
            console.log('Listing first 10 users with their sponsors as no argument provided...');

            const users = await User.findAll({
                limit: 10,
                include: [{ model: User, as: 'Sponsor', attributes: ['username', 'firstName', 'lastName', 'email', 'referralCode'] }],
                attributes: ['username', 'firstName', 'lastName', 'email']
            });

            if (users.length === 0) {
                console.log('No users found.');
            } else {
                console.log('----------------------------------------------------------------');
                console.log('| User Username | User Name | Sponsor Username | Sponsor Name |');
                console.log('----------------------------------------------------------------');
                users.forEach(user => {
                    const sponsor = user.Sponsor;
                    const sponsorUsername = sponsor ? sponsor.username : 'NONE';
                    const sponsorName = sponsor ? `${sponsor.firstName} ${sponsor.lastName}` : 'N/A';
                    console.log(`| ${user.username.padEnd(13)} | ${(user.firstName + ' ' + user.lastName).padEnd(9)} | ${sponsorUsername.padEnd(16)} | ${sponsorName.padEnd(12)} |`);
                });
                console.log('----------------------------------------------------------------');
            }
            return;
        }

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ]
            },
            include: [{ model: User, as: 'Sponsor' }]
        });

        if (!user) {
            console.log(`User not found with identifier: ${identifier}`);
            return;
        }

        console.log(`\nUser Found: ${user.firstName} ${user.lastName} (${user.username})`);

        if (user.Sponsor) {
            console.log('\n--- Sponsor Details ---');
            console.log(`Name: ${user.Sponsor.firstName} ${user.Sponsor.lastName}`);
            console.log(`Username: ${user.Sponsor.username}`);
            console.log(`Email: ${user.Sponsor.email}`);
            console.log(`Referral Code: ${user.Sponsor.referralCode}`);
            console.log(`ID: ${user.Sponsor.id}`);
        } else {
            console.log('\nThis user has NO sponsor (Root node or orphan).');
        }

    } catch (error) {
        console.error('Error finding sponsor:', error);
    } finally {
        process.exit();
    }
}

findSponsor();
