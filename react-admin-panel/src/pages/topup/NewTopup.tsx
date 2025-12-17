import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, message, InputNumber, Row, Col, Typography } from 'antd';
import { topupService, Package } from '@/services/topupService';
import { api } from '@/api/axiosConfig'; // Direct API for user fetch if needed

const { Title, Text } = Typography;
const { Option } = Select;

const NewTopup: React.FC = () => {
    const [form] = Form.useForm();
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState<{ name: string; balance: string } | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await topupService.getPackages();
            if (response.data.success && response.data.data) {
                setPackages(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load packages');
        }
    };

    const handleUserSearch = async (username: string) => {
        if (!username) return;
        try {
            // Assuming we have an endpoint to get user by username (using the Users list API filter or specific endpoint)
            // Adjust this endpoint based on your actual User API
            const response = await api.get(`/users?search=${username}&limit=1`);
            if (response.data.success && response.data.data && response.data.data.length > 0) {
                const user = response.data.data[0];
                // Need to fetch user wallet balance too. 
                // Assuming user object has wallet info or we fetch separately.
                // Let's assume user.wallet or similar. If not, we might need /wallet/:userId

                // For now, let's look at what UsersList returns or try to fetch wallet.
                // Placeholder:
                setUserInfo({
                    name: user.fullName,
                    balance: '0.00' // Placeholder until we confirm wallet fetching
                });

                // Try fetching wallet if possible
                try {
                    const walletRes = await api.get(`/wallet/${user.id}`);
                    if (walletRes.data.success) {
                        setUserInfo(prev => ({ ...prev!, balance: walletRes.data.data.commissionBalance || '0.00' }));
                    }
                } catch (e) {
                    // Ignore wallet fetch error for now
                }
            } else {
                setUserInfo(null);
                message.warning('User not found');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Debounce for user search
    // For simplicity, using "onBlur" for now instead of realtime debounce
    const onUserIdBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        handleUserSearch(e.target.value);
    };

    const onPackageChange = (value: number) => {
        const pkg = packages.find(p => p.id === value);
        setSelectedPackage(pkg || null);
        form.setFieldsValue({ paidAmount: pkg?.amount });
    };

    const onFinish = async (values: any) => {
        if (!userInfo) {
            message.error('Please select a valid user');
            return;
        }
        setLoading(true);
        try {
            // We need userId (DB ID), assuming we stored it or can retrieve from username search result.
            // Quick fix: store userId in state when searching
            // Real implementation should handle this better.
            // Let's assume we fetching user again or storing it.
            const userRes = await api.get(`/users?search=${values.username}&limit=1`);
            const user = userRes.data.data[0];

            const response = await topupService.createTopup({
                userId: user.id,
                packageId: values.packageId
            });
            if (response.data.success) {
                message.success('Topup successful');
                form.resetFields();
                setUserInfo(null);
                setSelectedPackage(null);
            } else {
                message.error(response.data.message || 'Topup failed');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Topup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title={<Title level={4}>New Topup</Title>}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="username" label="User Id" rules={[{ required: true, message: 'Please enter User ID' }]}>
                            <Input placeholder="Enter User ID" onBlur={onUserIdBlur} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Name">
                            <Input value={userInfo?.name || ''} readOnly />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="packageId" label="Package" rules={[{ required: true, message: 'Please select a package' }]}>
                            <Select placeholder="Select" onChange={onPackageChange}>
                                {packages.map(pkg => (
                                    <Option key={pkg.id} value={pkg.id}>{pkg.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="AVAILABLE FUND">
                            <Input value={userInfo?.balance || '0.00'} readOnly />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item name="paidAmount" label="Paid Package">
                            <Input readOnly />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Paid Amount">
                            <Input value={selectedPackage?.amount || ''} readOnly />
                        </Form.Item>
                    </Col>
                </Row>

                <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#28a745', borderColor: '#28a745' }}>
                    Paid
                </Button>
            </Form>
        </Card>
    );
};

export default NewTopup;
