import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Table,
  Switch,
  Select,
  Space,
  Divider,
  Row,
  Col,
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  settingsApi,
  SystemSetting,
  LevelCommissionRule,
  UpdateSettingRequest,
} from '@/api/settings.api';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const PlanSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState<{ [key: string]: SystemSetting[] }>({});
  const [levelRules, setLevelRules] = useState<LevelCommissionRule[]>([]);
  const [form] = Form.useForm();
  const [levelForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
    fetchLevelRules();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getSystemSettings();
      setSettings(response.data);
      // Populate form with existing values
      const formValues: any = {};
      Object.values(response.data)
        .flat()
        .forEach((setting) => {
          formValues[setting.settingKey] = parseSettingValue(setting);
        });
      form.setFieldsValue(formValues);
    } catch (error) {
      message.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelRules = async () => {
    try {
      const response = await settingsApi.getLevelRules();
      setLevelRules(response.data);
    } catch (error) {
      message.error('Failed to fetch level rules');
    }
  };

  const parseSettingValue = (setting: SystemSetting) => {
    if (!setting.settingValue) return null;
    switch (setting.settingType) {
      case 'NUMBER':
        return parseFloat(setting.settingValue);
      case 'BOOLEAN':
        return setting.settingValue === 'true';
      case 'JSON':
      case 'ARRAY':
        try {
          return JSON.parse(setting.settingValue);
        } catch {
          return setting.settingValue;
        }
      default:
        return setting.settingValue;
    }
  };

  const handleSaveSettings = async (values: any) => {
    try {
      setSaveLoading(true);
      const updates: UpdateSettingRequest[] = [];

      // Map form values to settings updates
      Object.entries(values).forEach(([key, value]) => {
        const setting = Object.values(settings)
          .flat()
          .find((s) => s.settingKey === key);
        if (setting) {
          let settingValue = value;
          if (setting.settingType === 'JSON' || setting.settingType === 'ARRAY') {
            settingValue = JSON.stringify(value);
          } else if (setting.settingType === 'BOOLEAN') {
            settingValue = value ? 'true' : 'false';
          } else {
            settingValue = String(value);
          }
          updates.push({
            settingKey: key,
            settingValue,
            settingType: setting.settingType,
            category: setting.category,
          });
        }
      });

      await settingsApi.bulkUpdateSettings(updates);
      message.success('Settings updated successfully');
      fetchSettings();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveLevelRules = async () => {
    try {
      setSaveLoading(true);
      const updatedRules = levelRules.map((rule) => ({
        level: rule.level,
        commissionType: rule.commissionType,
        commissionValue: rule.commissionValue,
        minTeamMembers: rule.minTeamMembers,
        minActiveMembers: rule.minActiveMembers,
        isActive: rule.isActive,
        description: rule.description || undefined,
      }));

      await settingsApi.bulkUpdateLevelRules(updatedRules);
      message.success('Level rules updated successfully');
      fetchLevelRules();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to update level rules');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLevelRuleChange = (level: number, field: string, value: any) => {
    setLevelRules((prev) =>
      prev.map((rule) => (rule.level === level ? { ...rule, [field]: value } : rule))
    );
  };

  const levelRulesColumns = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: number) => <strong>Level {level}</strong>,
    },
    {
      title: 'Commission Type',
      dataIndex: 'commissionType',
      key: 'commissionType',
      width: 150,
      render: (type: string, record: LevelCommissionRule) => (
        <Select
          value={type}
          onChange={(value) => handleLevelRuleChange(record.level, 'commissionType', value)}
          style={{ width: '100%' }}
        >
          <Option value="PERCENTAGE">Percentage</Option>
          <Option value="FIXED">Fixed Amount</Option>
        </Select>
      ),
    },
    {
      title: 'Commission Value',
      dataIndex: 'commissionValue',
      key: 'commissionValue',
      width: 150,
      render: (value: number, record: LevelCommissionRule) => (
        <InputNumber
          value={value}
          onChange={(val) => handleLevelRuleChange(record.level, 'commissionValue', val)}
          style={{ width: '100%' }}
          min={0}
          step={record.commissionType === 'PERCENTAGE' ? 0.1 : 1}
          suffix={record.commissionType === 'PERCENTAGE' ? '%' : '$'}
        />
      ),
    },
    {
      title: 'Min Team Members',
      dataIndex: 'minTeamMembers',
      key: 'minTeamMembers',
      width: 150,
      render: (value: number, record: LevelCommissionRule) => (
        <InputNumber
          value={value}
          onChange={(val) => handleLevelRuleChange(record.level, 'minTeamMembers', val)}
          style={{ width: '100%' }}
          min={0}
        />
      ),
    },
    {
      title: 'Min Active Members',
      dataIndex: 'minActiveMembers',
      key: 'minActiveMembers',
      width: 150,
      render: (value: number, record: LevelCommissionRule) => (
        <InputNumber
          value={value}
          onChange={(val) => handleLevelRuleChange(record.level, 'minActiveMembers', val)}
          style={{ width: '100%' }}
          min={0}
        />
      ),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (active: boolean, record: LevelCommissionRule) => (
        <Switch
          checked={active}
          onChange={(checked) => handleLevelRuleChange(record.level, 'isActive', checked)}
        />
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string, record: LevelCommissionRule) => (
        <Input
          value={desc || ''}
          onChange={(e) => handleLevelRuleChange(record.level, 'description', e.target.value)}
          placeholder="Enter description..."
        />
      ),
    },
  ];

  return (
    <div className="plan-settings">
      <Card title="Plan Configuration Settings" loading={loading}>
        <Tabs defaultActiveKey="withdrawal">
          <TabPane tab="Withdrawal Settings" key="withdrawal">
            <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Minimum Withdrawal Amount"
                    name="WITHDRAWAL_MIN_AMOUNT"
                    help="Minimum amount a user can withdraw"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="$"
                      min={0}
                      step={1}
                      placeholder="Enter minimum amount"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Maximum Withdrawal Amount"
                    name="WITHDRAWAL_MAX_AMOUNT"
                    help="Maximum amount a user can withdraw per request"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="$"
                      min={0}
                      step={1}
                      placeholder="Enter maximum amount"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Withdrawal Charge Type"
                    name="WITHDRAWAL_CHARGE_TYPE"
                    help="Type of charge to apply on withdrawals"
                  >
                    <Select placeholder="Select charge type">
                      <Option value="PERCENTAGE">Percentage</Option>
                      <Option value="FIXED">Fixed Amount</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Withdrawal Charge Value"
                    name="WITHDRAWAL_CHARGE_VALUE"
                    help="Charge value (percentage or fixed amount)"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={0.1}
                      placeholder="Enter charge value"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Withdrawal Processing Time (Hours)"
                name="WITHDRAWAL_PROCESSING_TIME"
                help="Expected time to process withdrawal requests"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={1}
                  placeholder="Enter processing time in hours"
                />
              </Form.Item>

              <Divider />

              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saveLoading}>
                  Save Withdrawal Settings
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
                  Reset
                </Button>
              </Space>
            </Form>
          </TabPane>

          <TabPane tab="E-Pin Settings" key="epin">
            <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="E-Pin Generation Fee (Wallet)"
                    name="EPIN_GENERATION_FEE_PERCENTAGE"
                    help="Fee percentage when user generates E-Pin from wallet"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      suffix="%"
                      min={0}
                      max={100}
                      step={0.1}
                      placeholder="Enter fee percentage"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Default E-Pin Expiry (Days)"
                    name="EPIN_DEFAULT_EXPIRY_DAYS"
                    help="Default expiry period for E-Pins in days"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      step={1}
                      placeholder="Enter expiry days (0 for no expiry)"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Minimum E-Pin Amount"
                name="EPIN_MIN_AMOUNT"
                help="Minimum amount for E-Pin generation"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  min={0}
                  step={1}
                  placeholder="Enter minimum amount"
                />
              </Form.Item>

              <Divider />

              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saveLoading}>
                  Save E-Pin Settings
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
                  Reset
                </Button>
              </Space>
            </Form>
          </TabPane>

          <TabPane tab="Level Commission Rules" key="levels">
            <div style={{ marginBottom: 16 }}>
              <p>Configure commission rules for each level. Users must meet the minimum requirements to earn commissions at each level.</p>
            </div>

            <Table
              columns={levelRulesColumns}
              dataSource={levelRules}
              rowKey="level"
              pagination={false}
              scroll={{ x: 1200 }}
            />

            <Divider />

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveLevelRules}
              loading={saveLoading}
            >
              Save Level Commission Rules
            </Button>
          </TabPane>

          <TabPane tab="Plan Configuration" key="plan">
            <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
              <Form.Item
                label="Total Levels"
                name="TOTAL_LEVELS"
                help="Total number of levels in the MLM plan"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={50}
                  step={1}
                  placeholder="Enter total levels"
                />
              </Form.Item>

              <Form.Item
                label="Activation Required"
                name="ACTIVATION_REQUIRED"
                help="Enable if user activation is required via E-Pin"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Auto Deposit E-Pin Generation"
                name="AUTO_DEPOSIT_EPIN"
                help="Automatically generate E-Pin when deposit is approved"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Minimum Deposit Amount"
                    name="MIN_DEPOSIT_AMOUNT"
                    help="Minimum deposit amount allowed"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="$"
                      min={0}
                      step={1}
                      placeholder="Enter minimum deposit"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Maximum Deposit Amount"
                    name="MAX_DEPOSIT_AMOUNT"
                    help="Maximum deposit amount allowed"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      prefix="$"
                      min={0}
                      step={1}
                      placeholder="Enter maximum deposit"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saveLoading}>
                  Save Plan Configuration
                </Button>
                <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
                  Reset
                </Button>
              </Space>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PlanSettings;
