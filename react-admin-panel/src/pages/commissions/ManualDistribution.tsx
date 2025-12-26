import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Button,
    Select,
    message,
    Typography,
    Alert
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { api } from '../../api/axiosConfig';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ManualDistribution: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            const response = await api.post('/commissions/admin/distribute', values);

            if (response.data.success) {
                message.success('Commission distribution triggered successfully');
                form.resetFields();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to trigger distribution');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
            <Title level={2}>Manual Commission Distribution</Title>
            <Paragraph>
                Manually trigger commission distribution for offline or ad-hoc property sales.
                This will calculate Direct Bonus and TSB level-wise.
            </Paragraph>

            <Card>
                <Alert
                    message="Important"
                    description="This action will instantly credit wallets and create Income records. Ensure the User ID and Amount are correct."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 24 }}
                />

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        label="User Username (Beneficiary / Investor)"
                        rules={[{ required: true, message: 'Please enter username' }]}
                        help="The user who made the investment/purchase."
                    >
                        <Input placeholder="e.g. USER123" />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Sale Amount (₹)"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value ? value.replace(/\₹\s?|(,*)/g, '') as unknown as 1 : 1}
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="remarks"
                        label="Remarks"
                        rules={[{ required: true, message: 'Please enter remarks' }]}
                    >
                        <Input.TextArea rows={3} placeholder="e.g. Offline Payment for Plot 45" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} block size="large">
                            Distribute Commission
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ManualDistribution;
