import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Input,
    DatePicker,
    Row,
    Col,
    message,
    Statistic,
    Tag,
} from 'antd';
import {
    DownloadOutlined,
    SearchOutlined,
    ReloadOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { incomeApi, IncomeSummary as IncomeSummaryType, IncomeStats } from '@/api/income.api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const IncomeSummary: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<IncomeSummaryType[]>([]);
    const [stats, setStats] = useState<IncomeStats | null>(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
    });

    useEffect(() => {
        fetchSummary();
        fetchStats();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await incomeApi.getSummary({
                page: pagination.current,
                limit: pagination.pageSize,
                search: filters.search,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });

            if (response.data.success) {
                const summaryData = Array.isArray(response.data.data) ? response.data.data : [];
                setData(summaryData);
                setPagination({
                    ...pagination,
                    total: response.data.pagination?.total || 0,
                });
            } else {
                setData([]);
            }
        } catch (error) {
            message.error('Failed to fetch income summary');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await incomeApi.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const response = await incomeApi.exportSummary({
                search: filters.search,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `income-summary-${dayjs().format('YYYY-MM-DD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success('Income summary exported successfully');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to export income summary');
        } finally {
            setExportLoading(false);
        }
    };

    const columns = [
        {
            title: 'User',
            key: 'user',
            width: 200,
            render: (_: any, record: IncomeSummaryType) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.firstName} {record.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>@{record.username}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.email}</div>
                </div>
            ),
        },
        {
            title: 'Direct Bonus',
            dataIndex: 'directBonus',
            key: 'directBonus',
            width: 120,
            render: (amount: number) => `₹${amount?.toLocaleString() || 0}`,
        },
        {
            title: 'Level Bonus',
            dataIndex: 'levelBonus',
            key: 'levelBonus',
            width: 120,
            render: (amount: number) => `₹${amount?.toLocaleString() || 0}`,
        },
        {
            title: 'Matching Bonus',
            dataIndex: 'matchingBonus',
            key: 'matchingBonus',
            width: 140,
            render: (amount: number) => `₹${amount?.toLocaleString() || 0}`,
        },
        {
            title: 'ROI Bonus',
            dataIndex: 'roiBonus',
            key: 'roiBonus',
            width: 120,
            render: (amount: number) => `₹${amount?.toLocaleString() || 0}`,
        },
        {
            title: 'Reward Bonus',
            dataIndex: 'rewardBonus',
            key: 'rewardBonus',
            width: 120,
            render: (amount: number) => `₹${amount?.toLocaleString() || 0}`,
        },
        {
            title: 'Total Income',
            dataIndex: 'totalIncome',
            key: 'totalIncome',
            width: 140,
            render: (amount: number) => (
                <strong style={{ color: '#1890ff' }}>₹{amount?.toLocaleString() || 0}</strong>
            ),
        },
        {
            title: 'Paid',
            dataIndex: 'paidAmount',
            key: 'paidAmount',
            width: 120,
            render: (amount: number) => (
                <Tag color="green">₹{amount?.toLocaleString() || 0}</Tag>
            ),
        },
        {
            title: 'Pending',
            dataIndex: 'pendingAmount',
            key: 'pendingAmount',
            width: 120,
            render: (amount: number) => (
                <Tag color="orange">₹{amount?.toLocaleString() || 0}</Tag>
            ),
        },
    ];

    return (
        <div className="income-summary" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Income Summary</h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
                        Comprehensive income overview for all users
                    </p>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchSummary}>
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
                                title="Total Income"
                                value={stats.totalIncome}
                                precision={2}
                                valueStyle={{ color: '#1890ff' }}
                                prefix="₹"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Direct Bonus"
                                value={stats.directBonus}
                                precision={2}
                                prefix="₹"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Level Bonus"
                                value={stats.levelBonus}
                                precision={2}
                                prefix="₹"
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Paid Amount"
                                value={stats.paidAmount}
                                precision={2}
                                valueStyle={{ color: '#52c41a' }}
                                prefix="₹"
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Input
                            placeholder="Search by username, email, name..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={8}>
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
                    columns={columns}
                    dataSource={data}
                    rowKey="userId"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} users`,
                    }}
                    onChange={(newPagination) => {
                        setPagination({
                            current: newPagination.current || 1,
                            pageSize: newPagination.pageSize || 10,
                            total: pagination.total,
                        });
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
};

export default IncomeSummary;
