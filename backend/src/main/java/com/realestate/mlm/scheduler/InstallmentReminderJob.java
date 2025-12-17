package com.realestate.mlm.scheduler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.realestate.mlm.service.InstallmentService;

/**
 * Scheduled job for managing installment reminders and marking overdue installments.
 */
@Slf4j
@Component
public class InstallmentReminderJob {

    @Autowired
    private InstallmentService installmentService;

    /**
     * Send installment reminders - Send reminders for installments due in next 3 days at 9 AM.
     * Cron: "0 0 9 * * *" = Every day at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendInstallmentReminders() {
        log.info("Starting installment reminder sending job");
        try {
            long startTime = System.currentTimeMillis();

            // Send reminders for installments due in next 3 days
            int remindersSent = installmentService.sendRemindersForUpcomingInstallments(3);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Installment reminder sending completed successfully. Reminders sent: {}, Duration: {}ms",
                     remindersSent, duration);
        } catch (Exception e) {
            log.error("Error occurred while sending installment reminders", e);
        }
    }

    /**
     * Mark overdue installments - Mark overdue installments at 12 PM.
     * Cron: "0 0 12 * * *" = Every day at 12:00 PM (noon)
     */
    @Scheduled(cron = "0 0 12 * * *")
    public void markOverdueInstallments() {
        log.info("Starting overdue installment marking job");
        try {
            long startTime = System.currentTimeMillis();

            // Mark overdue installments
            int overdueInstallments = installmentService.markOverdueInstallments();

            long duration = System.currentTimeMillis() - startTime;
            log.info("Overdue installment marking completed successfully. Marked as overdue: {}, Duration: {}ms",
                     overdueInstallments, duration);
        } catch (Exception e) {
            log.error("Error occurred while marking overdue installments", e);
        }
    }
}
