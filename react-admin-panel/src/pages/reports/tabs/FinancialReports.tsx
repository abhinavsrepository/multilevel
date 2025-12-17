import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { DollarOutlined, RiseOutlined, FallOutlined, BankOutlined } from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { analyticsApi } from '@/api/analyticsApi';
import { FinancialAnalytics, AnalyticsFilters } from '@/types/analytics.types';
import { formatCurrency } from '@/utils/helpers';

interface FinancialReportsProps {
    filters: AnalyticsFilters;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ filters }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<FinancialAnalytics | null>(null);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await analyticsApi.getFinancialAnalytics(filters);
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch financial analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const revenueConfig = {
        data: data?.revenueVsCommission || [],
        isGroup: true,
        xField: 'period',
        yField: 'value',
        seriesField: 'type',
        color: ['#52c41a', '#1890ff'],
    };

    const commissionConfig = {
        data: data?.commissionDistribution || [],
        angleField: 'value',
        colorField: 'category',
        radius: 0.8,
        label: {
            text: 'value',
            style: {
                fontWeight: 'bold',
            },
        },
    };

    return (
        <div className="financial-reports">
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Revenue"
                            value={data?.totalRevenue || 0}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Commissions Paid"
                            value={data?.totalCommissionsPaid || 0}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Payouts"
                            value={data?.totalPayouts || 0}
                            precision={2}
                            prefix="₹"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Profit Margin"
                            value={data?.profitMargin || 0}
                            precision={2}
                            suffix="%"
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: (data?.profitMargin || 0) >= 0 ? '#3f8600' : '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Revenue vs Commission" loading={loading}>
                        {/* Transform data for grouped column chart if needed */}
                        <Column
                            data={(data?.revenueVsCommission || []).flatMap(item => [
                                { period: item.period, type: 'Revenue', value: item.revenue },
                                { period: item.period, type: 'Commission', value: item.commission }
                            ])}
                            isGroup={true}
                            xField="period"
                            yField="value"
                            seriesField="type"
                            height={300}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Commission Distribution" loading={loading}>
                        <Pie {...commissionConfig} height={300} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default FinancialReports;
