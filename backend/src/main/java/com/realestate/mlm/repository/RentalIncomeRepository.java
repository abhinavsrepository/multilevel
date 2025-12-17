package com.realestate.mlm.repository;

import com.realestate.mlm.model.RentalIncome;
import com.realestate.mlm.model.Property;
import com.realestate.mlm.model.User;
import com.realestate.mlm.model.PropertyInvestment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalIncomeRepository extends JpaRepository<RentalIncome, Long> {

    List<RentalIncome> findByUser(User user);

    List<RentalIncome> findByProperty(Property property);

    Optional<RentalIncome> findByInvestmentAndMonth(PropertyInvestment investment, YearMonth month);
}
