package com.realestate.mlm.service;

import com.realestate.mlm.dto.request.BankAccountRequest;
import com.realestate.mlm.dto.response.BankAccountResponse;
import com.realestate.mlm.exception.BadRequestException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.BankAccount;
import com.realestate.mlm.model.User;
import com.realestate.mlm.repository.BankAccountRepository;
import com.realestate.mlm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final Pattern IFSC_PATTERN = Pattern.compile("^[A-Z]{4}0[A-Z0-9]{6}$");

    /**
     * Add bank account
     */
    @Transactional
    public BankAccountResponse addBankAccount(BankAccountRequest request, String userId) {
        log.info("Adding bank account for user: {}", userId);

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Validate IFSC code
        if (!validateIfscCode(request.getIfscCode())) {
            throw new BadRequestException("Invalid IFSC code format");
        }

        // Check if account number already exists
        if (bankAccountRepository.findByAccountNumber(request.getAccountNumber()).isPresent()) {
            throw new BadRequestException("Account number already registered");
        }

        // Get existing accounts
        List<BankAccount> existingAccounts = bankAccountRepository.findByUser(user);

        // Create new bank account
        BankAccount bankAccount = new BankAccount();
        bankAccount.setUser(user);
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setIfscCode(request.getIfscCode().toUpperCase());
        bankAccount.setAccountHolderName(request.getAccountHolderName());
        bankAccount.setBranchName(request.getBranchName());
        bankAccount.setAccountType(request.getAccountType());
        bankAccount.setUpiId(request.getUpiId());
        bankAccount.setIsVerified(false);
        bankAccount.setVerificationMethod(null);

        // Set as primary if it's the first account
        bankAccount.setIsPrimary(existingAccounts.isEmpty());

        BankAccount savedAccount = bankAccountRepository.save(bankAccount);

        log.info("Bank account added successfully for user: {}", userId);

        // Send notification
        notificationService.sendBankAccountAddedNotification(
                user.getEmail(),
                user.getFullName(),
                request.getBankName(),
                request.getAccountNumber()
        );

        return mapToResponse(savedAccount);
    }

    /**
     * Update bank account
     */
    @Transactional
    public BankAccountResponse updateBankAccount(Long id, BankAccountRequest request, String userId) {
        log.info("Updating bank account ID: {} for user: {}", id, userId);

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Find bank account
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account not found with ID: " + id));

        // Validate ownership
        if (!bankAccount.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This bank account does not belong to you");
        }

        // Don't allow updating verified accounts
        if (bankAccount.getIsVerified()) {
            throw new BadRequestException("Cannot update verified bank account. Please add a new one.");
        }

        // Validate IFSC code
        if (!validateIfscCode(request.getIfscCode())) {
            throw new BadRequestException("Invalid IFSC code format");
        }

        // Update details
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setIfscCode(request.getIfscCode().toUpperCase());
        bankAccount.setAccountHolderName(request.getAccountHolderName());
        bankAccount.setBranchName(request.getBranchName());
        bankAccount.setAccountType(request.getAccountType());
        bankAccount.setUpiId(request.getUpiId());

        BankAccount updatedAccount = bankAccountRepository.save(bankAccount);

        log.info("Bank account updated successfully: {}", id);

        return mapToResponse(updatedAccount);
    }

    /**
     * Delete bank account
     */
    @Transactional
    public void deleteBankAccount(Long id, String userId) {
        log.info("Deleting bank account ID: {} for user: {}", id, userId);

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Find bank account
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account not found with ID: " + id));

        // Validate ownership
        if (!bankAccount.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This bank account does not belong to you");
        }

        // Don't allow deleting primary account if other accounts exist
        List<BankAccount> userAccounts = bankAccountRepository.findByUser(user);
        if (bankAccount.getIsPrimary() && userAccounts.size() > 1) {
            throw new BadRequestException("Cannot delete primary bank account. Please set another account as primary first.");
        }

        bankAccountRepository.delete(bankAccount);

        log.info("Bank account deleted successfully: {}", id);
    }

    /**
     * Get all bank accounts for user
     */
    public List<BankAccountResponse> getBankAccounts(String userId) {
        log.info("Fetching bank accounts for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        List<BankAccount> accounts = bankAccountRepository.findByUser(user);

        return accounts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Set primary bank account
     */
    @Transactional
    public BankAccountResponse setPrimaryAccount(Long id, String userId) {
        log.info("Setting bank account ID: {} as primary for user: {}", id, userId);

        // Find user
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Find bank account
        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account not found with ID: " + id));

        // Validate ownership
        if (!bankAccount.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This bank account does not belong to you");
        }

        // Unset all other primary accounts
        List<BankAccount> allAccounts = bankAccountRepository.findByUser(user);
        for (BankAccount account : allAccounts) {
            account.setIsPrimary(false);
            bankAccountRepository.save(account);
        }

        // Set this account as primary
        bankAccount.setIsPrimary(true);
        BankAccount updatedAccount = bankAccountRepository.save(bankAccount);

        log.info("Bank account set as primary: {}", id);

        return mapToResponse(updatedAccount);
    }

    /**
     * Verify bank account (Penny drop verification - mock)
     */
    @Transactional
    public BankAccountResponse verifyBankAccount(Long id) {
        log.info("Verifying bank account ID: {}", id);

        BankAccount bankAccount = bankAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account not found with ID: " + id));

        // Check if already verified
        if (bankAccount.getIsVerified()) {
            throw new BadRequestException("Bank account is already verified");
        }

        // TODO: Integrate with penny drop verification API (Razorpay, Cashfree, etc.)
        // For now, we'll simulate verification

        // Simulate API call
        boolean verificationSuccess = true; // Mock success

        if (verificationSuccess) {
            bankAccount.setIsVerified(true);
            bankAccount.setVerificationMethod("INSTANT");
            bankAccount.setVerifiedAt(LocalDateTime.now());

            BankAccount verifiedAccount = bankAccountRepository.save(bankAccount);

            // Send notification
            notificationService.sendBankAccountVerifiedNotification(
                    bankAccount.getUser().getEmail(),
                    bankAccount.getUser().getFullName(),
                    bankAccount.getBankName(),
                    bankAccount.getAccountNumber()
            );

            log.info("Bank account verified successfully: {}", id);

            return mapToResponse(verifiedAccount);
        } else {
            throw new BadRequestException("Bank account verification failed. Please check account details.");
        }
    }

    /**
     * Validate IFSC code format
     */
    public boolean validateIfscCode(String ifsc) {
        if (ifsc == null || ifsc.isEmpty()) {
            return false;
        }

        // IFSC code format: ABCD0123456
        // 4 alpha + 0 + 6 alphanumeric
        return IFSC_PATTERN.matcher(ifsc.toUpperCase()).matches();
    }

    /**
     * Map BankAccount to BankAccountResponse
     */
    private BankAccountResponse mapToResponse(BankAccount account) {
        return BankAccountResponse.builder()
                .id(account.getId())
                .bankName(account.getBankName())
                .accountNumber(maskAccountNumber(account.getAccountNumber()))
                .ifscCode(account.getIfscCode())
                .accountHolderName(account.getAccountHolderName())
                .branchName(account.getBranchName())
                .accountType(account.getAccountType())
                .upiId(account.getUpiId())
                .isVerified(account.getIsVerified())
                .isPrimary(account.getIsPrimary())
                .verificationMethod(account.getVerificationMethod())
                .verifiedAt(account.getVerifiedAt())
                .createdAt(account.getCreatedAt())
                .build();
    }

    /**
     * Mask account number for security
     */
    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4) {
            return accountNumber;
        }

        String lastFour = accountNumber.substring(accountNumber.length() - 4);
        String masked = "X".repeat(accountNumber.length() - 4);

        return masked + lastFour;
    }
}
