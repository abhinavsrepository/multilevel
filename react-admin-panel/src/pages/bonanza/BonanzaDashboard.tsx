import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Button,
    message,
    Typography,
    Spin,
    Progress,
    Space,
    Tooltip,
    Modal,
    Form,
    InputNumber,
    Input,
    Select
} from 'antd';
import {
    TeamOutlined,
    TrophyOutlined,
    DollarOutlined,
    RiseOutlined,
    ReloadOutlined,
    ArrowLeftOutlined,
    GiftOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Line } from '@ant-design/charts';
import dayjs from 'dayjs';
import {
    getBonanzaDashboard,
    getBonanzaQualifiers,
    manualAwardBonanza,
    DashboardData
} from '../../api/bonanza.api';

const { Title, Text } = Typography;
const { Option } = Select;

const BonanzaDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [qualifiers, setQualifiers] = useState<any[]>([]);
    const [manualAwardModal, setManualAwardModal] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            fetchDashboard();
            fetchQualifiers();
        }
    }, [id]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await getBonanzaDashboard(Number(id));
            if (response.success) {
                setDashboard(response.data);
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchQualifiers = async () => {
        try {
            const response = await getBonanzaQualifiers(Number(id), {
                limit: 50
            });
            if (response.success) {
                setQualifiers(response.data);
            }
        } catch (error: any) {
            console.error('Failed to load qualifiers:', error);
        }
    };

    const handleManualAward = async (values: any) => {
        try {
            await manualAwardBonanza(Number(id), values.userId, values.reason);
            message.success('Bonanza awarded successfully');
            setManualAwardModal(false);
            form.resetFields();
            fetchDashboard();
            fetchQualifiers();
        } catch (error: any) {
            message.error(error.message || 'Failed to award bonanza');
        }
    };

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string }> = {
            PENDING: { color: 'default' },
            IN_PROGRESS: { color: 'blue' },
            QUALIFIED: { color: 'green' },
            AWARDED: { color: 'purple' },
            DISQUALIFIED: { color: 'red' },
            EXPIRED: { color: 'gray' }
        };
        const config = statusConfig[status] || { color: 'default' };
        return <Tag color={config.color}>{status}</Tag>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const leaderboardColumns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center' as const,
            render: (rank: number) => {
                const medalColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#e8e8e8';
                return (
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: medalColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        margin: '0 auto'
                    }}>
                        {rank}
                    </div>
                );
            }
        },
        {
            title: 'User',
            key: 'user',
            render: (_: any, record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.name}</div>
                    <Text type="secondary">@{record.username}</Text>
                </div>
            )
        },
        {
            title: 'Progress',
            dataIndex: 'overallProgress',
            key: 'progress',
            width: 200,
            render: (progress: number) => (
                <div>
                    <Progress percent={Math.round(progress)} size="small" />
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => getStatusTag(status)
        },
        {
            title: 'Score',
            dataIndex: 'leaderboardScore',
            key: 'score',
            width: 120,
            align: 'right' as const,
            render: (score: number) => score?.toFixed(0) || '0'
        }
    ];

    const qualifierColumns = [
        {
            title: 'User',
            key: 'user',
            render: (_: any, record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {record.user?.firstName} {record.user?.lastName}
                    </div>
                    <Text type="secondary">{record.user?.email}</Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status)
        },
        {
            title: 'Progress',
            dataIndex: 'overallProgress',
            key: 'progress',
            render: (progress: number) => `${progress?.toFixed(1)}%`
        },
        {
            title: 'Qualified Date',
            dataIndex: 'qualifiedDate',
            key: 'qualifiedDate',
            render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '—'
        },
        {
            title: 'Reward',
            dataIndex: 'rewardAmount',
            key: 'reward',
            render: (amount: number) => amount ? formatCurrency(amount) : '—'
        }
    ];

    if (loading || !dashboard) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    const { bonanza, leaderboard, stats, trends } = dashboard;

    // Prepare chart data
    const chartData = trends.dailyProgress.map(item => ({
        date: dayjs(item.date).format('MMM DD'),
        'Active Users': item.activeUsers,
        'Avg Progress': item.avgProgress
    }));

    return (
        <div>
            {/* Header */}
            <Card style={{ marginBottom: 24 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/bonanza')}
                    style={{ marginBottom: 16 }}
                >
                    Back to List
                </Button>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={3} style={{ marginBottom: 0 }}>{bonanza.name}</Title>
                        <Text type="secondary">{bonanza.description}</Text>
                        <div style={{ marginTop: 8 }}>
                            {getStatusTag(bonanza.status || '')}
                            <Text type="secondary" style={{ marginLeft: 16 }}>
                                {dayjs(bonanza.startDate).format('DD MMM YYYY')} - {dayjs(bonanza.endDate).format('DD MMM YYYY')}
                            </Text>
                        </div>
                    </Col>
                    <Col>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={fetchDashboard}>
                                Refresh
                            </Button>
                            <Button
                                type="primary"
                                icon={<GiftOutlined />}
                                onClick={() => setManualAwardModal(true)}
                            >
                                Manual Award
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Participants"
                            value={stats.byStatus.reduce((sum, s) => sum + (s.count || 0), 0)}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Qualified Users"
                            value={stats.currentQualifiers}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                            suffix={stats.maxQualifiers ? `/ ${stats.maxQualifiers}` : ''}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Paid Out"
                            value={stats.totalPaidOut}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                            formatter={(value) => formatCurrency(value as number)}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Projected Payout"
                            value={stats.projectedPayout}
                            prefix={<RiseOutlined />}
                            valueStyle={{ color: '#faad14' }}
                            formatter={(value) => formatCurrency(value as number)}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Status Breakdown */}
            <Card title="Qualification Status Breakdown" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    {stats.byStatus.map((statusData: any) => (
                        <Col span={6} key={statusData.status}>
                            <Card>
                                <Statistic
                                    title={statusData.status}
                                    value={statusData.count}
                                    suffix={
                                        <Tooltip title={`Average Progress: ${statusData.avgProgress?.toFixed(1)}%`}>
                                            <span style={{ fontSize: '14px', color: '#888' }}>
                                                ({statusData.avgProgress?.toFixed(0)}%)
                                            </span>
                                        </Tooltip>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Trend Chart */}
            {chartData.length > 0 && (
                <Card title="7-Day Progress Trend" style={{ marginBottom: 24 }}>
                    <Line
                        data={chartData}
                        xField="date"
                        yField="value"
                        seriesField="type"
                        smooth
                        height={300}
                    />
                </Card>
            )}

            {/* Top 10 Leaderboard */}
            <Card title="Top 10 Leaderboard" style={{ marginBottom: 24 }}>
                <Table
                    columns={leaderboardColumns}
                    dataSource={leaderboard.slice(0, 10)}
                    rowKey={(record) => record.userId}
                    pagination={false}
                />
            </Card>

            {/* All Qualifiers */}
            <Card
                title={`All Qualifiers (${qualifiers.length})`}
                extra={
                    <Button onClick={fetchQualifiers} icon={<ReloadOutlined />}>
                        Refresh
                    </Button>
                }
            >
                <Table
                    columns={qualifierColumns}
                    dataSource={qualifiers}
                    rowKey="id"
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} qualifiers`
                    }}
                />
            </Card>

            {/* Manual Award Modal */}
            <Modal
                title="Manual Award Bonanza"
                open={manualAwardModal}
                onCancel={() => {
                    setManualAwardModal(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleManualAward}>
                    <Form.Item
                        name="userId"
                        label="User ID"
                        rules={[{ required: true, message: 'Please enter user ID' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Enter the user ID to award"
                        />
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="Reason"
                        rules={[{ required: true, message: 'Please provide a reason' }]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Explain why this bonanza is being manually awarded..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BonanzaDashboard;
