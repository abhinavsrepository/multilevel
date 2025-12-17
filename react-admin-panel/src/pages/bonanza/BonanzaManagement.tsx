import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Tag,
    Space,
    message,
    Typography,
    Spin,
    Statistic,
    Row,
    Col,
    Input,
    Select,
    Tooltip,
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    DashboardOutlined,
    ReloadOutlined,
    TrophyOutlined,
    DollarOutlined,
    TeamOutlined,
    RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    getAllBonanzas,
    deleteBonanza,
    updateBonanzaStatuses,
    getBonanzaStatistics,
    Bonanza,
    BonanzaStatistics
} from '../../api/bonanza.api';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const BonanzaManagement: React.FC = () => {
    const navigate = useNavigate();
    const [bonanzas, setBonanzas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statistics, setStatistics] = useState<BonanzaStatistics | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        status: '',
        periodType: '',
        search: ''
    });

    useEffect(() => {
        fetchBonanzas();
        fetchStatistics();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchBonanzas = async () => {
        try {
            setLoading(true);
            const response = await getAllBonanzas({
                status: filters.status || undefined,
                periodType: filters.periodType || undefined,
                page: pagination.current,
                limit: pagination.pageSize,
                sortBy: 'createdAt',
                sortOrder: 'DESC'
            });

            if (response.success) {
                setBonanzas(response.data);
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination.total
                }));
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch bonanzas');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await getBonanzaStatistics();
            if (response.success) {
                setStatistics(response.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    const handleUpdateStatuses = async () => {
        try {
            await updateBonanzaStatuses();
            message.success('Bonanza statuses updated successfully');
            fetchBonanzas();
            fetchStatistics();
        } catch (error: any) {
            message.error(error.message || 'Failed to update statuses');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await deleteBonanza(id);
            if (response.success) {
                message.success('Bonanza deleted successfully');
                fetchBonanzas();
                fetchStatistics();
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to delete bonanza');
        }
    };

    const handleTableChange = (newPagination: any) => {
        setPagination({
            current: newPagination.current,
            pageSize: newPagination.pageSize,
            total: pagination.total
        });
    };

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            DRAFT: { color: 'default', text: 'Draft' },
            ACTIVE: { color: 'green', text: 'Active' },
            UPCOMING: { color: 'blue', text: 'Upcoming' },
            EXPIRED: { color: 'red', text: 'Expired' },
            CANCELLED: { color: 'gray', text: 'Cancelled' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getRewardTypeTag = (type: string) => {
        const typeConfig: Record<string, { color: string }> = {
            FIXED: { color: 'green' },
            PERCENTAGE: { color: 'blue' },
            POOL_SHARE: { color: 'purple' },
            ITEM: { color: 'orange' }
        };
        const config = typeConfig[type] || { color: 'default' };
        return <Tag color={config.color}>{type}</Tag>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (text: string, record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        {record.description?.substring(0, 50)}...
                    </div>
                </div>
            )
        },
        {
            title: 'Period',
            key: 'period',
            width: 200,
            render: (_: any, record: any) => (
                <div>
                    <div>{dayjs(record.startDate).format('DD MMM YYYY')}</div>
                    <div>to {dayjs(record.endDate).format('DD MMM YYYY')}</div>
                    <Tag color="blue" style={{ marginTop: 4 }}>
                        {record.periodType || 'FIXED_DATES'}
                    </Tag>
                </div>
            )
        },
        {
            title: 'Reward',
            key: 'reward',
            width: 180,
            render: (_: any, record: any) => (
                <div>
                    {getRewardTypeTag(record.rewardType)}
                    <div style={{ marginTop: 4 }}>
                        {record.rewardAmount ? formatCurrency(record.rewardAmount) : record.rewardDescription}
                    </div>
                </div>
            )
        },
        {
            title: 'Participants',
            key: 'participants',
            align: 'center' as const,
            width: 120,
            render: (_: any, record: any) => {
                const stats = record.stats || {};
                return (
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {stats.totalParticipants || 0}
                        </div>
                        <div style={{ fontSize: '12px', color: '#52c41a' }}>
                            {stats.qualifiedCount || 0} qualified
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Payout',
            key: 'payout',
            align: 'right' as const,
            width: 120,
            render: (_: any, record: any) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {formatCurrency(record.totalPaidOut || 0)}
                    </div>
                    {record.maxQualifiers && (
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            {record.currentQualifiers || 0}/{record.maxQualifiers} slots
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            filters: [
                { text: 'Draft', value: 'DRAFT' },
                { text: 'Active', value: 'ACTIVE' },
                { text: 'Upcoming', value: 'UPCOMING' },
                { text: 'Expired', value: 'EXPIRED' },
                { text: 'Cancelled', value: 'CANCELLED' }
            ],
            render: (status: string) => getStatusTag(status)
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 180,
            fixed: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="View Dashboard">
                        <Button
                            icon={<DashboardOutlined />}
                            size="small"
                            onClick={() => navigate(`/bonanza/${record.id}/dashboard`)}
                        />
                    </Tooltip>
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => navigate(`/bonanza/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => navigate(`/bonanza/${record.id}/edit`)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure you want to delete this bonanza?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                disabled={record.currentQualifiers > 0}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            {/* Statistics Cards */}
            {statistics && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Bonanzas"
                                value={statistics.overview.totalBonanzas}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Active Bonanzas"
                                value={statistics.overview.activeBonanzas}
                                prefix={<RiseOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Qualifiers"
                                value={statistics.overview.totalQualifiers}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Paid Out"
                                value={statistics.overview.totalPaidOut}
                                prefix={<DollarOutlined />}
                                valueStyle={{ color: '#f5222d' }}
                                formatter={(value) => formatCurrency(value as number)}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Main Card */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Title level={4}>Bonanza Campaign Management</Title>
                    <Space>
                        <Tooltip title="Update Statuses">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleUpdateStatuses}
                            >
                                Update Statuses
                            </Button>
                        </Tooltip>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate('/bonanza/create')}
                        >
                            Create Bonanza
                        </Button>
                    </Space>
                </div>

                {/* Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                        <Search
                            placeholder="Search bonanzas..."
                            allowClear
                            onSearch={(value) => setFilters({ ...filters, search: value })}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters({ ...filters, status: value || '' })}
                        >
                            <Option value="">All Status</Option>
                            <Option value="DRAFT">Draft</Option>
                            <Option value="ACTIVE">Active</Option>
                            <Option value="UPCOMING">Upcoming</Option>
                            <Option value="EXPIRED">Expired</Option>
                            <Option value="CANCELLED">Cancelled</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder="Filter by period type"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(value) => setFilters({ ...filters, periodType: value || '' })}
                        >
                            <Option value="">All Types</Option>
                            <Option value="FIXED_DATES">Fixed Dates</Option>
                            <Option value="FROM_JOIN_DATE">From Join Date</Option>
                            <Option value="QUARTERLY">Quarterly</Option>
                            <Option value="MONTHLY">Monthly</Option>
                        </Select>
                    </Col>
                </Row>

                {/* Table */}
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={bonanzas}
                        rowKey="id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} bonanzas`
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                    />
                </Spin>
            </Card>

            {/* Top Performing Bonanzas */}
            {statistics && statistics.topPerforming.length > 0 && (
                <Card title="Top Performing Bonanzas" style={{ marginTop: 24 }}>
                    <Row gutter={16}>
                        {statistics.topPerforming.map((bonanza, index) => (
                            <Col span={8} key={bonanza.id}>
                                <Card
                                    hoverable
                                    onClick={() => navigate(`/bonanza/${bonanza.id}/dashboard`)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '18px',
                                            marginRight: 12
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{bonanza.name}</div>
                                            {getStatusTag(bonanza.status)}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ color: '#888' }}>Qualifiers:</span>
                                            <span style={{ fontWeight: 'bold' }}>{bonanza.currentQualifiers}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Paid Out:</span>
                                            <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                                                {formatCurrency(bonanza.totalPaidOut)}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default BonanzaManagement;
