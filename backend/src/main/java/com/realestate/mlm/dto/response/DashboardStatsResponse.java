package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Dashboard response matching frontend DashboardData interface
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private DashboardUserInfo user;
    private DashboardStats stats;
    private DashboardCharts charts;
    private List<ActivityResponse> recentActivities;
    private List<DashboardAnnouncementResponse> announcements;
}
