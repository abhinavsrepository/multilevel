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
    Tooltip,
    Modal,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    DownloadOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { incomeApi, Income } from '@/api/income.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const DirectBonus: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [data, setData] = useState<Income[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filters, setFilters] = useState({
        search: '',
        status: undefined as string | undefined,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        paid: 0,
    });

    useEffect(() => {
        fetchIncomes();
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchIncomes = async () => {
        try {
            setLoading(true);
            const response = await incomeApi.getByType('DIRECT', {
                page: pagination.current,
                limit: pagination.pageSize,
                search: filters.search,
                status: filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });

            if (response.data.success) {
                const responseData = response.data.data || {};
                const incomesData = Array.isArray(responseData.data) ? responseData.data : [];
                setData(incomesData);
                setPagination({
                    ...pagination,
                    total: responseData.pagination?.total || 0,
                });

                // Calculate stats
                const stats = responseData.stats || {};
                const total = stats.totalAmount || 0;
                const pending = stats.pendingAmount || 0;
                const approved = stats.approvedAmount || 0;
                const paid = stats.paidAmount || 0;
                setStats({ total, pending, approved, paid });
            } else {
                setData([]);
            }
        } catch (error) {
            message.error('Failed to fetch direct bonus records');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            await incomeApi.approve(id);
            message.success('Direct bonus approved successfully');
            fetchIncomes();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to approve direct bonus');
        }
    };

    const handleReject = async (id: number) => {
        Modal.confirm({
            title: 'Reject Direct Bonus',
            content: 'Are you sure you want to reject this direct bonus?',
            onOk: async () => {
                try {
                    await incomeApi.reject(id, 'Rejected by admin');
                    message.success('Direct bonus rejected successfully');
                    fetchIncomes();
                } catch (error: any) {
                    message.error(error?.response?.data?.message || 'Failed to reject direct bonus');
                }
            },
        });
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const response = await incomeApi.exportToExcel({
                incomeType: 'DIRECT',
                search: filters.search,
                status: filters.status,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `direct-bonus-${dayjs().format('YYYY-MM-DD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success('Direct bonus exported successfully');
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to export direct bonus');
        } finally {
            setExportLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'orange';
            case 'APPROVED': return 'blue';
            case 'PAID': return 'green';
            case 'REJECTED': return 'red';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'User',
            key: 'user',
            width: 200,
            render: (_: any, record: Income) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.User?.firstName} {record.User?.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>@{record.User?.username}</div>
                </div>
            ),
        },
        {
            title: 'From User',
            key: 'fromUser',
            width: 200,
            render: (_: any, record: Income) =>
                record.FromUser ? (
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.FromUser.firstName} {record.FromUser.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                            @{record.FromUser.username}
                        </div>
                    </div>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount: number) => (
                <strong style={{ color: '#1890ff' }}>₹{amount?.toLocaleString()}</strong>
            ),
        },
        {
            title: 'Percentage',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 100,
            render: (percentage: number) => (percentage ? `${percentage}%` : '-'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right' as const,
            width: 150,
            render: (_: any, record: Income) => (
                <Space size="small">
                    {record.status === 'PENDING' && (
                        <>
                            <Tooltip title="Approve">
                                <Button
                                    type="primary"
                                    icon={<CheckCircleOutlined />}
                                    size="small"
                                    onClick={() => handleApprove(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Reject">
                                <Button
                                    type="primary"
                                    danger
                                    icon={<CloseCircleOutlined />}
                                    size="small"
                                    onClick={() => handleReject(record.id)}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="direct-bonus" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Direct Bonus</h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
                        Manage direct referral bonus payments
                    </p>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchIncomes}>
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
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Amount"
                            value={stats.total}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<DollarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            precision={2}
                            valueStyle={{ color: '#faad14' }}
                            prefix="₹"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Approved"
                            value={stats.approved}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                            prefix="₹"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Paid"
                            value={stats.paid}
                            precision={2}
                            valueStyle={{ color: '#52c41a' }}
                            prefix="₹"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={6}>
                        <Input
                            placeholder="Search by user, email..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Filter by status"
                            style={{ width: '100%' }}
                            value={filters.status}
                            onChange={(value) => setFilters({ ...filters, status: value })}
                            allowClear
                        >
                            <Option value="PENDING">Pending</Option>
                            <Option value="APPROVED">Approved</Option>
                            <Option value="PAID">Paid</Option>
                            <Option value="REJECTED">Rejected</Option>
                        </Select>
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
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} records`,
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

export default DirectBonus;
