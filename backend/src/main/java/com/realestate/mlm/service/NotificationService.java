package com.realestate.mlm.service;

import com.realestate.mlm.model.Notification;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.NotificationRepository;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Value("${spring.mail.username:noreply@mlm-realestate.com}")
    private String fromEmail;

    @Value("${app.name:MLM Real Estate}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    /**
     * Send OTP email
     */
    public void sendOtpEmail(String email, String otp) {
        log.info("Sending OTP email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Verify Your Email - OTP Code");

            String htmlContent = buildOtpEmailTemplate(otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", email);

            // Save notification
            saveNotification(email, "OTP_EMAIL", "OTP verification email sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", email, e);
            saveNotification(email, "OTP_EMAIL", "Failed to send OTP email", "FAILED");
        }
    }

    /**
     * Send welcome email after successful registration
     */
    public void sendWelcomeEmail(String email, String fullName) {
        log.info("Sending welcome email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Welcome to " + appName);

            String htmlContent = buildWelcomeEmailTemplate(fullName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", email);

            saveNotification(email, "WELCOME_EMAIL", "Welcome email sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", email, e);
            saveNotification(email, "WELCOME_EMAIL", "Failed to send welcome email", "FAILED");
        }
    }

    /**
     * Send password reset email
     */
    public void sendPasswordResetEmail(String email, String resetToken, String fullName) {
        log.info("Sending password reset email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Reset Your Password");

            String resetLink = appUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetEmailTemplate(fullName, resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", email);

            saveNotification(email, "PASSWORD_RESET_EMAIL", "Password reset email sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            saveNotification(email, "PASSWORD_RESET_EMAIL", "Failed to send password reset email", "FAILED");
        }
    }

    /**
     * Send password changed confirmation email
     */
    public void sendPasswordChangedEmail(String email, String fullName) {
        log.info("Sending password changed email to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Password Changed Successfully");

            String htmlContent = buildPasswordChangedEmailTemplate(fullName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Password changed email sent successfully to: {}", email);

            saveNotification(email, "PASSWORD_CHANGED_EMAIL", "Password changed email sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send password changed email to: {}", email, e);
            saveNotification(email, "PASSWORD_CHANGED_EMAIL", "Failed to send password changed email", "FAILED");
        }
    }

    /**
     * Send commission notification email
     */
    public void sendCommissionNotification(String email, String fullName, String commissionType, String amount) {
        log.info("Sending commission notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("New Commission Earned - " + commissionType);

            String htmlContent = buildCommissionEmailTemplate(fullName, commissionType, amount);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Commission notification sent successfully to: {}", email);

            saveNotification(email, "COMMISSION_EMAIL", "Commission notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send commission notification to: {}", email, e);
            saveNotification(email, "COMMISSION_EMAIL", "Failed to send commission notification", "FAILED");
        }
    }

    /**
     * Send investment confirmation email
     */
    public void sendInvestmentConfirmation(String email, String fullName, String propertyName, String amount) {
        log.info("Sending investment confirmation to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Investment Confirmation - " + propertyName);

            String htmlContent = buildInvestmentEmailTemplate(fullName, propertyName, amount);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Investment confirmation sent successfully to: {}", email);

            saveNotification(email, "INVESTMENT_EMAIL", "Investment confirmation sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send investment confirmation to: {}", email, e);
            saveNotification(email, "INVESTMENT_EMAIL", "Failed to send investment confirmation", "FAILED");
        }
    }

    /**
     * Send bank account added notification
     */
    public void sendBankAccountAddedNotification(String email, String fullName, String bankName, String accountNumber) {
        log.info("Sending bank account added notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Bank Account Added - " + bankName);

            String htmlContent = buildBankAccountAddedEmailTemplate(fullName, bankName, accountNumber);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Bank account added notification sent successfully to: {}", email);

            saveNotification(email, "BANK_ACCOUNT_ADDED", "Bank account added notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send bank account added notification to: {}", email, e);
            saveNotification(email, "BANK_ACCOUNT_ADDED", "Failed to send bank account added notification", "FAILED");
        }
    }

    /**
     * Send bank account verified notification
     */
    public void sendBankAccountVerifiedNotification(String email, String fullName, String bankName,
            String accountNumber) {
        log.info("Sending bank account verified notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Bank Account Verified - " + bankName);

            String htmlContent = buildBankAccountVerifiedEmailTemplate(fullName, bankName, accountNumber);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Bank account verified notification sent successfully to: {}", email);

            saveNotification(email, "BANK_ACCOUNT_VERIFIED", "Bank account verified notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send bank account verified notification to: {}", email, e);
            saveNotification(email, "BANK_ACCOUNT_VERIFIED", "Failed to send bank account verified notification",
                    "FAILED");
        }
    }

    /**
     * Send KYC submitted notification
     */
    public void sendKycSubmittedNotification(String email, String fullName) {
        log.info("Sending KYC submitted notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("KYC Documents Submitted");

            String htmlContent = buildKycSubmittedEmailTemplate(fullName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("KYC submitted notification sent successfully to: {}", email);

            saveNotification(email, "KYC_SUBMITTED", "KYC submitted notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send KYC submitted notification to: {}", email, e);
            saveNotification(email, "KYC_SUBMITTED", "Failed to send KYC submitted notification", "FAILED");
        }
    }

    /**
     * Send KYC approved notification
     */
    public void sendKycApprovedNotification(String email, String fullName, String documentType) {
        log.info("Sending KYC approved notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("KYC Document Approved");

            String htmlContent = buildKycApprovedEmailTemplate(fullName, documentType);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("KYC approved notification sent successfully to: {}", email);

            saveNotification(email, "KYC_APPROVED", "KYC approved notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send KYC approved notification to: {}", email, e);
            saveNotification(email, "KYC_APPROVED", "Failed to send KYC approved notification", "FAILED");
        }
    }

    /**
     * Send KYC rejected notification
     */
    public void sendKycRejectedNotification(String email, String fullName, String documentType, String reason) {
        log.info("Sending KYC rejected notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("KYC Document Rejected");

            String htmlContent = buildKycRejectedEmailTemplate(fullName, documentType, reason);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("KYC rejected notification sent successfully to: {}", email);

            saveNotification(email, "KYC_REJECTED", "KYC rejected notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send KYC rejected notification to: {}", email, e);
            saveNotification(email, "KYC_REJECTED", "Failed to send KYC rejected notification", "FAILED");
        }
    }

    /**
     * Send ticket created notification
     */
    public void sendTicketCreatedNotification(String email, String fullName, String ticketId, String subject) {
        log.info("Sending ticket created notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Support Ticket Created - " + ticketId);

            String htmlContent = buildTicketCreatedEmailTemplate(fullName, ticketId, subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Ticket created notification sent successfully to: {}", email);

            saveNotification(email, "TICKET_CREATED", "Ticket created notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send ticket created notification to: {}", email, e);
            saveNotification(email, "TICKET_CREATED", "Failed to send ticket created notification", "FAILED");
        }
    }

    /**
     * Send ticket reply notification
     */
    public void sendTicketReplyNotification(String email, String fullName, String ticketId, String subject) {
        log.info("Sending ticket reply notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("New Reply on Ticket - " + ticketId);

            String htmlContent = buildTicketReplyEmailTemplate(fullName, ticketId, subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Ticket reply notification sent successfully to: {}", email);

            saveNotification(email, "TICKET_REPLY", "Ticket reply notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send ticket reply notification to: {}", email, e);
            saveNotification(email, "TICKET_REPLY", "Failed to send ticket reply notification", "FAILED");
        }
    }

    /**
     * Send ticket user reply notification (to admin)
     */
    public void sendTicketUserReplyNotification(String email, String ticketId, String subject) {
        log.info("Sending ticket user reply notification to admin: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("User Replied to Ticket - " + ticketId);

            String htmlContent = buildTicketUserReplyEmailTemplate(ticketId, subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Ticket user reply notification sent successfully to: {}", email);

            saveNotification(email, "TICKET_USER_REPLY", "Ticket user reply notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send ticket user reply notification to: {}", email, e);
            saveNotification(email, "TICKET_USER_REPLY", "Failed to send ticket user reply notification", "FAILED");
        }
    }

    /**
     * Send ticket status update notification
     */
    public void sendTicketStatusUpdateNotification(String email, String fullName, String ticketId, String status) {
        log.info("Sending ticket status update notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Ticket Status Updated - " + ticketId);

            String htmlContent = buildTicketStatusUpdateEmailTemplate(fullName, ticketId, status);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Ticket status update notification sent successfully to: {}", email);

            saveNotification(email, "TICKET_STATUS_UPDATE", "Ticket status update notification sent", "SENT");
        } catch (Exception e) {
            log.error("Failed to send ticket status update notification to: {}", email, e);
            saveNotification(email, "TICKET_STATUS_UPDATE", "Failed to send ticket status update notification",
                    "FAILED");
        }
    }

    /**
     * Send generic notification
     */
    @Transactional
    public void sendNotification(Long userId, String title, String message, String type) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                Notification notification = new Notification();
                notification.setUser(userOpt.get());
                notification.setTitle(title);
                notification.setMessage(message);
                notification.setType(type);
                notification.setIsRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);
                log.info("Notification sent to user {}: {}", userId, title);
            } else {
                log.warn("User not found for notification: {}", userId);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to user: {}", userId, e);
        }
    }

    /**
     * Save notification to database
     */
    @Transactional
    private void saveNotification(String email, String type, String message, String status) {
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                Notification notification = new Notification();
                notification.setUser(userOpt.get());
                notification.setType(type);
                notification.setTitle(type.replace("_", " "));
                notification.setMessage(message);
                notification.setIsRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            log.error("Failed to save notification for email: {}", email, e);
        }
    }

    /**
     * Build OTP email template
     */
    private String buildOtpEmailTemplate(String otp) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 20px 0; border-radius: 8px; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>" + appName + "</h1></div>" +
                "<div class='content'>" +
                "<h2>Email Verification</h2>" +
                "<p>Thank you for registering with us. Please use the OTP below to verify your email address:</p>" +
                "<div class='otp-box'>" + otp + "</div>" +
                "<p><strong>This OTP is valid for 10 minutes.</strong></p>" +
                "<p>If you didn't request this, please ignore this email.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build welcome email template
     */
    private String buildWelcomeEmailTemplate(String fullName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Welcome to " + appName + "!</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Congratulations! Your account has been successfully verified and activated.</p>" +
                "<p>You can now start exploring investment opportunities and building your network.</p>" +
                "<a href='" + appUrl + "/dashboard' class='button'>Go to Dashboard</a>" +
                "<p>If you have any questions, feel free to contact our support team.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build password reset email template
     */
    private String buildPasswordResetEmailTemplate(String fullName, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Reset Your Password</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>We received a request to reset your password. Click the button below to reset it:</p>" +
                "<a href='" + resetLink + "' class='button'>Reset Password</a>" +
                "<p><strong>This link is valid for 1 hour.</strong></p>" +
                "<p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build password changed email template
     */
    private String buildPasswordChangedEmailTemplate(String fullName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Password Changed</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Your password has been successfully changed.</p>" +
                "<p>If you didn't make this change, please contact our support team immediately.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build commission email template
     */
    private String buildCommissionEmailTemplate(String fullName, String commissionType, String amount) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".amount-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; font-size: 28px; font-weight: bold; color: #667eea; margin: 20px 0; border-radius: 8px; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>New Commission Earned!</h1></div>" +
                "<div class='content'>" +
                "<h2>Congratulations " + fullName + "!</h2>" +
                "<p>You have earned a new <strong>" + commissionType + "</strong> commission:</p>" +
                "<div class='amount-box'>₹" + amount + "</div>" +
                "<p>This amount has been credited to your commission wallet.</p>" +
                "<p>Keep up the great work!</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build investment email template
     */
    private String buildInvestmentEmailTemplate(String fullName, String propertyName, String amount) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Investment Confirmation</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Thank you for your investment! Here are the details:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Property:</strong> " + propertyName + "</p>" +
                "<p><strong>Investment Amount:</strong> ₹" + amount + "</p>" +
                "<p><strong>Status:</strong> Confirmed</p>" +
                "</div>" +
                "<p>Your investment is now active and you will start receiving returns as per the plan.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build bank account added email template
     */
    private String buildBankAccountAddedEmailTemplate(String fullName, String bankName, String accountNumber) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Bank Account Added</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>A new bank account has been added to your profile:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Bank Name:</strong> " + bankName + "</p>" +
                "<p><strong>Account Number:</strong> " + accountNumber + "</p>" +
                "<p><strong>Status:</strong> Pending Verification</p>" +
                "</div>" +
                "<p>We will verify this account shortly. You will be notified once the verification is complete.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build bank account verified email template
     */
    private String buildBankAccountVerifiedEmailTemplate(String fullName, String bankName, String accountNumber) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Bank Account Verified</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Your bank account has been successfully verified:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Bank Name:</strong> " + bankName + "</p>" +
                "<p><strong>Account Number:</strong> " + accountNumber + "</p>" +
                "<p><strong>Status:</strong> Verified <span style='color: #28a745;'>&#10004;</span></p>" +
                "</div>" +
                "<p>You can now use this account for withdrawals and deposits.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build KYC submitted email template
     */
    private String buildKycSubmittedEmailTemplate(String fullName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>KYC Documents Submitted</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Your KYC documents have been successfully submitted.</p>" +
                "<p>Our team will review your documents shortly. You will receive another notification once the review is complete.</p>"
                +
                "<p>This usually takes 24-48 hours.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build KYC approved email template
     */
    private String buildKycApprovedEmailTemplate(String fullName, String documentType) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>KYC Document Approved</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Great news! Your KYC document has been approved:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Document Type:</strong> " + documentType + "</p>" +
                "<p><strong>Status:</strong> Approved <span style='color: #28a745;'>&#10004;</span></p>" +
                "</div>" +
                "<p>Your account status has been updated accordingly.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build KYC rejected email template
     */
    private String buildKycRejectedEmailTemplate(String fullName, String documentType, String reason) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>KYC Document Rejected</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Unfortunately, your KYC document has been rejected:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Document Type:</strong> " + documentType + "</p>" +
                "<p><strong>Reason:</strong> " + reason + "</p>" +
                "<p><strong>Status:</strong> Rejected <span style='color: #dc3545;'>&#10006;</span></p>" +
                "</div>" +
                "<p>Please upload a valid document addressing the rejection reason.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build Ticket Created email template
     */
    private String buildTicketCreatedEmailTemplate(String fullName, String ticketId, String subject) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Support Ticket Created</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Your support ticket has been successfully created:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Ticket ID:</strong> " + ticketId + "</p>" +
                "<p><strong>Subject:</strong> " + subject + "</p>" +
                "<p><strong>Status:</strong> OPEN</p>" +
                "</div>" +
                "<p>Our support team will review your request and get back to you shortly.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build Ticket Reply email template
     */
    private String buildTicketReplyEmailTemplate(String fullName, String ticketId, String subject) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>New Reply on Ticket</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>You have received a new reply on your support ticket:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Ticket ID:</strong> " + ticketId + "</p>" +
                "<p><strong>Subject:</strong> " + subject + "</p>" +
                "</div>" +
                "<p>Please login to your dashboard to view the reply.</p>" +
                "<a href='" + appUrl + "/support/tickets/" + ticketId + "' class='button'>View Ticket</a>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build Ticket User Reply email template
     */
    private String buildTicketUserReplyEmailTemplate(String ticketId, String subject) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>User Replied to Ticket</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello Admin,</h2>" +
                "<p>A user has replied to a support ticket:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Ticket ID:</strong> " + ticketId + "</p>" +
                "<p><strong>Subject:</strong> " + subject + "</p>" +
                "</div>" +
                "<a href='" + appUrl + "/admin/support/tickets/" + ticketId + "' class='button'>View Ticket</a>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build Ticket Status Update email template
     */
    private String buildTicketStatusUpdateEmailTemplate(String fullName, String ticketId, String status) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Ticket Status Updated</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>The status of your support ticket has been updated:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Ticket ID:</strong> " + ticketId + "</p>" +
                "<p><strong>New Status:</strong> " + status + "</p>" +
                "</div>" +
                "<p>If you have any questions, please feel free to reply to this email.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Send payout request notification
     */
    public void sendPayoutRequestNotification(String email, String fullName, BigDecimal amount, BigDecimal netAmount) {
        log.info("Sending payout request notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Withdrawal Request Received");

            String htmlContent = buildPayoutRequestEmailTemplate(fullName, amount, netAmount);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Payout request notification sent successfully to: {}", email);

            saveNotification(email, "PAYOUT_REQUESTED", "Withdrawal request received", "SENT");
        } catch (Exception e) {
            log.error("Failed to send payout request notification to: {}", email, e);
            saveNotification(email, "PAYOUT_REQUESTED", "Failed to send payout request notification", "FAILED");
        }
    }

    /**
     * Send payout approved notification
     */
    public void sendPayoutApprovedNotification(String email, String fullName, BigDecimal netAmount) {
        log.info("Sending payout approved notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Withdrawal Request Approved");

            String htmlContent = buildPayoutApprovedEmailTemplate(fullName, netAmount);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Payout approved notification sent successfully to: {}", email);

            saveNotification(email, "PAYOUT_APPROVED", "Withdrawal request approved", "SENT");
        } catch (Exception e) {
            log.error("Failed to send payout approved notification to: {}", email, e);
            saveNotification(email, "PAYOUT_APPROVED", "Failed to send payout approved notification", "FAILED");
        }
    }

    /**
     * Send payout rejected notification
     */
    public void sendPayoutRejectedNotification(String email, String fullName, BigDecimal requestedAmount,
            String reason) {
        log.info("Sending payout rejected notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Withdrawal Request Rejected");

            String htmlContent = buildPayoutRejectedEmailTemplate(fullName, requestedAmount, reason);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Payout rejected notification sent successfully to: {}", email);

            saveNotification(email, "PAYOUT_REJECTED", "Withdrawal request rejected", "SENT");
        } catch (Exception e) {
            log.error("Failed to send payout rejected notification to: {}", email, e);
            saveNotification(email, "PAYOUT_REJECTED", "Failed to send payout rejected notification", "FAILED");
        }
    }

    /**
     * Send payout completed notification
     */
    public void sendPayoutCompletedNotification(String email, String fullName, BigDecimal netAmount, String utrNumber) {
        log.info("Sending payout completed notification to: {}", email);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Withdrawal Processed Successfully");

            String htmlContent = buildPayoutCompletedEmailTemplate(fullName, netAmount, utrNumber);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Payout completed notification sent successfully to: {}", email);

            saveNotification(email, "PAYOUT_COMPLETED", "Withdrawal processed successfully", "SENT");
        } catch (Exception e) {
            log.error("Failed to send payout completed notification to: {}", email, e);
            saveNotification(email, "PAYOUT_COMPLETED", "Failed to send payout completed notification", "FAILED");
        }
    }

    /**
     * Build payout request email template
     */
    private String buildPayoutRequestEmailTemplate(String fullName, BigDecimal amount, BigDecimal netAmount) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Withdrawal Request Received</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>We have received your withdrawal request. Here are the details:</p>" +
                "<div class='info-box'>" +
                "<p><strong>Requested Amount:</strong> ₹" + amount + "</p>" +
                "<p><strong>Net Amount (after TDS & Charges):</strong> ₹" + netAmount + "</p>" +
                "<p><strong>Status:</strong> Pending Approval</p>" +
                "</div>" +
                "<p>Our team will review your request shortly. You will be notified once it is approved.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build payout approved email template
     */
    private String buildPayoutApprovedEmailTemplate(String fullName, BigDecimal netAmount) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Withdrawal Approved</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Your withdrawal request has been approved!</p>" +
                "<div class='info-box'>" +
                "<p><strong>Net Amount:</strong> ₹" + netAmount + "</p>" +
                "<p><strong>Status:</strong> Approved <span style='color: #28a745;'>&#10004;</span></p>" +
                "</div>" +
                "<p>The amount will be credited to your bank account shortly.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build payout rejected email template
     */
    private String buildPayoutRejectedEmailTemplate(String fullName, BigDecimal requestedAmount, String reason) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Withdrawal Request Rejected</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Unfortunately, your withdrawal request has been rejected.</p>" +
                "<div class='info-box'>" +
                "<p><strong>Requested Amount:</strong> ₹" + requestedAmount + "</p>" +
                "<p><strong>Reason:</strong> " + reason + "</p>" +
                "<p><strong>Status:</strong> Rejected <span style='color: #dc3545;'>&#10006;</span></p>" +
                "</div>" +
                "<p>The amount has been refunded to your wallet.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build payout completed email template
     */
    private String buildPayoutCompletedEmailTemplate(String fullName, BigDecimal netAmount, String utrNumber) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }"
                +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; }"
                +
                ".footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>Withdrawal Processed</h1></div>" +
                "<div class='content'>" +
                "<h2>Hello " + fullName + ",</h2>" +
                "<p>Your withdrawal has been successfully processed!</p>" +
                "<div class='info-box'>" +
                "<p><strong>Net Amount:</strong> ₹" + netAmount + "</p>" +
                "<p><strong>UTR Number:</strong> " + utrNumber + "</p>" +
                "<p><strong>Status:</strong> Completed <span style='color: #28a745;'>&#10004;</span></p>" +
                "</div>" +
                "<p>Please check your bank account for the credit.</p>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }
}
