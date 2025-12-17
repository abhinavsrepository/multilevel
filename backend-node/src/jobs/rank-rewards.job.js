const cron = require('node-cron');
const { sequelize } = require('../models');
const rankAchievementService = require('../services/rank-achievement.service');

/**
 * Daily job to check all users for rank upgrades
 * Runs every day at 2:00 AM
 */
const checkRankUpgradesJob = cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Starting daily rank upgrade check...');

    try {
        const result = await rankAchievementService.checkAllUsersForRankUpgrade();

        if (result.success) {
            console.log(`[CRON] Rank upgrade check completed: ${result.usersChecked} users checked, ${result.ranksAwarded} ranks awarded`);
        } else {
            console.error('[CRON] Rank upgrade check failed:', result.error);
        }
    } catch (error) {
        console.error('[CRON] Error in rank upgrade check job:', error);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
});

/**
 * Daily job to process pending one-time bonuses
 * Runs every day at 3:00 AM
 */
const processBonusesJob = cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Starting pending bonuses processing...');

    try {
        const result = await rankAchievementService.processPendingBonuses();

        if (result.success) {
            console.log(`[CRON] Bonuses processed: ${result.processedCount} bonuses, total amount: ₹${result.totalAmount}`);
        } else {
            console.error('[CRON] Bonus processing failed:', result.error);
        }
    } catch (error) {
        console.error('[CRON] Error in bonus processing job:', error);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
});

/**
 * Monthly job to generate monthly leadership rewards
 * Runs on the 1st of every month at 1:00 AM
 */
const generateMonthlyRewardsJob = cron.schedule('0 1 1 * *', async () => {
    const currentDate = new Date();
    const previousMonth = currentDate.getMonth(); // 0-11, so this is the previous month
    const year = previousMonth === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    const month = previousMonth === 0 ? 12 : previousMonth;

    console.log(`[CRON] Starting monthly reward generation for ${month}/${year}...`);

    try {
        const result = await sequelize.query(`
            SELECT
                ur.user_id,
                ur.rank_id,
                rs.rank_name,
                rs.monthly_leadership_bonus
            FROM user_ranks ur
            INNER JOIN rank_settings rs ON ur.rank_id = rs.id
            WHERE ur.is_current = TRUE
              AND rs.monthly_leadership_bonus > 0
              AND rs.is_active = TRUE
              AND NOT EXISTS (
                  SELECT 1 FROM rank_rewards rr
                  WHERE rr.user_id = ur.user_id
                    AND rr.rank_id = ur.rank_id
                    AND rr.period_month = :month
                    AND rr.period_year = :year
                    AND rr.reward_type = 'MONTHLY_LEADERSHIP'
              )
        `, {
            replacements: { month, year },
            type: sequelize.QueryTypes.SELECT
        });

        const { RankReward } = require('../models');

        const rewardsToCreate = result.map(user => ({
            userId: user.user_id,
            rankId: user.rank_id,
            rewardType: 'MONTHLY_LEADERSHIP',
            rewardAmount: user.monthly_leadership_bonus,
            periodMonth: month,
            periodYear: year,
            status: 'PENDING',
            notes: `Monthly leadership bonus for ${user.rank_name} - ${month}/${year}`
        }));

        if (rewardsToCreate.length > 0) {
            await RankReward.bulkCreate(rewardsToCreate);
            console.log(`[CRON] Generated ${rewardsToCreate.length} monthly rewards for ${month}/${year}`);
        } else {
            console.log(`[CRON] No monthly rewards to generate for ${month}/${year}`);
        }
    } catch (error) {
        console.error('[CRON] Error in monthly reward generation job:', error);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Kolkata'
});

/**
 * Start all rank reward cron jobs
 */
function startRankRewardJobs() {
    console.log('[CRON] Starting rank reward jobs...');

    checkRankUpgradesJob.start();
    console.log('[CRON] ✓ Daily rank upgrade check job started (runs at 2:00 AM IST)');

    processBonusesJob.start();
    console.log('[CRON] ✓ Daily bonus processing job started (runs at 3:00 AM IST)');

    generateMonthlyRewardsJob.start();
    console.log('[CRON] ✓ Monthly reward generation job started (runs on 1st of month at 1:00 AM IST)');
}

/**
 * Stop all rank reward cron jobs
 */
function stopRankRewardJobs() {
    checkRankUpgradesJob.stop();
    processBonusesJob.stop();
    generateMonthlyRewardsJob.stop();
    console.log('[CRON] All rank reward jobs stopped');
}

module.exports = {
    startRankRewardJobs,
    stopRankRewardJobs,
    checkRankUpgradesJob,
    processBonusesJob,
    generateMonthlyRewardsJob
};
