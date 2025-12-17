package com.realestate.mlm.repository;

import com.realestate.mlm.model.InstallmentPayment;
import com.realestate.mlm.model.PropertyInvestment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InstallmentPaymentRepository extends JpaRepository<InstallmentPayment, Long> {

    Optional<InstallmentPayment> findByPaymentId(String paymentId);

    List<InstallmentPayment> findByInvestment(PropertyInvestment investment);

    List<InstallmentPayment> findByStatus(String status);

    List<InstallmentPayment> findByStatusAndDueDateBetween(String status, LocalDate startDate, LocalDate endDate);

    List<InstallmentPayment> findByStatusAndDueDateBefore(String status, LocalDate date);

    List<InstallmentPayment> findByInvestmentInAndStatus(List<PropertyInvestment> investments, String status);

    @Query("SELECT ip FROM InstallmentPayment ip WHERE ip.dueDate <= :currentDate AND ip.status != 'PAID'")
    List<InstallmentPayment> findUpcomingDueInstallments(@Param("currentDate") LocalDate currentDate);

    Optional<InstallmentPayment> findByInvestmentAndInstallmentNumber(PropertyInvestment investment,
            Integer installmentNumber);
}
