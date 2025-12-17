package com.realestate.mlm.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.realestate.mlm.service.CommissionService;

/**
 * Scheduled job for calculating commissions and processing rank promotions.
 */
@Slf4j
@Component
public class CommissionCalculatorJob {

    @Autowired
    private CommissionService commissionService;

    /**
     * Calculate daily commissions - Process all pending binary matching at 2 AM daily.
     * Cron: "0 0 2 * * *" = Every day at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void calculateDailyCommissions() {
        log.info("Starting daily commission calculation job");
        try {
            long startTime = System.currentTimeMillis();

            // Process all pending binary matching
            int commissionsProcessed = commissionService.processAllPendingMatching();

            long duration = System.currentTimeMillis() - startTime;
            log.info("Daily commission calculation completed successfully. Processed: {}, Duration: {}ms",
                     commissionsProcessed, duration);
        } catch (Exception e) {
            log.error("Error occurred during daily commission calculation", e);
        }
    }

    /**
     * Process rank promotions - Check rank eligibility and promote users at 3 AM.
     * Cron: "0 0 3 * * *" = Every day at 3:00 AM
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void processRankPromotions() {
        log.info("Starting rank promotion processing job");
        try {
            long startTime = System.currentTimeMillis();

            // Check rank eligibility and promote users
            int usersPromoted = commissionService.processRankPromotions();

            long duration = System.currentTimeMillis() - startTime;
            log.info("Rank promotion processing completed successfully. Users promoted: {}, Duration: {}ms",
                     usersPromoted, duration);
        } catch (Exception e) {
            log.error("Error occurred during rank promotion processing", e);
        }
    }
}
