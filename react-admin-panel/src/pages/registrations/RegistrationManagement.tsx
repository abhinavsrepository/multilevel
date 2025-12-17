import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Input,
    Select,
    Row,
    Col,
    message,
    Tag,
    Statistic,
    Modal,
    Popconfirm,
    DatePicker,
    Form,
    Tooltip,
    Avatar,
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    PlusOutlined,
    DownloadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { registrationApi, Registration, RegistrationFilters } from '@/api/registration.api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const RegistrationManagement: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Registration[]>([]);
    const [total, setTotal] = useState(0);
    const [stats, setStats] = useState<any>(null);
    const [filters, setFilters] = useState<RegistrationFilters>({
        page: 1,
        limit: 10,
        search: '',
        status: undefined,
        kycStatus: undefined,
    });
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Registration | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await registrationApi.getAll(filters);
            if (response.data.success) {
                setData(response.data.data || []);
                setTotal(response.data.pagination?.total || 0);
            }
        } catch (error) {
            message.error('Failed to fetch registrations');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await registrationApi.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const response = await registrationApi.approve(id);
            if (response.data.success) {
                message.success('Registration approved successfully');
                fetchData();
            }
        } catch (error) {
            message.error('Failed to approve registration');
        }
    };

    const handleReject = async (id: number) => {
        try {
            const response = await registrationApi.reject(id);
            if (response.data.success) {
                message.success('Registration rejected successfully');
                fetchData();
            }
        } catch (error) {
            message.error('Failed to reject registration');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await registrationApi.delete(id);
            if (response.data.success) {
                message.success('Registration deleted successfully');
                fetchData();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete registration');
        }
    };

    const handleEdit = (record: Registration) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingRecord) {
                const response = await registrationApi.update(editingRecord.id, values);
                if (response.data.success) {
                    message.success('Registration updated successfully');
                }
            } else {
                const response = await registrationApi.create(values);
                if (response.data.success) {
                    message.success('Registration created successfully');
                }
            }
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleExport = async () => {
        try {
            const response = await registrationApi.export(filters);
            const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data, null, 2)]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `registrations_${Date.now()}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Export completed successfully');
        } catch (error) {
            message.error('Failed to export data');
        }
    };

    const columns: ColumnsType<Registration> = [
        {
            title: 'User',
            key: 'user',
            render: (_, record) => (
                <Space>
                    <Avatar src={record.profilePicture} icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>@{record.username}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email, record) => (
                <div>
                    {email}
                    {record.emailVerified && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                </div>
            ),
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (phone, record) => (
                <div>
                    {phone || 'N/A'}
                    {phone && record.phoneVerified && (
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 4 }} />
                    )}
                </div>
            ),
        },
        {
            title: 'Sponsor',
            key: 'sponsor',
            render: (_, record) => (
                record.sponsor ? (
                    <div>
                        <div>{record.sponsor.name}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>@{record.sponsor.username}</div>
                    </div>
                ) : 'N/A'
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors: any = {
                    ACTIVE: 'green',
                    INACTIVE: 'orange',
                    SUSPENDED: 'red',
                };
                return <Tag color={colors[status]}>{status}</Tag>;
            },
        },
        {
            title: 'KYC Status',
            dataIndex: 'kycStatus',
            key: 'kycStatus',
            render: (kycStatus) => {
                const colors: any = {
                    NOT_SUBMITTED: 'default',
                    PENDING: 'processing',
                    APPROVED: 'success',
                    REJECTED: 'error',
                };
                return <Tag color={colors[kycStatus]}>{kycStatus}</Tag>;
            },
        },
        {
            title: 'Registration Date',
            dataIndex: 'registrationDate',
            key: 'registrationDate',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {record.status !== 'ACTIVE' && (
                        <Tooltip title="Approve">
                            <Button
                                type="link"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleApprove(record.id)}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                    {record.status !== 'SUSPENDED' && (
                        <Tooltip title="Reject">
                            <Button
                                type="link"
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleReject(record.id)}
                                danger
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure to delete this registration?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button type="link" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="registration-management" style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>
                        Registration Management
                    </h1>
                    <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
                        Manage user registrations and approvals
                    </p>
                </Col>
                <Col>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchData}>
                            Refresh
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>
                            Export
                        </Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Registration
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
                                title="Total Registrations"
                                value={stats.total}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active Users"
                                value={stats.active}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Pending KYC"
                                value={stats.pendingKYC}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Verified Email"
                                value={stats.verifiedEmail}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search by name, username, email..."
                            prefix={<SearchOutlined />}
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="Status"
                            value={filters.status}
                            onChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            <Option value="ACTIVE">Active</Option>
                            <Option value="INACTIVE">Inactive</Option>
                            <Option value="SUSPENDED">Suspended</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            placeholder="KYC Status"
                            value={filters.kycStatus}
                            onChange={(value) => setFilters({ ...filters, kycStatus: value, page: 1 })}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            <Option value="NOT_SUBMITTED">Not Submitted</Option>
                            <Option value="PENDING">Pending</Option>
                            <Option value="APPROVED">Approved</Option>
                            <Option value="REJECTED">Rejected</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <RangePicker
                            style={{ width: '100%' }}
                            onChange={(dates) => {
                                setFilters({
                                    ...filters,
                                    startDate: dates?.[0]?.format('YYYY-MM-DD'),
                                    endDate: dates?.[1]?.format('YYYY-MM-DD'),
                                    page: 1
                                });
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
                        current: filters.page,
                        pageSize: filters.limit,
                        total: total,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} registrations`,
                        onChange: (page, pageSize) => setFilters({ ...filters, page, limit: pageSize }),
                    }}
                />
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingRecord ? 'Edit Registration' : 'Add Registration'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={() => setModalVisible(false)}
                width={800}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Username"
                                rules={[{ required: true, message: 'Please enter username' }]}
                            >
                                <Input placeholder="Enter username" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input placeholder="Enter email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="Enter first name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Enter last name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    {!editingRecord && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[{ required: true, message: 'Please enter password' }]}
                                >
                                    <Input.Password placeholder="Enter password" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Phone Number"
                                >
                                    <Input placeholder="Enter phone number" />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default RegistrationManagement;
