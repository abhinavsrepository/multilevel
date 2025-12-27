import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Switch,
    Button,
    Row,
    Col,
    Divider,
    message,
    Space,
    Typography,
    Spin,
    Collapse
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
    createBonanza,
    updateBonanza,
    getBonanzaById,
    Bonanza
} from '../../api/bonanza.api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;

const BonanzaForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [rewardType, setRewardType] = useState<string>('FIXED');
    const [periodType, setPeriodType] = useState<string>('FIXED_DATES');

    useEffect(() => {
        if (id) {
            fetchBonanza();
        }
    }, [id]);

    const fetchBonanza = async () => {
        try {
            setLoading(true);
            const response = await getBonanzaById(Number(id));
            if (response.success) {
                const bonanza = response.data;
                form.setFieldsValue({
                    name: bonanza.name,
                    description: bonanza.description,
                    dateRange: [dayjs(bonanza.startDate), dayjs(bonanza.endDate)],
                    rewardType: bonanza.rewardType,
                    rewardAmount: bonanza.rewardAmount,
                    rewardDescription: bonanza.rewardDescription,
                    totalPoolAmount: bonanza.totalPoolAmount,
                    maxQualifiers: bonanza.maxQualifiers,
                    periodType: bonanza.periodType,
                    periodDays: bonanza.periodDays,
                    isVisible: bonanza.isVisible,
                    priority: bonanza.priority,
                    notes: bonanza.notes,
                    // Criteria
                    'criteria.salesVolume': bonanza.qualificationCriteria?.salesVolume,
                    'criteria.directReferrals': bonanza.qualificationCriteria?.directReferrals,
                    'criteria.teamVolume': bonanza.qualificationCriteria?.teamVolume,
                    'criteria.plotBookings': bonanza.qualificationCriteria?.plotBookings,
                    'criteria.minRank': bonanza.qualificationCriteria?.minRank,
                    'criteria.minClub': bonanza.qualificationCriteria?.minClub,
                    'criteria.groupRatio.leg1': bonanza.qualificationCriteria?.groupRatio?.leg1,
                    'criteria.groupRatio.leg2': bonanza.qualificationCriteria?.groupRatio?.leg2,
                    'criteria.groupRatio.leg3': bonanza.qualificationCriteria?.groupRatio?.leg3,
                });
                setRewardType(bonanza.rewardType);
                setPeriodType(bonanza.periodType || 'FIXED_DATES');
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch bonanza');
            navigate('/bonanza');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);

            // Build qualification criteria object
            const qualificationCriteria: any = {};

            if (values['criteria.salesVolume']) {
                qualificationCriteria.salesVolume = values['criteria.salesVolume'];
            }
            if (values['criteria.directReferrals']) {
                qualificationCriteria.directReferrals = values['criteria.directReferrals'];
            }
            if (values['criteria.teamVolume']) {
                qualificationCriteria.teamVolume = values['criteria.teamVolume'];
            }
            if (values['criteria.plotBookings']) {
                qualificationCriteria.plotBookings = values['criteria.plotBookings'];
            }
            if (values['criteria.minRank']) {
                qualificationCriteria.minRank = values['criteria.minRank'];
            }
            if (values['criteria.minClub']) {
                qualificationCriteria.minClub = values['criteria.minClub'];
            }
            if (values['criteria.groupRatio.leg1'] || values['criteria.groupRatio.leg2'] || values['criteria.groupRatio.leg3']) {
                qualificationCriteria.groupRatio = {
                    leg1: values['criteria.groupRatio.leg1'] || 40,
                    leg2: values['criteria.groupRatio.leg2'] || 40,
                    leg3: values['criteria.groupRatio.leg3'] || 20
                };
            }

            const bonanzaData: Bonanza = {
                name: values.name,
                description: values.description,
                startDate: values.dateRange[0].format('YYYY-MM-DD'),
                endDate: values.dateRange[1].format('YYYY-MM-DD'),
                qualificationCriteria: qualificationCriteria,
                rewardType: values.rewardType,
                rewardAmount: values.rewardAmount,
                rewardDescription: values.rewardDescription,
                totalPoolAmount: values.totalPoolAmount,
                maxQualifiers: values.maxQualifiers,
                periodType: values.periodType || 'FIXED_DATES',
                periodDays: values.periodDays,
                isVisible: values.isVisible !== false,
                priority: values.priority || 0,
                notes: values.notes
            };

            if (id) {
                const response = await updateBonanza(Number(id), bonanzaData);
                if (response.success) {
                    message.success('Bonanza updated successfully');
                    navigate('/bonanza');
                }
            } else {
                const response = await createBonanza(bonanzaData);
                if (response.success) {
                    message.success('Bonanza created successfully');
                    navigate('/bonanza');
                }
            }
        } catch (error: any) {
            message.error(error.message || 'Failed to save bonanza');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/bonanza')}
                        style={{ marginBottom: 16 }}
                    >
                        Back to List
                    </Button>
                    <Title level={3}>{id ? 'Edit Bonanza' : 'Create New Bonanza'}</Title>
                    <Text type="secondary">
                        Configure your bonanza campaign with flexible qualification criteria
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        rewardType: 'FIXED',
                        periodType: 'FIXED_DATES',
                        isVisible: true,
                        priority: 0
                    }}
                >
                    {/* Basic Information */}
                    <Collapse defaultActiveKey={['basic', 'criteria', 'reward']} ghost>
                        <Panel header={<Title level={5}>Basic Information</Title>} key="basic">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="name"
                                        label="Bonanza Name"
                                        rules={[{ required: true, message: 'Please enter bonanza name' }]}
                                    >
                                        <Input placeholder="e.g., Q4 Mega Plot Push 2025" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="dateRange"
                                        label="Campaign Duration"
                                        rules={[{ required: true, message: 'Please select duration' }]}
                                    >
                                        <RangePicker style={{ width: '100%' }} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Description"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Describe the bonanza campaign and its benefits..."
                                />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="periodType"
                                        label="Period Type"
                                        tooltip="How the qualification period is calculated"
                                    >
                                        <Select onChange={(value) => setPeriodType(value)}>
                                            <Option value="FIXED_DATES">Fixed Dates</Option>
                                            <Option value="FROM_JOIN_DATE">From User Join Date</Option>
                                            <Option value="QUARTERLY">Quarterly</Option>
                                            <Option value="MONTHLY">Monthly</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                {periodType === 'FROM_JOIN_DATE' && (
                                    <Col span={8}>
                                        <Form.Item
                                            name="periodDays"
                                            label="Days from Join"
                                            tooltip="Number of days from user join date"
                                        >
                                            <InputNumber
                                                min={1}
                                                max={365}
                                                style={{ width: '100%' }}
                                                placeholder="e.g., 60"
                                            />
                                        </Form.Item>
                                    </Col>
                                )}
                                <Col span={8}>
                                    <Form.Item
                                        name="priority"
                                        label="Display Priority"
                                        tooltip="Higher numbers appear first"
                                    >
                                        <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="maxQualifiers"
                                        label="Maximum Qualifiers"
                                        tooltip="Leave empty for unlimited"
                                    >
                                        <InputNumber
                                            min={1}
                                            style={{ width: '100%' }}
                                            placeholder="Leave empty for unlimited"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="isVisible"
                                        label="Visible to Users"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>

                        {/* Qualification Criteria */}
                        <Panel header={<Title level={5}>Qualification Criteria</Title>} key="criteria">
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                Define the requirements users must meet to qualify for this bonanza.
                                Leave criteria empty if not applicable.
                            </Text>

                            <Divider orientation="left">Business Requirements</Divider>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name={['criteria', 'salesVolume']}
                                        label="Personal Sales Volume"
                                        tooltip="Minimum personal investment amount required"
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                                            placeholder="e.g., 500000"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={['criteria', 'teamVolume']}
                                        label="Team Business Volume"
                                        tooltip="Minimum total team business volume"
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                                            placeholder="e.g., 2000000"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={['criteria', 'plotBookings']}
                                        label="Plot Bookings"
                                        tooltip="Minimum number of plot bookings required"
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="e.g., 5"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Recruitment Requirements</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['criteria', 'directReferrals']}
                                        label="New Direct Referrals"
                                        tooltip="Minimum number of new direct referrals during campaign"
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="e.g., 5"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Group Business Ratio (40:40:20)</Divider>
                            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                                Define the required business distribution across top 3 legs
                            </Text>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name={['criteria', 'groupRatio', 'leg1']}
                                        label="Leg 1 Percentage"
                                    >
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            style={{ width: '100%' }}
                                            placeholder="40"
                                            suffix="%"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={['criteria', 'groupRatio', 'leg2']}
                                        label="Leg 2 Percentage"
                                    >
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            style={{ width: '100%' }}
                                            placeholder="40"
                                            suffix="%"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name={['criteria', 'groupRatio', 'leg3']}
                                        label="Leg 3 Percentage"
                                    >
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            style={{ width: '100%' }}
                                            placeholder="20"
                                            suffix="%"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider orientation="left">Rank & Club Requirements</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name={['criteria', 'minRank']}
                                        label="Minimum Rank"
                                    >
                                        <Select placeholder="Select minimum rank" allowClear>
                                            <Option value="Associate">Associate</Option>
                                            <Option value="Team Leader">Team Leader</Option>
                                            <Option value="Regional Head">Regional Head</Option>
                                            <Option value="Zonal Head">Zonal Head</Option>
                                            <Option value="General Manager">General Manager</Option>
                                            <Option value="VP">VP</Option>
                                            <Option value="President">President</Option>
                                            <Option value="EG Brand Ambassador">EG Brand Ambassador</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name={['criteria', 'minClub']}
                                        label="Minimum Club"
                                    >
                                        <Select placeholder="Select minimum club" allowClear>
                                            <Option value="Rising Stars Club">Rising Stars Club</Option>
                                            <Option value="Business Leaders Club">Business Leaders Club</Option>
                                            <Option value="Millionaire CLUB">Millionaire CLUB</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Panel>

                        {/* Reward Configuration */}
                        <Panel header={<Title level={5}>Reward Configuration</Title>} key="reward">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="rewardType"
                                        label="Reward Type"
                                        rules={[{ required: true }]}
                                    >
                                        <Select onChange={(value) => setRewardType(value)}>
                                            <Option value="FIXED">Fixed Amount</Option>
                                            <Option value="PERCENTAGE">Percentage of Sales</Option>
                                            <Option value="POOL_SHARE">Pool Share</Option>
                                            <Option value="ITEM">Physical Item/Prize</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                {(rewardType === 'FIXED' || rewardType === 'PERCENTAGE') && (
                                    <Col span={12}>
                                        <Form.Item
                                            name="rewardAmount"
                                            label={rewardType === 'FIXED' ? 'Reward Amount' : 'Percentage'}
                                            rules={[{ required: true, message: 'Please enter reward amount' }]}
                                        >
                                            <InputNumber
                                                min={0}
                                                style={{ width: '100%' }}
                                                formatter={value => rewardType === 'FIXED'
                                                    ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    : `${value}%`
                                                }
                                                parser={value => value!.replace(/₹\s?|(,*)%/g, '')}
                                                placeholder={rewardType === 'FIXED' ? 'e.g., 50000' : 'e.g., 10'}
                                            />
                                        </Form.Item>
                                    </Col>
                                )}
                            </Row>

                            {rewardType === 'POOL_SHARE' && (
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="totalPoolAmount"
                                            label="Total Pool Amount"
                                            rules={[{ required: true, message: 'Please enter pool amount' }]}
                                        >
                                            <InputNumber
                                                min={0}
                                                style={{ width: '100%' }}
                                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value!.replace(/₹\s?|(,*)/g, '')}
                                                placeholder="e.g., 5000000"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            )}

                            <Form.Item
                                name="rewardDescription"
                                label="Reward Description"
                                rules={[{ required: true, message: 'Please enter reward description' }]}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="e.g., ₹50,000 Cash Prize or iPhone 15 Pro + Luxury Trip to Dubai"
                                />
                            </Form.Item>
                        </Panel>

                        {/* Admin Notes */}
                        <Panel header={<Title level={5}>Admin Notes (Internal)</Title>} key="notes">
                            <Form.Item
                                name="notes"
                                label="Internal Notes"
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Add internal notes, special conditions, or reminders..."
                                />
                            </Form.Item>
                        </Panel>
                    </Collapse>

                    <Divider />

                    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                size="large"
                                loading={submitting}
                            >
                                {id ? 'Update Bonanza' : 'Create Bonanza'}
                            </Button>
                            <Button size="large" onClick={() => navigate('/bonanza')}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default BonanzaForm;
