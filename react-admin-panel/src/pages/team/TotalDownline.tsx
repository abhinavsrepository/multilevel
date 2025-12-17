import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Space,
    Button,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    Tooltip,
    Typography,
    Avatar,
    message,
    Statistic
} from 'antd';
import {
    SearchOutlined,
    UserOutlined,
    EyeOutlined,
    TeamOutlined,
    DollarOutlined,
    ReloadOutlined,
    UserAddOutlined,
    RiseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { teamApi } from '@/api/team.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TotalDownline: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const [stats, setStats] = useState<any>(null); // For summary dashboard stats

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        sponsorId: '',
        dateFrom: '',
        dateTo: ''
    });

    const fetchStats = async () => {
        try {
            const res = await teamApi.getTeamStats();
            if (res.data && res.data.success) {
                setStats(res.data.data);
            } else if (res.data && !res.data.success) {
                // Handle case where .data exists but internal success is false
                // or direct data return
                setStats(res.data.data || res.data);
            }
        } catch (err) {
            console.error("Failed to fetch stats", err);
        }
    }

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await teamApi.getTotalDownline({
                page,
                limit: pageSize,
                search: filters.search,
                status: filters.status,
                sponsorId: filters.sponsorId ? parseInt(filters.sponsorId) : undefined,
                startDate: filters.dateFrom,
                endDate: filters.dateTo
            });

            const resData = response.data?.data || response.data || [];
            const resMeta = response.data?.pagination || {};

            setData(resData);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: resMeta.total || resData.length
            });
        } catch (error) {
            console.error('Fetch error:', error);
            message.error('Failed to load downline data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, [filters, pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination: any) => {
        fetchData(newPagination.current, newPagination.pageSize);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            status: '',
            sponsorId: '',
            dateFrom: '',
            dateTo: ''
        });
    };

    const columns = [
        {
            title: 'User Details',
            key: 'user',
            render: (record: any) => (
                <Space>
                    <Avatar src={record.profilePicture} icon={<UserOutlined />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong>{record.firstName} {record.lastName}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.username}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Sponsor & Upline',
            key: 'sponsor',
            render: (record: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text>{record.sponsorName || 'N/A'}</Text>
                    {record.uplinePath && (
                        <Tooltip title={record.uplinePath}>
                            <Tag color="blue" style={{ marginTop: 4, cursor: 'help', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                View Upline Path
                            </Tag>
                        </Tooltip>
                    )}
                </div>
            ),
        },
        {
            title: 'Network Stats',
            key: 'stats',
            render: (record: any) => (
                <Space direction="vertical" size={0}>
                    <Text>Total Downline: <Text strong>{record.totalDownline}</Text></Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Directs: {record.directReferrals}</Text>
                </Space>
            )
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            render: (rank: string) => <Tag color="gold">{rank || 'Associate'}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'ACTIVE' ? 'green' : status === 'INACTIVE' ? 'red' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Topup / Expiry',
            key: 'topup',
            render: (record: any) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.topUpStatus || 'N/A'}</Text>
                    {record.topUpExpiry ? (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            Exp: {dayjs(record.topUpExpiry).format('DD MMM YYYY')}
                        </Text>
                    ) : <Text type="secondary">-</Text>}
                </Space>
            )
        },
        {
            title: 'Last Commission',
            key: 'commission',
            render: (record: any) => (
                record.lastCommissionAmount ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Text strong style={{ color: '#52c41a' }}>₹{record.lastCommissionAmount}</Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>{dayjs(record.lastCommissionDate).format('DD MMM')}</Text>
                    </div>
                ) : <Text type="secondary">-</Text>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: any) => (
                <Space>
                    <Tooltip title="View Profile">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/users/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Team Detail">
                        <Button
                            type="text"
                            icon={<TeamOutlined style={{ color: '#1890ff' }} />}
                            onClick={() => navigate(`/team/detail/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Commission Ledger">
                        <Button
                            type="text"
                            icon={<DollarOutlined style={{ color: '#52c41a' }} />}
                            onClick={() => navigate(`/commissions/${record.id}`)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="total-downline-page">
            <Title level={2} style={{ marginBottom: 24 }}>Total System Downline Audit</Title>

            {/* Downline Summary Dashboard */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total System Users"
                            value={stats?.totalMembers || 0}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Active Users"
                            value={stats?.activeMembers || 0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="New Registrations Today"
                            value={stats?.todayRegistrations || 0}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<UserAddOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Commissions Paid (YTD)"
                            value={stats?.totalCommissionsYTD || 0}
                            precision={2}
                            prefix="₹"
                            valueStyle={{ color: '#cf1322' }}
                            suffix={<RiseOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={6} md={5}>
                        <Input
                            placeholder="Search Name/Username/ID"
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            onPressEnter={() => fetchData(1, pagination.pageSize)}
                        />
                    </Col>
                    <Col xs={24} sm={6} md={4}>
                        <Select
                            placeholder="Status"
                            style={{ width: '100%' }}
                            value={filters.status || undefined}
                            onChange={(val) => setFilters({ ...filters, status: val })}
                            allowClear
                        >
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                            <Option value="BLOCKED">Blocked</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={6} md={5}>
                        <Input
                            placeholder="Sponsor Username/ID"
                            prefix={<UserOutlined />}
                            value={filters.sponsorId}
                            onChange={(e) => setFilters({ ...filters, sponsorId: e.target.value })}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            onChange={(dates) => {
                                if (dates && dates[0] && dates[1]) {
                                    setFilters({
                                        ...filters,
                                        dateFrom: dates[0].toISOString(),
                                        dateTo: dates[1].toISOString()
                                    });
                                } else {
                                    setFilters({ ...filters, dateFrom: '', dateTo: '' });
                                }
                            }}
                        />
                    </Col>
                    <Col xs={24} sm={4} md={4} style={{ display: 'flex', gap: 8 }}>
                        <Button type="primary" onClick={() => fetchData(1, pagination.pageSize)}>Filter</Button>
                        <Button icon={<ReloadOutlined />} onClick={clearFilters}>Reset</Button>
                    </Col>
                </Row>
            </Card>

            <Card bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
};

export default TotalDownline;
