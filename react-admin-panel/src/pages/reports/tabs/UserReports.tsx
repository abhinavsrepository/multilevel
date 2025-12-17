import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { UserOutlined, UserAddOutlined, UserDeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import { analyticsApi } from '@/api/analyticsApi';
import { UserAnalytics, AnalyticsFilters } from '@/types/analytics.types';

interface UserReportsProps {
    filters: AnalyticsFilters;
}

const UserReports: React.FC<UserReportsProps> = ({ filters }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UserAnalytics | null>(null);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await analyticsApi.getUserAnalytics(filters);
            if (response.data.success && response.data.data) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const registrationConfig = {
        data: data?.registrationTrend || [],
        xField: 'date',
        yField: 'value',
        smooth: true,
        color: '#1890ff',
    };

    const statusConfig = {
        data: data?.statusDistribution || [],
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
        <div className="user-reports">
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Total Registrations"
                            value={data?.totalRegistrations || 0}
                            prefix={<UserAddOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Active Users"
                            value={data?.activeUsers || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Inactive Users"
                            value={data?.inactiveUsers || 0}
                            prefix={<UserDeleteOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Retention Rate"
                            value={data?.retentionRate || 0}
                            suffix="%"
                            prefix={<TeamOutlined />}
                            precision={2}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Registration Trend" loading={loading}>
                        <Line {...registrationConfig} height={300} />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="User Status Distribution" loading={loading}>
                        <Pie {...statusConfig} height={300} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserReports;
