const { Announcement, sequelize } = require('./src/models');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const announcements = [
            {
                title: 'Welcome to MLM Platform',
                description: 'We are excited to have you on board! Check out our new features.',
                type: 'INFO',
                priority: 'HIGH',
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                link: '/profile'
            },
            {
                title: 'Maintenance Scheduled',
                description: 'System maintenance is scheduled for this Sunday at 2 AM UTC.',
                type: 'WARNING',
                priority: 'MEDIUM',
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7))
            },
            {
                title: 'New Bonus Structure',
                description: 'We have updated our bonus structure. Read more to maximize your earnings.',
                type: 'SUCCESS',
                priority: 'HIGH',
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
                link: '/reports'
            }
        ];

        for (const data of announcements) {
            await Announcement.create(data);
        }

        console.log('Announcements seeded successfully.');
    } catch (error) {
        console.error('Error seeding announcements:', error);
    } finally {
        await sequelize.close();
    }
}

seed();
