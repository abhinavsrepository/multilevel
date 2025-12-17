package com.realestate.mlm.service;

import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.InstallmentPayment;
import com.realestate.mlm.model.PropertyInvestment;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.InstallmentPaymentRepository;
import com.realestate.mlm.repository.PropertyInvestmentRepository;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing installment payments and reminders
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InstallmentService {

        private final InstallmentPaymentRepository installmentPaymentRepository;
        private final PropertyInvestmentRepository propertyInvestmentRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        /**
         * Send installment payment reminders to users with upcoming due dates
         */
        @Transactional
        public void sendInstallmentReminders() {
                sendRemindersForUpcomingInstallments(3);
        }

        /**
         * Send reminders for installments due in the next 'days' days.
         * 
         * @param days Number of days to look ahead
         * @return Number of reminders sent
         */
        @Transactional
        public int sendRemindersForUpcomingInstallments(int days) {
                log.info("Starting installment reminder job for next {} days", days);

                LocalDate today = LocalDate.now();
                LocalDate reminderDate = today.plusDays(days);

                // Find all pending installments due in the next 'days' days
                List<InstallmentPayment> upcomingInstallments = installmentPaymentRepository
                                .findByStatusAndDueDateBetween("PENDING", today, reminderDate);

                log.info("Found {} upcoming installment payments", upcomingInstallments.size());

                int count = 0;
                for (InstallmentPayment installment : upcomingInstallments) {
                        try {
                                sendInstallmentReminder(installment);
                                count++;
                        } catch (Exception e) {
                                log.error("Error sending reminder for installment {}: {}",
                                                installment.getId(), e.getMessage());
                        }
                }

                log.info("Installment reminder job completed. Sent {} reminders.", count);
                return count;
        }

        /**
         * Send installment reminder to user
         */
        private void sendInstallmentReminder(InstallmentPayment installment) {
                PropertyInvestment investment = installment.getInvestment();
                User user = investment.getUser();

                String message = String.format(
                                "Reminder: Your installment payment of ₹%s for property '%s' is due on %s. " +
                                                "Please make the payment to avoid penalties.",
                                installment.getInstallmentAmount(),
                                investment.getProperty().getTitle(),
                                installment.getDueDate());

                notificationService.sendNotification(
                                user.getId(),
                                "Installment Payment Reminder",
                                message,
                                "INSTALLMENT");

                log.info("Sent installment reminder to user {} for installment {}",
                                user.getUserId(), installment.getId());
        }

        /**
         * Mark overdue installments
         */
        @Transactional
        public int markOverdueInstallments() {
                log.info("Starting overdue installment marking job");

                LocalDate today = LocalDate.now();

                // Find all pending installments that are past due date
                List<InstallmentPayment> overdueInstallments = installmentPaymentRepository
                                .findByStatusAndDueDateBefore("PENDING", today);

                log.info("Found {} overdue installment payments", overdueInstallments.size());

                int count = 0;
                for (InstallmentPayment installment : overdueInstallments) {
                        try {
                                markInstallmentAsOverdue(installment);
                                count++;
                        } catch (Exception e) {
                                log.error("Error marking installment {} as overdue: {}",
                                                installment.getId(), e.getMessage());
                        }
                }

                log.info("Overdue installment marking job completed. Marked {} installments as overdue.", count);
                return count;
        }

        /**
         * Mark installment as overdue and apply penalty
         */
        private void markInstallmentAsOverdue(InstallmentPayment installment) {
                installment.setStatus("OVERDUE");

                // Calculate penalty (e.g., 2% of installment amount per month overdue)
                // This is a simplified calculation - adjust based on business rules
                long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(
                                installment.getDueDate(), LocalDate.now());

                if (daysOverdue > 0) {
                        // Example: 2% penalty per month, prorated daily
                        double penaltyRate = 0.02 / 30; // Daily penalty rate
                        double penaltyAmount = installment.getInstallmentAmount().doubleValue() * penaltyRate
                                        * daysOverdue;
                        installment.setPenaltyAmount(java.math.BigDecimal.valueOf(penaltyAmount));
                }

                installmentPaymentRepository.save(installment);

                // Send notification to user
                PropertyInvestment investment = installment.getInvestment();
                User user = investment.getUser();

                String message = String.format(
                                "Your installment payment of ₹%s for property '%s' is overdue. " +
                                                "A penalty of ₹%s has been applied. Please make the payment immediately.",
                                installment.getInstallmentAmount(),
                                investment.getProperty().getTitle(),
                                installment.getPenaltyAmount());

                notificationService.sendNotification(
                                user.getId(),
                                "Overdue Installment Payment",
                                message,
                                "INSTALLMENT");

                log.info("Marked installment {} as overdue with penalty ₹{}",
                                installment.getId(), installment.getPenaltyAmount());
        }

        /**
         * Get pending installments for a user
         */
        public List<InstallmentPayment> getPendingInstallmentsForUser(String userId) {
                log.info("Fetching pending installments for user: {}", userId);

                User user = userRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with userId: " + userId));

                List<PropertyInvestment> investments = propertyInvestmentRepository.findByUser(user);

                return installmentPaymentRepository.findByInvestmentInAndStatus(
                                investments, "PENDING");
        }

        /**
         * Get overdue installments for a user
         */
        public List<InstallmentPayment> getOverdueInstallmentsForUser(String userId) {
                log.info("Fetching overdue installments for user: {}", userId);

                User user = userRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found with userId: " + userId));

                List<PropertyInvestment> investments = propertyInvestmentRepository.findByUser(user);

                return installmentPaymentRepository.findByInvestmentInAndStatus(
                                investments, "OVERDUE");
        }

        /**
         * Get installment payment details
         */
        public InstallmentPayment getInstallmentById(Long installmentId) {
                log.info("Fetching installment with ID: {}", installmentId);

                return installmentPaymentRepository.findById(installmentId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Installment payment not found with ID: " + installmentId));
        }
}
