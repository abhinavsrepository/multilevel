package com.realestate.mlm.repository;

import com.realestate.mlm.model.RankSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankSettingRepository extends JpaRepository<RankSetting, Long> {

    Optional<RankSetting> findByRankName(String rankName);

    List<RankSetting> findByIsActiveTrueOrderByDisplayOrder();
}
