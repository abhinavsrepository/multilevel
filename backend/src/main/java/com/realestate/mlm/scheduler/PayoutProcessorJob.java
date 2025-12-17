package com.realestate.mlm.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.realestate.mlm.service.PayoutService;

/**
 * Scheduled job for processing weekly payouts.
 */
@Slf4j
@Component
public class PayoutProcessorJob {

    @Autowired
    private PayoutService payoutService;

    /**
     * Process weekly payouts - Process all approved payouts every Monday 10 AM.
     * Cron: "0 0 10 * * MON" = Every Monday at 10:00 AM
     */
    @Scheduled(cron = "0 0 10 * * MON")
    public void processWeeklyPayouts() {
        log.info("Starting weekly payout processing job");
        try {
            long startTime = System.currentTimeMillis();

            // Process all approved payouts
            int payoutsProcessed = payoutService.processApprovedPayouts();

            long duration = System.currentTimeMillis() - startTime;
            log.info("Weekly payout processing completed successfully. Processed: {}, Duration: {}ms",
                     payoutsProcessed, duration);
        } catch (Exception e) {
            log.error("Error occurred during weekly payout processing", e);
        }
    }
}
