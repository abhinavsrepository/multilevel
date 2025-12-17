package com.realestate.mlm.service;

import com.realestate.mlm.dto.response.PageResponse;
import com.realestate.mlm.dto.response.TransactionResponse;
import com.realestate.mlm.dto.response.WalletResponse;
import com.realestate.mlm.dto.response.WalletSummaryResponse;
import com.realestate.mlm.exception.InsufficientBalanceException;
import com.realestate.mlm.exception.ResourceNotFoundException;
import com.realestate.mlm.model.Transaction;
import com.realestate.mlm.model.User;
import com.realestate.mlm.model.Wallet;
import com.realestate.mlm.repository.TransactionRepository;
import com.realestate.mlm.repository.UserRepository;
import com.realestate.mlm.repository.WalletRepository;
import com.realestate.mlm.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Create wallet for new user
     */
    @Transactional
    public Wallet createWallet(User user) {
        log.info("Creating wallet for user: {}", user.getUserId());

        // Check if wallet already exists
        if (walletRepository.findByUser(user).isPresent()) {
            log.warn("Wallet already exists for user: {}", user.getUserId());
            return walletRepository.findByUser(user).get();
        }

        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setInvestmentBalance(BigDecimal.ZERO);
        wallet.setCommissionBalance(BigDecimal.ZERO);
        wallet.setRentalIncomeBalance(BigDecimal.ZERO);
        wallet.setRoiBalance(BigDecimal.ZERO);
        wallet.setTotalEarned(BigDecimal.ZERO);
        wallet.setTotalWithdrawn(BigDecimal.ZERO);
        wallet.setTotalInvested(BigDecimal.ZERO);
        wallet.setLockedBalance(BigDecimal.ZERO);

        Wallet savedWallet = walletRepository.save(wallet);
        log.info("Wallet created successfully for user: {}", user.getUserId());

        return savedWallet;
    }

    /**
     * Get wallet balance for user
     */
    public WalletResponse getWalletBalance(String userId) {
        log.info("Fetching wallet balance for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        return mapToWalletResponse(wallet);
    }

    /**
     * Get wallet balance for current authenticated user
     */
    public WalletResponse getWalletBalance() {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching wallet balance for current user: {}", currentUserMlmId);
        return getWalletBalance(currentUserMlmId);
    }

    /**
     * Credit wallet - add money to specific wallet type
     * Uses pessimistic locking to prevent race conditions
     */
    @Transactional
    public Transaction creditWallet(User user, BigDecimal amount, String walletType, String description) {
        log.info("Crediting wallet for user: {}, amount: {}, type: {}", user.getUserId(), amount, walletType);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credit amount must be greater than zero");
        }

        // Use pessimistic write lock to ensure thread-safety during concurrent updates
        Wallet wallet = walletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getUserId()));

        BigDecimal balanceBefore = getWalletTypeBalance(wallet, walletType);

        // Update specific wallet balance
        switch (walletType.toUpperCase()) {
            case "INVESTMENT":
                wallet.setInvestmentBalance(wallet.getInvestmentBalance().add(amount));
                wallet.setTotalInvested(wallet.getTotalInvested().add(amount));
                break;
            case "COMMISSION":
                wallet.setCommissionBalance(wallet.getCommissionBalance().add(amount));
                wallet.setTotalEarned(wallet.getTotalEarned().add(amount));
                break;
            case "RENTAL_INCOME":
            case "RENTAL":
                wallet.setRentalIncomeBalance(wallet.getRentalIncomeBalance().add(amount));
                wallet.setTotalEarned(wallet.getTotalEarned().add(amount));
                break;
            case "ROI":
                wallet.setRoiBalance(wallet.getRoiBalance().add(amount));
                wallet.setTotalEarned(wallet.getTotalEarned().add(amount));
                break;
            default:
                throw new IllegalArgumentException("Invalid wallet type: " + walletType);
        }

        walletRepository.save(wallet);

        BigDecimal balanceAfter = getWalletTypeBalance(wallet, walletType);

        // Create transaction record
        Transaction transaction = createTransaction(
                user,
                "CREDIT",
                walletType,
                amount,
                balanceBefore,
                balanceAfter,
                description
        );

        log.info("Wallet credited successfully for user: {}", user.getUserId());

        return transaction;
    }

    /**
     * Debit wallet - deduct money from specific wallet type
     * Uses pessimistic locking to prevent race conditions
     */
    @Transactional
    public Transaction debitWallet(User user, BigDecimal amount, String walletType, String description) {
        log.info("Debiting wallet for user: {}, amount: {}, type: {}", user.getUserId(), amount, walletType);

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Debit amount must be greater than zero");
        }

        // Use pessimistic write lock to ensure thread-safety during concurrent updates
        Wallet wallet = walletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getUserId()));

        // Validate sufficient balance
        validateSufficientBalance(user, amount, walletType);

        BigDecimal balanceBefore = getWalletTypeBalance(wallet, walletType);

        // Update specific wallet balance
        switch (walletType.toUpperCase()) {
            case "INVESTMENT":
                wallet.setInvestmentBalance(wallet.getInvestmentBalance().subtract(amount));
                break;
            case "COMMISSION":
                wallet.setCommissionBalance(wallet.getCommissionBalance().subtract(amount));
                wallet.setTotalWithdrawn(wallet.getTotalWithdrawn().add(amount));
                break;
            case "RENTAL_INCOME":
            case "RENTAL":
                wallet.setRentalIncomeBalance(wallet.getRentalIncomeBalance().subtract(amount));
                wallet.setTotalWithdrawn(wallet.getTotalWithdrawn().add(amount));
                break;
            case "ROI":
                wallet.setRoiBalance(wallet.getRoiBalance().subtract(amount));
                wallet.setTotalWithdrawn(wallet.getTotalWithdrawn().add(amount));
                break;
            default:
                throw new IllegalArgumentException("Invalid wallet type: " + walletType);
        }

        walletRepository.save(wallet);

        BigDecimal balanceAfter = getWalletTypeBalance(wallet, walletType);

        // Create transaction record
        Transaction transaction = createTransaction(
                user,
                "DEBIT",
                walletType,
                amount,
                balanceBefore,
                balanceAfter,
                description
        );

        log.info("Wallet debited successfully for user: {}", user.getUserId());

        return transaction;
    }

    /**
     * Get transaction history with filters
     */
    public Page<TransactionResponse> getTransactionHistory(
            String userId,
            Pageable pageable,
            String type,
            String category
    ) {
        log.info("Fetching transaction history for user: {}", userId);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Page<Transaction> transactions;

        if (type != null && !type.isEmpty()) {
            transactions = transactionRepository.findByUserAndType(user, type, pageable);
        } else if (category != null && !category.isEmpty()) {
            transactions = transactionRepository.findByUserAndCategory(user, category, pageable);
        } else {
            transactions = transactionRepository.findByUser(user, pageable);
        }

        return transactions.map(this::mapToTransactionResponse);
    }

    /**
     * Validate sufficient balance before debit
     */
    public void validateSufficientBalance(User user, BigDecimal amount, String walletType) {
        log.debug("Validating sufficient balance for user: {}, amount: {}, type: {}",
                user.getUserId(), amount, walletType);

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getUserId()));

        BigDecimal currentBalance = getWalletTypeBalance(wallet, walletType);

        if (currentBalance.compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    String.format("Insufficient %s balance. Available: %s, Required: %s",
                            walletType, currentBalance, amount)
            );
        }
    }

    /**
     * Get balance for specific wallet type
     */
    private BigDecimal getWalletTypeBalance(Wallet wallet, String walletType) {
        switch (walletType.toUpperCase()) {
            case "INVESTMENT":
                return wallet.getInvestmentBalance();
            case "COMMISSION":
                return wallet.getCommissionBalance();
            case "RENTAL_INCOME":
            case "RENTAL":
                return wallet.getRentalIncomeBalance();
            case "ROI":
                return wallet.getRoiBalance();
            default:
                throw new IllegalArgumentException("Invalid wallet type: " + walletType);
        }
    }

    /**
     * Create transaction record
     */
    private Transaction createTransaction(
            User user,
            String type,
            String walletType,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String description
    ) {
        Transaction transaction = new Transaction();
        transaction.setTransactionId(generateTransactionId());
        transaction.setUser(user);
        transaction.setType(type);
        transaction.setCategory(walletType);
        transaction.setWalletType(walletType);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setStatus("SUCCESS");
        transaction.setCreatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Transfer between wallet types (internal transfer)
     */
    @Transactional
    public String transferBetweenWallets(
            String userId,
            String fromWalletType,
            String toWalletType,
            BigDecimal amount
    ) {
        log.info("Transferring between wallets for user: {}, from: {}, to: {}, amount: {}",
                userId, fromWalletType, toWalletType, amount);

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        // Debit from source wallet
        debitWallet(user, amount, fromWalletType,
                String.format("Transfer to %s wallet", toWalletType));

        // Credit to destination wallet
        creditWallet(user, amount, toWalletType,
                String.format("Transfer from %s wallet", fromWalletType));

        log.info("Wallet transfer completed successfully");

        return "Transfer completed successfully";
    }

    /**
     * Lock balance (for pending withdrawals, etc.)
     * Uses pessimistic locking to prevent race conditions
     */
    @Transactional
    public void lockBalance(User user, BigDecimal amount) {
        log.info("Locking balance for user: {}, amount: {}", user.getUserId(), amount);

        // Use pessimistic write lock to ensure thread-safety
        Wallet wallet = walletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getUserId()));

        // Validate sufficient withdrawable balance
        if (wallet.getWithdrawableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient withdrawable balance to lock");
        }

        wallet.setLockedBalance(wallet.getLockedBalance().add(amount));
        walletRepository.save(wallet);

        log.info("Balance locked successfully");
    }

    /**
     * Unlock balance
     * Uses pessimistic locking to prevent race conditions
     */
    @Transactional
    public void unlockBalance(User user, BigDecimal amount) {
        log.info("Unlocking balance for user: {}, amount: {}", user.getUserId(), amount);

        // Use pessimistic write lock to ensure thread-safety
        Wallet wallet = walletRepository.findByUserWithLock(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getUserId()));

        if (wallet.getLockedBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Cannot unlock more than locked balance");
        }

        wallet.setLockedBalance(wallet.getLockedBalance().subtract(amount));
        walletRepository.save(wallet);

        log.info("Balance unlocked successfully");
    }

    /**
     * Get wallet by user
     */
    public Wallet getWalletByUser(User user) {
        return walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + user.getUserId()));
    }

    /**
     * Map Wallet to WalletResponse
     */
    private WalletResponse mapToWalletResponse(Wallet wallet) {
        return WalletResponse.builder()
                .investmentBalance(wallet.getInvestmentBalance())
                .commissionBalance(wallet.getCommissionBalance())
                .rentalIncomeBalance(wallet.getRentalIncomeBalance())
                .roiBalance(wallet.getRoiBalance())
                .totalBalance(wallet.getTotalBalance())
                .withdrawableBalance(wallet.getWithdrawableBalance())
                .lockedBalance(wallet.getLockedBalance())
                .totalEarned(wallet.getTotalEarned())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .build();
    }

    /**
     * Map Transaction to TransactionResponse
     */
    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getId())
                .type(transaction.getType())
                .category(transaction.getCategory())
                .walletType(transaction.getWalletType())
                .amount(transaction.getAmount())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .description(transaction.getDescription())
                .status(transaction.getStatus())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    /**
     * Get total earnings (all income wallets combined)
     */
    public BigDecimal getTotalEarnings(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        return wallet.getTotalEarned();
    }

    /**
     * Get withdrawable balance
     */
    public BigDecimal getWithdrawableBalance(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + userId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        return wallet.getWithdrawableBalance();
    }

    /**
     * Get transactions for current authenticated user with filters
     */
    public PageResponse<TransactionResponse> getTransactions(
            Pageable pageable,
            String type,
            String category,
            String status,
            String startDate,
            String endDate
    ) {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching transactions for current user: {}", currentUserMlmId);

        User user = userRepository.findByUserId(currentUserMlmId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + currentUserMlmId));

        Page<Transaction> transactions;

        // Parse dates if provided
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (startDate != null && !startDate.isEmpty()) {
            startDateTime = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
        }

        if (endDate != null && !endDate.isEmpty()) {
            endDateTime = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE).atTime(23, 59, 59);
        }

        // Apply filters
        if (startDateTime != null && endDateTime != null) {
            transactions = transactionRepository.findByUserAndDateRange(user, startDateTime, endDateTime, pageable);
        } else if (type != null && !type.isEmpty()) {
            transactions = transactionRepository.findByUserAndType(user, type, pageable);
        } else if (category != null && !category.isEmpty()) {
            transactions = transactionRepository.findByUserAndCategory(user, category, pageable);
        } else {
            transactions = transactionRepository.findByUser(user, pageable);
        }

        Page<TransactionResponse> responsePage = transactions.map(this::mapToTransactionResponse);

        return PageResponse.<TransactionResponse>builder()
                .content(responsePage.getContent())
                .page(responsePage.getNumber())
                .size(responsePage.getSize())
                .totalElements(responsePage.getTotalElements())
                .totalPages(responsePage.getTotalPages())
                .last(responsePage.isLast())
                .build();
    }

    /**
     * Get wallet summary for current authenticated user
     */
    public WalletSummaryResponse getWalletSummary() {
        String currentUserMlmId = SecurityUtil.getCurrentUserMlmId();
        log.info("Fetching wallet summary for current user: {}", currentUserMlmId);

        User user = userRepository.findByUserId(currentUserMlmId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with userId: " + currentUserMlmId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + currentUserMlmId));

        // Calculate total credits and debits
        Page<Transaction> allTransactions = transactionRepository.findByUser(user, Pageable.unpaged());

        BigDecimal totalCredits = allTransactions.stream()
                .filter(t -> "CREDIT".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDebits = allTransactions.stream()
                .filter(t -> "DEBIT".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate today's and this month's earnings
        LocalDateTime todayStart = LocalDateTime.of(java.time.LocalDate.now(), java.time.LocalTime.MIN);
        LocalDateTime monthStart = LocalDateTime.of(java.time.LocalDate.now().withDayOfMonth(1), java.time.LocalTime.MIN);

        Page<Transaction> todayTxns = transactionRepository.findByUserAndDateRange(user, todayStart, LocalDateTime.now(), Pageable.unpaged());
        Page<Transaction> monthTxns = transactionRepository.findByUserAndDateRange(user, monthStart, LocalDateTime.now(), Pageable.unpaged());

        BigDecimal todayEarnings = todayTxns.stream()
                .filter(t -> "CREDIT".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal thisMonthEarnings = monthTxns.stream()
                .filter(t -> "CREDIT".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return WalletSummaryResponse.builder()
                .investmentBalance(wallet.getInvestmentBalance())
                .commissionBalance(wallet.getCommissionBalance())
                .rentalIncomeBalance(wallet.getRentalIncomeBalance())
                .roiBalance(wallet.getRoiBalance())
                .totalBalance(wallet.getTotalBalance())
                .withdrawableBalance(wallet.getWithdrawableBalance())
                .lockedBalance(wallet.getLockedBalance())
                .totalEarned(wallet.getTotalEarned())
                .totalWithdrawn(wallet.getTotalWithdrawn())
                .totalCredits(totalCredits)
                .totalDebits(totalDebits)
                .thisMonthEarnings(thisMonthEarnings)
                .todayEarnings(todayEarnings)
                .transactionCount(allTransactions.getContent().size())
                .build();
    }
}
