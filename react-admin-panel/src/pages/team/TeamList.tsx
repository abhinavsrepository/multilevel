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
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { teamApi, TeamMember } from '@/api/team.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface TeamListProps {
    type: 'direct' | 'total' | 'level' | 'business';
    title: string;
    description: string;
}

const TeamList: React.FC<TeamListProps> = ({ type, title, description }) => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<TeamMember[]>([]);
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

            if (response.data.success) {
                const members = Array.isArray(response.data.data) ? response.data.data : [];
                setData(members);
                setPagination({
                    ...pagination,
                    total: response.data.pagination?.total || 0,
                });
                setStats(response.data.stats);
            } else {
                setData([]);
            }
        } catch (error) {
            message.error(`Failed to fetch ${title.toLowerCase()}`);
            setData([]);
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

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}-team-${dayjs().format('YYYY-MM-DD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success('Team data exported successfully');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to export team data');
        } finally {
            setExportLoading(false);
        }
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
            render: (level: number) => <Tag color="blue">L{level}</Tag>,
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
            render: (bv: number) => bv?.toLocaleString() || 0,
        },
        {
            title: 'Team BV',
            dataIndex: 'teamBv',
            key: 'teamBv',
            width: 120,
            render: (bv: number) => bv?.toLocaleString() || 0,
        },
        {
            title: 'Referrals',
            dataIndex: 'directReferrals',
            key: 'referrals',
            width: 100,
        },
        {
            title: 'Downline',
            dataIndex: 'totalDownline',
            key: 'downline',
            width: 100,
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
        },
        {
            title: 'Joined',
            dataIndex: 'joinedDate',
            key: 'joinedDate',
            width: 120,
            render: (date: string) => dayjs(date).format('DD MMM YYYY'),
        },
    ];

    return (
        <div className="team-list" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
                        <TeamOutlined /> {title}
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>{description}</p>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            loading={exportLoading}
                        >
                            Export to Excel
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Stats Cards */}
            {stats && (
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
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} members`,
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

export default TeamList;
