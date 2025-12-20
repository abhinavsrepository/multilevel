package com.realestate.mlm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardCharts {
    private List<EarningsTrendData> earningsTrend;
    private List<CommissionBreakdownData> commissionBreakdown;
    private List<PortfolioDistributionData> portfolioDistribution;
    private List<TeamGrowthData> teamGrowth;
}
