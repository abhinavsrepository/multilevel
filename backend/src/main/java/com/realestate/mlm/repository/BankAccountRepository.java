package com.realestate.mlm.repository;

import com.realestate.mlm.model.BankAccount;
import com.realestate.mlm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    List<BankAccount> findByUser(User user);

    Optional<BankAccount> findByUserAndIsPrimaryTrue(User user);

    Optional<BankAccount> findByAccountNumber(String accountNumber);
}
