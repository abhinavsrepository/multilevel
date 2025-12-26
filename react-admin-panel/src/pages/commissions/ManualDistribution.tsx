import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Button,
    message,
    Typography,
    Alert,
    Table,
    Tag,
    Divider,
    Space
} from 'antd';
import { SendOutlined, CalculatorOutlined } from '@ant-design/icons';
import { api } from '../../api/axiosConfig';

const { Title, Paragraph } = Typography;

const ManualDistribution: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<any[] | null>(null);

    const handleCalculate = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await api.post('/admin/commissions/calculate-level-income', values);

            if (response.data.success) {
                setPreviewData(response.data.data.plan);
                message.success('Calculation successful. Please review the distribution plan.');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to calculate');
            setPreviewData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDistribute = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const response = await api.post('/admin/commissions/distribute-level-income', values);

            if (response.data.success) {
                message.success(response.data.message);
                form.resetFields();
                setPreviewData(null);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to distribute');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            width: 80,
        },
        {
            title: 'Beneficiary',
            key: 'user',
            render: (_: any, record: any) => (
                <div>
                    <strong>{record.username}</strong>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.fullName}</div>
                </div>
            )
        },
        {
            title: 'Qualification',
            key: 'qualification',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontSize: '12px' }}>Directs: {record.directCount}</div>
                    <div>
                        {record.willReceive ? (
                            <Tag color="success">Eligible</Tag>
                        ) : (
                            <Tag color="error">{record.reason}</Tag>
                        )}
                    </div>
                </Space>
            )
        },
        {
            title: 'Percent',
            dataIndex: 'levelPercentage',
            key: 'percentage',
            render: (val: number) => `${val}%`
        },
        {
            title: 'Amount',
            dataIndex: 'potentialAmount',
            key: 'amount',
            render: (val: number, record: any) => (
                <span style={{
                    fontWeight: 'bold',
                    color: record.willReceive ? '#52c41a' : '#ccc',
                    textDecoration: record.willReceive ? 'none' : 'line-through'
                }}>
                    ₹{val.toLocaleString()}
                </span>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
            <Title level={2}>Manual Level Income Distribution</Title>
            <Paragraph>
                Manually trigger Team Sales Bonus (TSB) distribution for a specific sale.
                This will traverse 10 levels up from the Seller and distribute the income based on the TSB table.
            </Paragraph>

            <Card>
                <Alert
                    message="Process"
                    description="1. Enter Sale Details -> 2. Calculate Preview -> 3. Verify Levels -> 4. Distribute"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ amount: 200000 }} // Default example
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item
                            name="username"
                            label="Seller Username (Self Code)"
                            rules={[{ required: true, message: 'Please enter seller username' }]}
                            help="The user who made the sale."
                        >
                            <Input placeholder="e.g. USER123" />
                        </Form.Item>

                        <Form.Item
                            name="amount"
                            label="Fixed Sale Amount (₹)"
                            rules={[{ required: true, message: 'Please enter sale amount' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value ? value.replace(/\₹\s?|(,*)/g, '') as unknown as 1 : 1}
                                min={1}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item>
                        <Space>
                            <Button
                                icon={<CalculatorOutlined />}
                                onClick={handleCalculate}
                                loading={loading}
                                size="large"
                            >
                                Calculate / Preview
                            </Button>

                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleDistribute}
                                loading={loading}
                                disabled={!previewData}
                                danger
                                size="large"
                            >
                                Confirm & Distribute
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>

                {previewData && (
                    <>
                        <Divider>Distribution Preview</Divider>
                        <Table
                            dataSource={previewData}
                            columns={columns}
                            rowKey="level"
                            pagination={false}
                            size="small"
                            bordered
                            summary={(pageData) => {
                                let totalAmount = 0;
                                pageData.forEach(({ potentialAmount, willReceive }) => {
                                    if (willReceive) totalAmount += potentialAmount;
                                });
                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4} align="right">
                                            <strong>Total Payout:</strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}>
                                            <strong>₹{totalAmount.toLocaleString()}</strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default ManualDistribution;
