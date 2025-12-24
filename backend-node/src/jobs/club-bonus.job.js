const cron = require('node-cron');
const clubBonusService = require('../services/club-bonus.service');

/**
 * Monthly job to distribute club bonuses
 * Runs on the 1st of every month at 4:00 AM IST
 * Distributes bonuses for the previous month
 */
const distributeClubBonusesJob = cron.schedule('0 4 1 * *', async () => {
    const currentDate = new Date();

    // Calculate previous month
    const previousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    );

    console.log(`\n[CRON] ========================================`);
    console.log(`[CRON] Starting Club Bonus Distribution`);
    console.log(`[CRON] Target Month: ${previousMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`);
    console.log(`[CRON] Execution Time: ${currentDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    console.log(`[CRON] ========================================\n`);

    try {
        const result = await clubBonusService.distributeClubBonuses(previousMonth);

        if (result.success) {
            const totalQualified = result.results.filter(r => r.qualified).length;
            const totalAmount = result.results
                .filter(r => r.qualified)
                .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

            console.log(`\n[CRON] ========================================`);
            console.log(`[CRON] Club Bonus Distribution Completed`);
            console.log(`[CRON] Total Qualified Users: ${totalQualified}`);
            console.log(`[CRON] Total Amount Distributed: ₹${totalAmount.toFixed(2)}`);
            console.log(`[CRON] ========================================\n`);
        } else {
            console.error(`[CRON] Club bonus distribution failed:`, result.message);
        }
    } catch (error) {
        console.error('[CRON] Error in club bonus distribution job:', error);
        console.error('[CRON] Stack trace:', error.stack);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
});

/**
 * Start the club bonus cron job
 */
function startClubBonusJob() {
    console.log('[CRON] Starting club bonus job...');
    distributeClubBonusesJob.start();
    console.log('[CRON] ✓ Monthly club bonus distribution job started (runs on 1st of month at 4:00 AM IST)');
}

/**
 * Stop the club bonus cron job
 */
function stopClubBonusJob() {
    distributeClubBonusesJob.stop();
    console.log('[CRON] Club bonus job stopped');
}

/**
 * Manually trigger club bonus distribution (for testing or manual runs)
 * @param {Date} qualificationMonth - Optional month for distribution (defaults to previous month)
 */
async function triggerClubBonusManually(qualificationMonth = null) {
    console.log('[MANUAL] Manually triggering club bonus distribution...');

    try {
        const result = await clubBonusService.distributeClubBonuses(qualificationMonth);
        console.log('[MANUAL] Distribution completed successfully');
        return result;
    } catch (error) {
        console.error('[MANUAL] Error in manual club bonus distribution:', error);
        throw error;
    }
}

module.exports = {
    startClubBonusJob,
    stopClubBonusJob,
    triggerClubBonusManually,
    distributeClubBonusesJob
};
