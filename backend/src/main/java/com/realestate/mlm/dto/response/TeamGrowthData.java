package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamGrowthData {
    private String month;
    private Integer leftLeg;
    private Integer rightLeg;
}
