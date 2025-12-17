import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { HomeOutlined, ShopOutlined, MoneyCollectOutlined, BarChartOutlined } from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/plots';
import { analyticsApi } from '@/api/analyticsApi';
import { PropertyAnalytics, AnalyticsFilters } from '@/types/analytics.types';
import { formatCurrency } from '@/utils/helpers';

interface PropertyReportsProps {
    filters: AnalyticsFilters;
}

const PropertyReports: React.FC<PropertyReportsProps> = ({ filters }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PropertyAnalytics | null>(null);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await analyticsApi.getPropertyAnalytics(filters);
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch property analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const bookingConfig = {
        data: data?.bookingTrend || [],
        xField: 'date',
        yField: 'value',
        smooth: true,
        color: '#722ed1',
    };

    const typeConfig = {
        data: data?.propertyTypeDistribution || [],
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

    const investmentConfig = {
        data: data?.investmentByProperty || [],
        xField: 'name',
        yField: 'value',
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        xAxis: {
            label: {
                autoHide: true,
                autoRotate: false,
            },
        },
    };

    return (
        <div className="property-reports">
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Properties"
                            value={data?.totalProperties || 0}
                            prefix={<HomeOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Active Listings"
                            value={data?.activeListings || 0}
                            prefix={<ShopOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Investment"
                            value={data?.totalInvestmentReceived || 0}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Avg Investment / Property"
                            value={data?.averageInvestmentPerProperty || 0}
                            precision={2}
                            prefix="₹"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Booking Trend" loading={loading}>
                        <Line {...bookingConfig} height={300} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Property Type Distribution" loading={loading}>
                        <Pie {...typeConfig} height={300} />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="Investment by Property (Top 10)" loading={loading}>
                        <Column {...investmentConfig} height={300} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PropertyReports;
