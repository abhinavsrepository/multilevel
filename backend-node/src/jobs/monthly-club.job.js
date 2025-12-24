const cron = require('node-cron');
const clubService = require('../services/club.service');
const logger = require('../config/logger');

const initMonthlyClubJob = () => {
    // Schedule: 0 0 1 * * (At 00:00 on day-of-month 1)
    cron.schedule('0 0 1 * *', async () => {
        logger.info('Running Monthly Club Incentive Distribution Job...');
        try {
            await clubService.runMonthlyClubDistribution();
            logger.info('Monthly Club Distribution Completed Successfully.');
        } catch (error) {
            logger.error('Monthly Club Distribution Failed:', error);
        }
    });

    logger.info('Monthly Club Incentive Job Scheduled (0 0 1 * *)');
};

module.exports = initMonthlyClubJob;
