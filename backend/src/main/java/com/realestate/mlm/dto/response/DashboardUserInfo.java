package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardUserInfo {
    private String fullName;
    private String userId;
    private String profilePicture;
    private String rank;
    private String rankIcon;
}
