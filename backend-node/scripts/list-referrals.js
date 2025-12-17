const { User } = require('../src/models');
const { Op } = require('sequelize');

async function listReferrals() {
    try {
        const args = process.argv.slice(2);
        const identifier = args[0];

        if (!identifier) {
            console.log('Usage: node scripts/list-referrals.js <sponsor_username_or_email>');
            return;
        }

        // Find the sponsor first
        const sponsor = await User.findOne({
            where: {
                [Op.or]: [
                    { username: identifier },
                    { email: identifier }
                ]
            }
        });

        if (!sponsor) {
            console.log(`Sponsor not found with identifier: ${identifier}`);
            return;
        }

        console.log(`\nFound Sponsor: ${sponsor.firstName} ${sponsor.lastName} (${sponsor.username})`);
        console.log(`ID: ${sponsor.id}`);

        // Find direct referrals
        const referrals = await User.findAll({
            where: { sponsorId: sponsor.id },
            attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'createdAt', 'rank', 'status']
        });

        if (referrals.length === 0) {
            console.log('This user has no direct referrals.');
        } else {
            console.log(`\nFound ${referrals.length} direct referrals:`);
            console.log('------------------------------------------------------------------------------------------');
            console.log('| Username        | Name             | Email                | Rank       | Status   |');
            console.log('------------------------------------------------------------------------------------------');
            referrals.forEach(ref => {
                console.log(`| ${ref.username.padEnd(15)} | ${(ref.firstName + ' ' + ref.lastName).padEnd(16)} | ${ref.email.padEnd(20)} | ${ref.rank.padEnd(10)} | ${ref.status.padEnd(8)} |`);
            });
            console.log('------------------------------------------------------------------------------------------');
        }

    } catch (error) {
        console.error('Error listing referrals:', error);
    } finally {
        process.exit();
    }
}

listReferrals();
