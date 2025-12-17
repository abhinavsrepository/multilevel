package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamCountResponse {
    private Integer totalTeam;
    private Integer leftLegCount;
    private Integer rightLegCount;
    private Integer activeMembers;
    private Integer inactiveMembers;
    private Integer directReferrals;
    private Integer directReferralsThisMonth;
    private Integer newMembersToday;
    private Integer newMembersThisWeek;
    private Integer newMembersThisMonth;
}
