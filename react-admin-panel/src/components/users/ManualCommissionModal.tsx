import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Button } from 'antd';
import { userApi } from '../../api/userApi';
import { propertyApi } from '../../api/propertyApi';

const { Option } = Select;
const { TextArea } = Input;

interface Props {
    visible: boolean;
    onCancel: () => void;
    userId: number;
    onSuccess: () => void;
}

const ManualCommissionModal: React.FC<Props> = ({ visible, onCancel, userId, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        if (visible) {
            fetchProperties();
        }
    }, [visible]);

    const fetchProperties = async () => {
        try {
            const res = await propertyApi.getProperties({ page: 1, size: 100 });
            if (res.data.success) {
                setProperties(res.data.data.content);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            await userApi.addManualCommission({
                userId,
                ...values
            });
            message.success('Commission added successfully');
            form.resetFields();
            onSuccess();
            onCancel();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to add commission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Manual Commission Distribution"
            open={visible}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    type: 'MANUAL_ADJUSTMENT'
                }}
            >
                <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[{ required: true, message: 'Please enter amount' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="0.00"
                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    />
                </Form.Item>

                <Form.Item
                    name="propertyId"
                    label="Related Project / Property (Optional)"
                >
                    <Select placeholder="Select a property" allowClear>
                        {properties.map(p => (
                            <Option key={p.id} value={p.propertyId}>{p.title} ({p.location})</Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="type"
                    label="Type"
                >
                    <Select>
                        <Option value="MANUAL_ADJUSTMENT">Manual Adjustment</Option>
                        <Option value="BONUS">Special Bonus</Option>
                        <Option value="INCENTIVE">Project Incentive</Option>
                        <Option value="COMPENSATION">Compensation</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Remarks / Description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea rows={4} placeholder="Reason for this distribution..." />
                </Form.Item>

                <Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={onCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Distribute
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ManualCommissionModal;
