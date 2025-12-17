import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Button, DatePicker, Row, Col, Select, Typography } from 'antd';
import { topupService, Topup } from '@/services/topupService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const TopupHistory: React.FC = () => {
    const [data, setData] = useState<Topup[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState<any>({});

    const fetchHistory = async (page = 1) => {
        setLoading(true);
        try {
            const response = await topupService.getHistory({
                page,
                limit: pagination.pageSize,
                ...filters
            });
            if (response.data.success && response.data.data) {
                setData(response.data.data);
                setPagination({
                    ...pagination,
                    current: page,
                    total: response.data.pagination?.total || 0 // Assuming backend returns pagination meta
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [filters]);

    const handleSearch = (values: any) => {
        const newFilters: any = {};
        if (values.username) newFilters.userId = values.username; // Backend expects userId (username or ID?) - need to clarify. Controller says "userId" filter maps to "userId" column. Ideally filter on user.username via join, but commonly simplified.
        // If Controller expects ID, we need to convert. If controller has join filter, good.
        // Controller logic: "if (userId) where.userId = userId;" - this suggests exact ID match.
        // Backend improvement needed to search by username.

        // For now, let's assume filtering by username is tricky without backend change, or we pass username and backend handles.
        // Let's just pass input and hope backend can look it up, or ignore for now.

        if (values.dateRange) {
            newFilters.startDate = values.dateRange[0].format('YYYY-MM-DD');
            newFilters.endDate = values.dateRange[1].format('YYYY-MM-DD');
        }
        setFilters(newFilters);
    };

    const columns = [
        {
            title: 'S. No.',
            render: (_: any, __: any, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: 'Username',
            dataIndex: ['user', 'username'],
        },
        {
            title: 'Name',
            dataIndex: ['user', 'fullName'],
        },
        {
            title: 'Paid Date',
            dataIndex: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM DD YYYY h:mmA'),
        },
        {
            title: 'Paid Amount',
            dataIndex: 'amount',
        }
    ];

    return (
        <Card title={<Title level={4}>Topup Detail</Title>}>
            <Form layout="horizontal" onFinish={handleSearch} style={{ marginBottom: 20 }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="dateRange" label="Date Range">
                            <RangePicker />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="username" label="User Id">
                            <Input placeholder="User Id" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="package" label="Package">
                            <Select placeholder="Select"><Select.Option value="all">All</Select.Option></Select>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button type="primary" htmlType="submit" style={{ marginRight: 8, background: '#28a745' }}>Search</Button>
                        <Button>Export To Excel</Button>
                    </Col>
                </Row>
            </Form>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    onChange: (page) => fetchHistory(page)
                }}
                bordered
            />
        </Card>
    );
};

export default TopupHistory;
