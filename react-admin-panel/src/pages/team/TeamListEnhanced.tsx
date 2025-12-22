import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Input,
    Select,
    DatePicker,
    Row,
    Col,
    message,
    Statistic,
    Alert,
    Empty,
    Tooltip,
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    TeamOutlined,
    UserOutlined,
    EyeOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { teamApi, TeamMember } from '@/api/team.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface TeamListEnhancedProps {
    type: 'direct' | 'total' | 'level' | 'business';
    title: string;
    description: string;
}

const TeamListEnhanced: React.FC<TeamListEnhancedProps> = ({ type, title, description }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<TeamMember[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        level: undefined as number | undefined,
        status: undefined as string | undefined,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
    });
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize, filters, type]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                search: filters.search,
                level: filters.level,
                status: filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate,
            };

            // Call appropriate API endpoint
            switch (type) {
                case 'direct':
                    response = await teamApi.getDirectReferrals(params);
                    break;
                case 'total':
                    response = await teamApi.getTotalDownline(params);
                    break;
                case 'level':
                    response = await teamApi.getTeamLevelDownline(params);
                    break;
                case 'business':
                    response = await teamApi.getDownlineBusiness(params);
                    break;
                default:
                    response = await teamApi.getTotalDownline(params);
            }

            // Enhanced response validation
            if (!response || !response.data) {
                throw new Error('Invalid response from server');
            }

            const responseData = response.data;

            // Check if response indicates success
            if (responseData.success === false) {
                throw new Error(responseData.message || 'Failed to fetch team data');
            }

            // Handle different response formats
            let members: TeamMember[] = [];
            let totalCount = 0;

            // Backend returns data in different formats
            if (type === 'level') {
                // Level downline returns array of levels
                if (Array.isArray(responseData.data)) {
                    // Flatten all members from all levels
                    members = responseData.data.flatMap((level: any) =>
                        Array.isArray(level.members) ? level.members : []
                    );
                    totalCount = members.length;
                }
            } else {
                // Other types return direct array or paginated data
                if (Array.isArray(responseData.data)) {
                    members = responseData.data;
                } else if (responseData.data && Array.isArray(responseData.data.content)) {
                    members = responseData.data.content;
                } else if (responseData.data && Array.isArray(responseData.data.members)) {
                    members = responseData.data.members;
                }

                // Get total count
                if (responseData.pagination) {
                    totalCount = responseData.pagination.total || members.length;
                } else if (responseData.data && responseData.data.total) {
                    totalCount = responseData.data.total;
                } else {
                    totalCount = members.length;
                }
            }

            // Normalize member data structure
            const normalizedMembers = members.map((member: any) => ({
                id: member.id || member.userId,
                userId: member.userId || member.id,
                username: member.username || '',
                email: member.email || '',
                firstName: member.firstName || '',
                lastName: member.lastName || '',
                phoneNumber: member.phoneNumber || '',
                sponsorId: member.sponsorId,
                sponsorName: member.sponsorName || member.sponsor?.name || '',
                level: member.level || 0,
                position: member.position,
                leftLeg: member.leftLeg || 0,
                rightLeg: member.rightLeg || 0,
                personalBv: member.personalBv || 0,
                teamBv: member.teamBv || 0,
                leftBv: member.leftBv || 0,
                rightBv: member.rightBv || 0,
                totalReferrals: member.totalReferrals || member.directReferrals || 0,
                directReferrals: member.directReferrals || 0,
                totalDownline: member.totalDownline || 0,
                rank: member.rank || 'Associate',
                status: member.status || 'ACTIVE',
                joinedDate: member.joinedDate || member.createdAt || member.joiningDate || new Date().toISOString(),
                lastActive: member.lastActive,
            }));

            setData(normalizedMembers);
            setPagination({
                ...pagination,
                total: totalCount,
            });

            // Set stats
            if (responseData.stats) {
                setStats(responseData.stats);
            } else {
                // Calculate stats from data
                setStats({
                    totalCount: totalCount,
                    totalMembers: totalCount,
                    activeCount: normalizedMembers.filter((m: any) => m.status === 'ACTIVE').length,
                    activeMembers: normalizedMembers.filter((m: any) => m.status === 'ACTIVE').length,
                    totalBv: normalizedMembers.reduce((sum: number, m: any) => sum + (m.personalBv || 0), 0),
                    teamBv: normalizedMembers.reduce((sum: number, m: any) => sum + (m.teamBv || 0), 0),
                });
            }

        } catch (error: any) {
            console.error('Error fetching team data:', error);
            const errorMessage = error?.response?.data?.message || error.message || `Failed to fetch ${title.toLowerCase()}`;
            setError(errorMessage);
            message.error(errorMessage);
            setData([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const params = {
                search: filters.search,
                level: filters.level,
                status: filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate,
            };

            const response = type === 'business'
                ? await teamApi.exportDownlineBusiness(params)
                : await teamApi.exportTeam(params);

            // Handle blob response
            const blob = response.data instanceof Blob
                ? response.data
                : new Blob([JSON.stringify(response.data)], { type: 'application/json' });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}-team-${dayjs().format('YYYY-MM-DD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success('Team data exported successfully');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to export team data';
            message.error(errorMessage);
        } finally {
            setExportLoading(false);
        }
    };

    const handleViewDetails = (userId: number) => {
        navigate(`/team/detail/${userId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'green';
            case 'INACTIVE': return 'orange';
            case 'SUSPENDED': return 'red';
            default: return 'default';
        }
    };

    const baseColumns = [
        {
            title: 'Member',
            key: 'member',
            width: 200,
            fixed: 'left' as const,
            render: (_: any, record: TeamMember) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.firstName} {record.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>@{record.username}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.email}</div>
                </div>
            ),
        },
        ...(type !== 'direct' ? [{
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            width: 80,
            render: (level: number) => level > 0 ? <Tag color="blue">L{level}</Tag> : '-',
        }] : []),
        {
            title: 'Sponsor',
            dataIndex: 'sponsorName',
            key: 'sponsor',
            width: 150,
            render: (name: string) => name || '-',
        },
        {
            title: 'Personal BV',
            dataIndex: 'personalBv',
            key: 'personalBv',
            width: 120,
            align: 'right' as const,
            render: (bv: number) => bv?.toLocaleString() || 0,
            sorter: (a: TeamMember, b: TeamMember) => (a.personalBv || 0) - (b.personalBv || 0),
        },
        {
            title: 'Team BV',
            dataIndex: 'teamBv',
            key: 'teamBv',
            width: 120,
            align: 'right' as const,
            render: (bv: number) => bv?.toLocaleString() || 0,
            sorter: (a: TeamMember, b: TeamMember) => (a.teamBv || 0) - (b.teamBv || 0),
        },
        {
            title: 'Referrals',
            dataIndex: 'directReferrals',
            key: 'referrals',
            width: 100,
            align: 'right' as const,
            sorter: (a: TeamMember, b: TeamMember) => (a.directReferrals || 0) - (b.directReferrals || 0),
        },
        {
            title: 'Downline',
            dataIndex: 'totalDownline',
            key: 'downline',
            width: 100,
            align: 'right' as const,
            sorter: (a: TeamMember, b: TeamMember) => (a.totalDownline || 0) - (b.totalDownline || 0),
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 120,
            render: (rank: string) => <Tag color="purple">{rank}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
            filters: [
                { text: 'Active', value: 'ACTIVE' },
                { text: 'Inactive', value: 'INACTIVE' },
                { text: 'Suspended', value: 'SUSPENDED' },
            ],
            onFilter: (value: any, record: TeamMember) => record.status === value,
        },
        {
            title: 'Joined',
            dataIndex: 'joinedDate',
            key: 'joinedDate',
            width: 120,
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
            sorter: (a: TeamMember, b: TeamMember) =>
                dayjs(a.joinedDate).unix() - dayjs(b.joinedDate).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right' as const,
            render: (_: any, record: TeamMember) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="team-list-enhanced" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
                        <TeamOutlined /> {title}
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>{description}</p>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchData} disabled={loading}>
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            loading={exportLoading}
                            disabled={data.length === 0}
                        >
                            Export to Excel
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error Loading Data"
                    description={error}
                    type="error"
                    showIcon
                    icon={<WarningOutlined />}
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" danger onClick={fetchData}>
                            Retry
                        </Button>
                    }
                />
            )}

            {/* Stats Cards */}
            {stats && !error && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Members"
                                value={stats.totalCount || stats.totalMembers || 0}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active Members"
                                value={stats.activeCount || stats.activeMembers || 0}
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total BV"
                                value={stats.totalBv || 0}
                                precision={0}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Team BV"
                                value={stats.teamBv || 0}
                                precision={0}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={6}>
                        <Input
                            placeholder="Search by name, email..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            allowClear
                        />
                    </Col>
                    {type !== 'direct' && (
                        <Col xs={24} md={4}>
                            <Input
                                type="number"
                                placeholder="Level"
                                value={filters.level}
                                onChange={(e) => setFilters({ ...filters, level: e.target.value ? parseInt(e.target.value) : undefined })}
                                allowClear
                            />
                        </Col>
                    )}
                    <Col xs={24} md={4}>
                        <Select
                            placeholder="Status"
                            style={{ width: '100%' }}
                            value={filters.status}
                            onChange={(value) => setFilters({ ...filters, status: value })}
                            allowClear
                        >
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                            <Option value="SUSPENDED">Suspended</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            onChange={(dates) => {
                                if (dates) {
                                    setFilters({
                                        ...filters,
                                        startDate: dates[0]?.format('YYYY-MM-DD'),
                                        endDate: dates[1]?.format('YYYY-MM-DD'),
                                    });
                                } else {
                                    setFilters({
                                        ...filters,
                                        startDate: undefined,
                                        endDate: undefined,
                                    });
                                }
                            }}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={baseColumns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    locale={{
                        emptyText: error ? (
                            <Empty
                                description="Failed to load data. Please try again."
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ) : (
                            <Empty
                                description="No team members found"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )
                    }}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} members`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={(newPagination) => {
                        setPagination({
                            current: newPagination.current || 1,
                            pageSize: newPagination.pageSize || 10,
                            total: pagination.total,
                        });
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>
        </div>
    );
};

export default TeamListEnhanced;
